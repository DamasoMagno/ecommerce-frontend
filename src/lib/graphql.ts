import { GraphQLClient } from 'graphql-request'

const hygraphUrl = String(process.env.NEXT_PUBLIC_HYGRAPH_KEY)
const hygraphToken = String(process.env.NEXT_PUBLIC_HYGRAPH_TOKEN)
const localDemo = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_LOCAL_DEMO === 'true'
const demoEndpoint = typeof window === 'undefined'
  ? 'http://127.0.0.1:3000/api/mock/graphql'
  : '/api/mock/graphql'

export const client = new GraphQLClient(localDemo ? demoEndpoint : hygraphUrl, {
  headers: localDemo ? {} : {
    authorization: `Bearer ${hygraphToken}`,
  },
})
