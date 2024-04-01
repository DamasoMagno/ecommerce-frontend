import { IProduct } from '@/interface'
import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const productsQuery = gql`
  fragment product on Product {
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

  query ProductsByCategory($category: String!) {
    category(where: { slug: $category }) {
      id
      name
      products {
        ...product
      }
    }
  }
`

interface IProductsQuery {
  category: {
    id: string
    name: string
    products: IProduct[]
  }
}

interface ListProductsProps {
  category: string
}

export const listProductsByCategory = async ({ category }: ListProductsProps) =>
  await client.request<IProductsQuery>(productsQuery, { category })
