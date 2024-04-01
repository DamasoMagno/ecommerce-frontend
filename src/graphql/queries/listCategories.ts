import { ICategory } from '@/interface'
import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const categoriesQuery = gql`
  query Categories {
    categories {
      id
      slug
      name
      photo {
        url
      }
    }
  }
`

interface ICategoriesQuery {
  categories: ICategory[]
}

export const listCategories = async () =>
  await client.request<ICategoriesQuery>(categoriesQuery)
