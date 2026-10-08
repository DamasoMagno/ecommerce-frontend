'use server'

import { GraphQLClient, gql } from 'graphql-request'
import { revalidatePath } from 'next/cache'
import { requireBackofficeAccess } from '@/lib/backoffice/access'
import { productSchema } from '@/modules/catalog/schemas/product'
import { IProduct } from '@/interface'
import { isBackofficeMockEnabled } from '@/lib/backoffice/mock-mode'
import { getMockCatalog } from '@/modules/catalog/repositories/mock-catalog'

export interface AssetOption { id: string; url: string; fileName: string | null }
export interface CatalogPage { products: IProduct[]; hasNextPage: boolean; cursor: string | null }

function adminClient() {
  const endpoint = process.env.HYGRAPH_ENDPOINT ?? process.env.NEXT_PUBLIC_HYGRAPH_KEY
  const token = process.env.HYGRAPH_ADMIN_TOKEN
  if (!endpoint || !token) throw new Error('Configure HYGRAPH_ENDPOINT e HYGRAPH_ADMIN_TOKEN no servidor para carregar e salvar produtos.')
  return new GraphQLClient(endpoint, { headers: { authorization: `Bearer ${token}` } })
}

export async function loadProducts(search = '', cursor: string | null = null): Promise<CatalogPage> {
  requireBackofficeAccess()
  if (isBackofficeMockEnabled()) return getMockCatalog().list(search, cursor)
  const result = await adminClient().request<{ productsConnection: {
    edges: { node: IProduct }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null }
  } }>(gql`
    query BackofficeProducts($search: String!, $cursor: String) {
      productsConnection(stage: DRAFT, first: 20, after: $cursor, orderBy: updatedAt_DESC, where: { name_contains: $search }) {
        edges { node { id name slug description price available image { id url } } }
        pageInfo { hasNextPage endCursor }
      }
    }
  `, { search: search.trim().slice(0, 200), cursor })
  const connection = result.productsConnection
  return { products: connection.edges.map(({ node }) => node), hasNextPage: connection.pageInfo.hasNextPage, cursor: connection.pageInfo.endCursor }
}

export async function loadAssets(): Promise<AssetOption[]> {
  requireBackofficeAccess()
  if (isBackofficeMockEnabled()) return getMockCatalog().assets()
  const client = adminClient()
  const assets: AssetOption[] = []
  let cursor: string | null = null
  let hasNextPage = true
  while (hasNextPage) {
    const result: { assetsConnection: { edges: { node: AssetOption }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } = await client.request(gql`
      query BackofficeAssets($cursor: String) {
        assetsConnection(stage: PUBLISHED, first: 100, after: $cursor, where: { mimeType_starts_with: "image/" }) {
          edges { node { id url fileName } }
          pageInfo { hasNextPage endCursor }
        }
      }
    `, { cursor })
    assets.push(...result.assetsConnection.edges.map(({ node }) => node))
    hasNextPage = result.assetsConnection.pageInfo.hasNextPage
    cursor = result.assetsConnection.pageInfo.endCursor
  }
  return assets
}

export async function saveProduct(input: unknown, id?: string) {
  requireBackofficeAccess()
  const parsed = productSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, message: parsed.error.issues[0].message }
  if (id !== undefined && !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) return { success: false as const, message: 'Produto inválido.' }
  if (isBackofficeMockEnabled()) {
    try {
      const product = getMockCatalog().save(parsed.data, id)
      revalidatePath('/backoffice/produtos')
      return { success: true as const, product }
    } catch (error) {
      return { success: false as const, message: error instanceof Error ? error.message : 'Não foi possível salvar o produto de teste.' }
    }
  }
  const { imageId, categoryId, ...fields } = parsed.data
  const data = { ...fields, image: { connect: { id: imageId } } }
  try {
    const client = adminClient()
    // Keep writes in DRAFT until the catalog owner explicitly publishes in Hygraph.
    const response = id
      ? await client.request<{ updateProduct: IProduct }>(gql`
          mutation BackofficeUpdateProduct($id: ID!, $data: ProductUpdateInput!) {
            updateProduct(where: { id: $id }, data: $data) { id name slug description price available image { id url } }
          }
        `, { id, data })
      : await client.request<{ createProduct: IProduct }>(gql`
          mutation BackofficeCreateProduct($data: ProductCreateInput!) {
            createProduct(data: $data) { id name slug description price available image { id url } }
          }
        `, { data })
    const product = 'updateProduct' in response ? response.updateProduct : response.createProduct
    revalidatePath('/backoffice/produtos')
    return { success: true as const, product }
  } catch {
    return { success: false as const, message: 'Não foi possível salvar. Verifique se o endereço é único, se a imagem existe e se o Hygraph permite escrever em Product.' }
  }
}
