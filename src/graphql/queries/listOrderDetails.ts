import { IAddress, IOrderItem } from '@/interface'
import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const orderDetailsQuery = gql`
  fragment address on Address {
    id
    street
    number
    zipCode
    neighborhood
    complement
  }

  fragment product on Product {
    id
    image {
      url
    }
    coupon {
      discount
    }
    name
    price
  }

  fragment orderItem on OrderItem {
    id
    quantity
    total
    product {
      ...product
    }
  }

  query orderDetails($id: ID!, $userId: String!) {
    orders(where: { id: $id, userId: $userId }) {
      id
      email
      total
      payment
      delivery
      address {
        ...address
      }
      orderItems {
        ...orderItem
      }
    }
  }
`

interface IOrder {
  orders: {
    id: string
    email: string
    payment: 'Pix' | 'Card' | 'Money'
    delivery: 'Retirada' | 'Entrega'
    total: number
    address: IAddress
    orderItems: IOrderItem[]
  }[]
}

interface ListOrderDetailsProps {
  orderId: string
  userId: string
}

export const listOrderDetails = async ({
  orderId,
  userId,
}: ListOrderDetailsProps) => {
  const response = await client.request<IOrder>(orderDetailsQuery, {
    id: orderId,
    userId,
  })

  const order = response.orders?.[0]
  return order
}
