import { IOrderItem } from '@/interface'
import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const createOrderItemMutation = gql`
  fragment product on Product {
    id
    name
    price
    image {
      id
      url
    }
    coupon {
      discount
    }
  }

  mutation CreateOrderItem($total: Float!, $slug: String!, $email: String!) {
    createOrderItem(
      data: {
        quantity: 1
        total: $total
        email: $email
        finished: false
        product: { connect: { slug: $slug } }
      }
    ) {
      id
      total
      quantity
      product {
        ...product
      }
    }
  }
`

const publishCreatedOrderItem = gql`
  mutation PublicOrderItem($orderItemId: ID!) {
    publishOrderItem(to: PUBLISHED, where: { id: $orderItemId }) {
      id
    }
  }
`

interface CreatOrderItemProps {
  total: number
  email: string
  slug: string
}

interface ICreateOrderItem {
  createOrderItem: IOrderItem
}

export async function createOrderItem({
  total,
  slug,
  email,
}: CreatOrderItemProps) {
  const { createOrderItem } = await client.request<ICreateOrderItem>(
    createOrderItemMutation,
    {
      total,
      slug,
      email,
    },
  )

  await client.request(publishCreatedOrderItem, {
    orderItemId: createOrderItem.id,
  })

  return createOrderItem
}
