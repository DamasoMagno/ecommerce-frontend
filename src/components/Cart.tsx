'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { ShoppingBag, ShoppingCart, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useCart } from '@/context/Cart'

import { Button } from './Button'
import { CartOrders } from './CartOrders'
import { Badge } from './Badge'

export function CartModal() {
  const router = useRouter()
  const { orderItems } = useCart()

  const cartHasProducts = orderItems.length > 0
  const submitCheckoutIsDisabled = orderItems.length < 1

  async function navigateToCart() {
    router.push('/cart')
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div className="relative">
          <button className="bg-transparent flex justify-center items-center text-white border-[#2A2A2A] border-2 rounded-lg w-9 h-9">
            <ShoppingCart className="text-white" size={14} />
          </button>

          {cartHasProducts && (
            <div className="absolute bg-[#5033C3] w-3 h-3 rounded-3xl bottom-0 right-0 translate-y-1 translate-x-1" />
          )}
        </div>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content className="z-50 fixed top-0 right-0 h-full w-[95vw] max-w-[450px] text-white rounded-[6px] bg-[#0B0B0B] px-6 py-4 flex flex-col">
          <Dialog.Title className="flex items-center justify-between">
            <Badge>
              <ShoppingBag /> Carrinho
            </Badge>

            <Dialog.Close asChild>
              <button>
                <X />
              </button>
            </Dialog.Close>
          </Dialog.Title>

          <CartOrders />

          <Button onClick={navigateToCart} disabled={submitCheckoutIsDisabled}>
            Finalizar Compra
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
