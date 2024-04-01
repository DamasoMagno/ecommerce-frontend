import { IOrderItem } from '@/interface'
import { formatPrice } from '@/utils/format-price'

interface OrderProps {
  order: IOrderItem
}

export function Order({ order }: OrderProps) {
  return (
    <li className="rounded-lg text-sm text-white flex justify-between p-4 border-[#2A2A2A] border-2">
      <strong className="flex gap-2">
        <span>{order.quantity}x</span>
        {order.product.name}
      </strong>
      <span>{formatPrice(order.total)}</span>
    </li>
  )
}
