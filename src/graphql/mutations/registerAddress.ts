import { IAddress } from '@/interface'
import { AddressInput } from '../../app/cart/components/FormAddress'
import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const registerAddressMutation = gql`
  fragment address on Address {
    id
    street
    number
    zipCode
    complement
    neighborhood
  }

  mutation RegisterAddress(
    $email: String!
    $street: String!
    $neighborhood: String!
    $zipCode: Int!
    $number: Int!
    $complement: String
  ) {
    createAddress(
      data: {
        email: $email
        street: $street
        zipCode: $zipCode
        complement: $complement
        number: $number
        neighborhood: $neighborhood
      }
    ) {
      ...address
    }
    publishAddress(where: { email: $email }, to: PUBLISHED) {
      id
    }
  }
`

interface RegisterAddressProps {
  email: string
  address: AddressInput
}

interface IAddressQuery {
  createAddress: IAddress
}

export const registerAddress = async ({
  email,
  address,
}: RegisterAddressProps) =>
  await client.request<IAddressQuery>(registerAddressMutation, {
    ...address,
    email,
  })
