import { IOrder } from '@/interface'
import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const orderQuery = gql`
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

  query OrdersWithItems($email: String!) {
    orders(where: { email: $email, orderItems_some: {} }) {
      id
      total
      orderItems {
        id
        quantity
        product {
          ...product
        }
      }
    }
  }
`

export interface IOrderQuery {
  orders: IOrder[]
}

interface ListOrderProps {
  email: string
}

export const listOrders = async ({ email }: ListOrderProps) =>
  await client.request<IOrderQuery>(orderQuery, { email })
