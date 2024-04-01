import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const updateOrderItemQuery = gql`
  mutation UpdateOrderItem($orderItemId: ID!, $total: Float!, $quantity: Int!) {
    updateOrderItem(
      data: { total: $total, quantity: $quantity, finished: true }
      where: { id: $orderItemId }
    ) {
      id
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

interface IMutationCreatOrderItemProps {
  total: number
  quantity: number
  orderItemId: string
}

interface IOrderItemId {
  updateOrderItem: {
    id: string
  }
}

export async function updateOrderItem({
  total,
  orderItemId,
  quantity,
}: IMutationCreatOrderItemProps) {
  const { updateOrderItem } = await client.request<IOrderItemId>(
    updateOrderItemQuery,
    {
      total,
      orderItemId,
      quantity,
    },
  )

  await client.request(publishCreatedOrderItem, {
    orderItemId: updateOrderItem.id,
  })
}
