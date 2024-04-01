"use client"
import { Button } from "@/components/Button";
import { CartOrders } from "@/components/CartOrders";
import { useCart } from "@/context/Cart";
import { useMutation } from "@tanstack/react-query";

export function Orders() {
  const { checkout, orderItems } = useCart()
  const submitCheckoutIsDisabled = orderItems.length < 1

  const { isPending, mutate } = useMutation({
    mutationFn: async () => await checkout()
  })

  const handleSubmitCheckout = () => mutate()

  return (
    <section className="flex flex-col gap-4">
      <CartOrders />
      <Button
        disabled={submitCheckoutIsDisabled}
        loading={isPending}
        onClick={handleSubmitCheckout}
      >
        Finalizar Compra
      </Button>
    </section>
  )
}