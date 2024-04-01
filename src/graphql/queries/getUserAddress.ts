import { IAddress } from '@/interface'
import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const registerAddressQuery = gql`
  query userAddress($email: String!) {
    address(where: { email: $email }) {
      id
      street
      number
      zipCode
      neighborhood
      complement
    }
  }
`

interface IAddressQuery {
  address: IAddress
}

interface QueryAddressProps {
  email: string
}

export const getUserAddress = async ({ email }: QueryAddressProps) =>
  await client.request<IAddressQuery>(registerAddressQuery, { email })
