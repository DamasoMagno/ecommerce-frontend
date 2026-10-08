'use client'
import { CartItems } from '@/modules/checkout/components/cart-items'
import { CartSummary } from '@/modules/checkout/components/cart-summary'

export function CartOrders() {
  return <div><CartItems /><CartSummary /></div>
}
