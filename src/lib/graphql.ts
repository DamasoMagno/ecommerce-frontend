import { GraphQLClient } from 'graphql-request'

const hygraphUrl = String(process.env.NEXT_PUBLIC_HYGRAPH_KEY)
const hygraphToken = String(process.env.NEXT_PUBLIC_HYGRAPH_TOKEN)

export const client = new GraphQLClient(hygraphUrl, {
  headers: {
    authorization: `Bearer ${hygraphToken}`,
  },
})
