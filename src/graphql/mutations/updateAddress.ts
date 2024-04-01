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

  mutation UpdateAddress(
    $email: String!
    $updatedAddress: AddressUpdateInput!
  ) {
    updateAddress(where: { email: $email }, data: $updatedAddress) {
      ...address
    }

    publishAddress(where: { email: $email }, to: PUBLISHED) {
      id
    }
  }
`

interface RegisterAddressProps {
  updatedAddress: AddressInput
  email: string
}

interface IUpdateAddress {
  updateAddress: IAddress
}

export async function updateAddress({
  updatedAddress,
  email,
}: RegisterAddressProps) {
  const { updateAddress } = await client.request<IUpdateAddress>(
    registerAddressMutation,
    {
      email,
      updatedAddress,
    },
  )

  return {
    updateAddress,
  }
}
