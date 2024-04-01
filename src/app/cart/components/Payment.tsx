"use client"
import { ChangeEvent } from "react";
import { useCart } from "@/context/Cart";

export function Payment() {
  const { setPayment } = useCart()

  const selectPaymentMethod = (event: ChangeEvent<HTMLSelectElement>) => {
    const payment = event.target.value as "Pix" | "Card" | "Money";

    setPayment(state => {
      return {
        ...state,
        payment
      }
    })
  }

  const selectColectMethod = (event: ChangeEvent<HTMLSelectElement>) => {
    const collectMethod = event.target.value as "Entrega" | "Retirada"

    setPayment(state => {
      return {
        ...state,
        delivery: collectMethod
      }
    })
  }

  return (
    <div className="flex flex-col gap-4 mt-9">
      <div className="flex flex-col gap-2">
        <label htmlFor="payment" className="text-white text-sm">
          Pagamento
        </label>

        <select
          id="payment"
          onChange={selectPaymentMethod}
          className="bg-input border-[#1A1A1A] border-2 rounded-md text-white p-2 h-12"
        >
          <option value="Pix">Pix</option>
          <option value="Card">Cartão</option>
          <option value="Money">Dinheiro</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="delivery" className="text-white text-sm">
          Entrega
        </label>

        <select
          id="delivery"
          onChange={selectColectMethod}
          className="bg-input border-[#1A1A1A] border-2 rounded-md text-white p-2 h-12"
        >
          <option value="Entrega">Entrega a domicilio</option>
          <option value="Retirada">Retirada</option>
        </select>
      </div>
    </div >
  )
}
