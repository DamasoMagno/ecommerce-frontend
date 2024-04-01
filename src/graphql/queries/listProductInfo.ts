import { IProduct } from '@/interface'
import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const productQuery = gql`
  query Product($slug: String!) {
    product(where: { slug: $slug }) {
      id
      image {
        url
      }
      name
      slug
      description
      coupon {
        discount
      }
      price
      available
    }
  }
`

interface IProductQuery {
  product: IProduct
}

interface IQueryProductProps {
  slug: string
}

export const listProductInfo = async ({ slug }: IQueryProductProps) =>
  await client.request<IProductQuery>(productQuery, { slug })
