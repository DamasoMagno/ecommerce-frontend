import { IAddress, IOrderItem } from '@/interface'
import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const createOrderItemMutation = gql`
  fragment address on Address {
    id
    street
    complement
    zipCode
    number
    neighborhood
  }

  fragment orderItem on OrderItem {
    quantity
    total
    product {
      name
      price
    }
  }

  mutation CreateOrder(
    $addressId: ID!
    $orderItemId: [OrderItemWhereUniqueInput!]
    $email: String!
    $total: Float!
    $payment: Payment!
    $delivery: Delivery!
    $userId: String!
  ) {
    createOrder(
      data: {
        address: { connect: { id: $addressId } }
        orderItems: { connect: $orderItemId }
        email: $email
        total: $total
        payment: $payment
        delivery: $delivery
        userId: $userId
      }
    ) {
      id
      email
      payment
      total
      address {
        ...address
      }
      orderItems {
        ...orderItem
      }
    }
  }
`

const publishOrder = gql`
  mutation PublishOrder($orderId: ID!) {
    publishOrder(to: PUBLISHED, where: { id: $orderId }) {
      id
    }
  }
`

const publishOrderItem = gql`
  mutation PublishOrderItems($orderItemIds: [ID!]) {
    publishManyOrderItemsConnection(
      to: PUBLISHED
      where: { id_in: $orderItemIds }
    ) {
      edges {
        node {
          id
        }
      }
    }
  }
`

interface CreatOrderProps {
  email: string
  userId: string
  addressId: string
  payment: 'Pix' | 'Card' | 'Money'
  delivery: 'Retirada' | 'Entrega'
  total: number
  orderItemId: {
    id: string
  }[]
}

interface ICreateOrder {
  createOrder: {
    id: string
    email: string
    userId: string
    address: IAddress
    payment: 'Pix' | 'Card' | 'Money'
    delivery: 'Retirada' | 'Entrega'
    total: number
    orderItems: IOrderItem[]
  }
}

export async function createOrder({
  userId,
  email,
  addressId,
  total,
  payment,
  delivery,
  orderItemId,
}: CreatOrderProps) {
  const { createOrder } = await client.request<ICreateOrder>(
    createOrderItemMutation,
    {
      email,
      total,
      payment,
      addressId,
      orderItemId,
      userId,
      delivery,
    },
  )

  const orderItemToFinishId = orderItemId.map((item) => item.id)

  await client.request(publishOrderItem, {
    orderItemIds: orderItemToFinishId,
  })

  await client.request(publishOrder, {
    orderId: createOrder.id,
  })

  return createOrder
}
