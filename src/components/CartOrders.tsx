'use client'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Trash } from 'lucide-react'
import { formatPrice } from '@/utils/format-price'

import { useCart } from '@/context/Cart'
import { useCartPrice } from '@/hooks/useCartPrice'

export function CartOrders() {
  const {
    orderItems,
    deleteProductFromCart,
    incrementProductQuantity,
    decrementProductQuantity,
    payment,
  } = useCart()
  const { cartFormatted } = useCartPrice()

  return (
    <div className="h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden">
      {orderItems.map((item) => {
        return (
          <div
            className="mt-8 flex justify-between items-center text-white"
            key={item.id}
          >
            <div className="flex">
              <div className="bg-[#1A1A1A] p-4 rounded-md flex justify-center items-center w-20 h-20 mr-4 relative">
                <Image
                  src={item.product.image.url}
                  alt=""
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="object-contain h-auto w-auto"
                />
              </div>

              <div className="flex flex-col">
                <p className="text-white rounded-sm text-sm">
                  {item.product.name}
                </p>

                <div className="flex items-center gap-2">
                  <strong className="text-white text-base">
                    {formatPrice(item.total)}
                  </strong>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <button
                    className="border-[#2A2A2A] border-2 rounded-md flex justify-center items-center w-9 h-9 hover:border-[#202020] transition"
                    onClick={() => decrementProductQuantity(item.id)}
                  >
                    <ArrowLeft size={14} />
                  </button>

                  <span className="text-base text-white">{item.quantity}</span>

                  <button
                    className="border-[#2A2A2A] border-2 rounded-md flex justify-center items-center w-9 h-9 hover:border-[#202020] transition"
                    onClick={() => incrementProductQuantity(item.id)}
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            <button
              className="border-[#2A2A2A] border-2 rounded-md flex justify-center items-center w-9 h-9 hover:border-[#202020] transition"
              onClick={() => deleteProductFromCart(item.id)}
            >
              <Trash size={14} />
            </button>
          </div>
        )
      })}

      <ul className="mt-8 flex flex-col gap-4 text-white">
        <li className="border-b-[2px] border-[#2A2A2A] pb-4 flex items-center justify-between text-sm">
          <span>Entrega</span>
          <span>
            {payment.delivery === 'Retirada' ? 'GRÁTIS' : formatPrice(5)}
          </span>
        </li>
        <li className="border-b-[2px] border-[#2A2A2A] pb-4 flex items-center justify-between text-sm">
          <span>Descontos</span>
          <span>- {formatPrice(cartFormatted.discount)}</span>
        </li>
        <li className="flex items-center justify-between text-base">
          <strong>Total</strong>
          <strong>{formatPrice(cartFormatted.total)}</strong>
        </li>
      </ul>
    </div>
  )
}
