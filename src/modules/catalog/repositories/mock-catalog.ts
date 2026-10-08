import { randomUUID } from 'node:crypto'
import { IProduct } from '@/interface'
import { mockAssets, mockProducts, mockCategories } from '@/mocks/catalog'
import { categorySchema } from '../schemas/category'
import { createMockCompany } from '@/modules/company/repositories/mock-company'
import { productSchema, ProductInput } from '@/modules/catalog/schemas/product'

function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function createMockCatalog() {
  let products: IProduct[] = copy(mockProducts)
  let categories = copy(mockCategories).map((category, index) => ({ ...category, imageId: mockAssets[index].id }))
  const assets: { id: string; url: string; fileName: string | null }[] = copy(mockAssets)
  const company = createMockCompany(() => assets)
  assets.push({ id: 'mock_logo', url: '/images/logo.jpg', fileName: 'logo.jpg' })
  return {
    all() { return copy(products) },
    categories() { return copy(categories.map((category) => ({ ...category, productCount: products.filter((product) => product.categoryId === category.id).length }))) },
    saveCategory(input: unknown, id?: string) {
      const fields = categorySchema.parse(input)
      if (categories.some((category) => category.slug === fields.slug && category.id !== id)) throw new Error('Já existe uma categoria com esse endereço.')
      const existing = categories.find((category) => category.id === id)
      if (id && !existing) throw new Error('Categoria não encontrada.')
      const image = fields.imageId ? assets.find((asset) => asset.id === fields.imageId) : null
      if (fields.imageId && !image) throw new Error('Imagem não encontrada.')
      const category = { ...fields, id: id ?? `mock_category_${randomUUID()}`, imageId: fields.imageId ?? '', photo: { url: image?.url ?? '/images/mock/acessorios.svg' } }
      categories = [...categories.filter((category) => category.id !== id), category]
      return copy(category)
    },
    deleteCategory(id: string) {
      if (!categories.some((category) => category.id === id)) throw new Error('Categoria não encontrada.')
      if (products.some((product) => product.categoryId === id)) throw new Error('Mova os produtos para outra categoria antes de excluir.')
      categories = categories.filter((category) => category.id !== id)
    },
    company() { return company.read() },
    saveCompany(input: unknown) { return company.save(input) },
    addAsset(asset: { id: string; url: string; fileName: string }) {
      assets.push(copy(asset)); return copy(asset)
    },
    list(search = '', cursor: string | null = null) {
      const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      const filtered = products.filter((product) => normalize(product.name).includes(normalize(search.trim().slice(0, 200))))
      const cursorIndex = cursor ? filtered.findIndex((product) => product.id === cursor) : -1
      if (cursor && cursorIndex === -1) throw new Error('A lista mudou. Faça a busca novamente.')
      const start = cursorIndex + 1
      const page = filtered.slice(start, start + 20)
      return { products: copy(page), hasNextPage: start + 20 < filtered.length, cursor: page[page.length - 1]?.id ?? null }
    },
    assets() { return copy(assets) },
    save(input: ProductInput, id?: string) {
      const { imageId, ...fields } = productSchema.parse(input)
      const asset = assets.find((item) => item.id === imageId)
      if (!asset) throw new Error('Selecione uma imagem válida.')
      if (fields.categoryId && !categories.some((category) => category.id === fields.categoryId)) throw new Error('Categoria não encontrada.')
      if (products.some((product) => product.slug === fields.slug && product.id !== id)) throw new Error('Já existe um produto com esse endereço.')
      const existing = id ? products.find((product) => product.id === id) : undefined
      if (id && !existing) throw new Error('Produto não encontrado.')
      const product: IProduct = { ...existing, ...fields, id: id ?? `mock_${randomUUID()}`, image: { id: asset.id, url: asset.url } }
      products = [product, ...products.filter((item) => item.id !== product.id)]
      return copy(product)
    },
  }
}

// Reiniciar o servidor restaura os exemplos; hot reload mantém as alterações.
const mockGlobal = globalThis as typeof globalThis & { newbyteMockCatalog?: ReturnType<typeof createMockCatalog> }
export function getMockCatalog() {
  if (!mockGlobal.newbyteMockCatalog) mockGlobal.newbyteMockCatalog = createMockCatalog()
  return mockGlobal.newbyteMockCatalog
}
