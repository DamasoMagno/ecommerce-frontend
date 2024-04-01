import { IProduct } from '@/interface'
import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const productsQuery = gql`
  query ProductsByName($name: String!) {
    products(where: { name_contains: $name }) {
      id
      name
      slug
      image {
        url
      }
      coupon {
        discount
      }
      price
    }
  }
`

interface IProductsQuery {
  products: IProduct[]
}

interface ListProductsProps {
  name: string
}

export const listProductsByName = async ({ name }: ListProductsProps) =>
  await client.request<IProductsQuery>(productsQuery, { name })
