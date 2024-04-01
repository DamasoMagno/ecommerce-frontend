import { useCart } from '@/context/Cart'
import { IOrderItem } from '@/interface'

export function useCartPrice() {
  const { orderItems } = useCart()

  const cartFormatted = orderItems.reduce(
    (acc: { total: number; discount: number }, orderItem: IOrderItem) => {
      const { product } = orderItem

      if (product.coupon) {
        const productDiscountedPrice =
          (product.coupon.discount / 100) * product.price * orderItem.quantity
        acc.discount += productDiscountedPrice
      }

      acc.total = orderItem.total + acc.total
      return acc
    },
    {
      total: 0,
      discount: 0,
    },
  )

  return {
    cartFormatted,
  }
}
