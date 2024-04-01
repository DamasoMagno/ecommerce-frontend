import { IOrderItem } from '@/interface'
import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

const orderItemQuery = gql`
  fragment product on Product {
    id
    name
    price
    image {
      url
    }
    coupon {
      discount
    }
  }

  query OrderItems($email: String!) {
    orderItems(where: { email: $email, finished: false }) {
      id
      total
      finished
      quantity
      product {
        ...product
      }
    }
  }
`

export interface IOrderItemQuery {
  orderItems: IOrderItem[]
}

interface IGetOrderItemsProps {
  email: string
}

export const getOrderItems = async ({ email }: IGetOrderItemsProps) =>
  await client.request<IOrderItemQuery>(orderItemQuery, { email })
