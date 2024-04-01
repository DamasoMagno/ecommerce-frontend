import { IProduct } from '@/interface'
import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const listMainCategoriesQuery = gql`
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

  query MainCategories {
    categories(first: 4, where: { products_empty: false }) {
      id
      slug
      name
      products {
        ...product
      }
    }
  }
`

export interface ICategories {
  categories: {
    id: string
    name: string
    slug: string
    products: IProduct[]
  }[]
}

export const listMainCategories = async () =>
  await client.request<ICategories>(listMainCategoriesQuery)
