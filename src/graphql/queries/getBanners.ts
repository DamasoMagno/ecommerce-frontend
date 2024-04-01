import { gql } from 'graphql-request'
import { client } from '@/lib/graphql'

const bannersQuery = gql`
  query Resume {
    banners {
      id
      image {
        id
        url
      }
    }
  }
`

export interface IBannerQuery {
  banners: {
    id: string
    image: {
      id: string
      url: string
    }
  }[]
}

export const getBanners = async () =>
  await client.request<IBannerQuery>(bannersQuery)
