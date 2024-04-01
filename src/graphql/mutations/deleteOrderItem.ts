import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const deleteOrderItemMutation = gql`
  mutation DeleteOrderItem($orderItemId: ID!) {
    deleteOrderItem(where: { id: $orderItemId }) {
      id
    }
  }
`

interface CreatOrderItemProps {
  orderItemId: string
}

export const deleteOrderItem = async ({ orderItemId }: CreatOrderItemProps) =>
  await client.request(deleteOrderItemMutation, { orderItemId })
