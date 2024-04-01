import { gql } from 'graphql-request'
import { client } from '@/lib/graphql'
import { RequestResaleInput } from '@/app/dealer/components/Dealer'

const sendResaleRequestMutation = gql`
  mutation sendResaleRequest(
    $dealer: String!
    $contact: Int!
    $enterprise: String!
    $email: String!
  ) {
    createResale(
      data: {
        dealer: $dealer
        email: $email
        enterprise: $enterprise
        approvedRequest: false
        contact: $contact
      }
    ) {
      approvedRequest
    }

    publishResale(to: PUBLISHED, where: { email: $email }) {
      id
    }
  }
`

const updateResaleRequestMutation = gql`
  mutation updateResale($contact: Int!, $email: String!) {
    updateResale(data: { contact: $contact }, where: { email: $email }) {
      id
    }

    publishResale(to: PUBLISHED, where: { email: $email }) {
      id
    }
  }
`

export const checkExistingRequestQuery = gql`
  query checkExistingRequest($email: String!) {
    resale(where: { email: $email }) {
      id
      approvedRequest
      contact
      enterprise
      dealer
    }
  }
`

interface CreatResaleProps {
  email: string
  dealer: RequestResaleInput
}

export async function sendResaleRequest({ email, dealer }: CreatResaleProps) {
  const { resale } = await getDealerRequest(email)

  if (resale) {
    await client.request(updateResaleRequestMutation, {
      contact: dealer.contact,
      email,
    })

    return
  }

  const { createResale } = await client.request<any>(
    sendResaleRequestMutation,
    {
      email,
      contact: dealer.contact,
      dealer: dealer.dealer,
      enterprise: dealer.enterprise,
    },
  )

  return { createResale }
}

export const getDealerRequest = async (email: string) =>
  await client.request<{ resale: any }>(checkExistingRequestQuery, {
    email,
  })
