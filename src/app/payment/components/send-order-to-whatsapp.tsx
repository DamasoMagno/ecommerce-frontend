'use client'

import { Button } from '@/components/Button'
import { useUserInfo } from '@/context/User'
import { IOrder } from '@/interface'
import { formatPrice } from '@/utils/format-price'
import { sendMessageToWhatsapp } from '@/utils/send-message-to-whatsapp'
import { toast } from 'sonner'

interface T {
  order: IOrder
}

export function SendOrderToWhatsapp({ order }: T) {
  const { user } = useUserInfo()

  function handleSendMessageToWhatsapp() {
    const textFormatted = `
  Nome: ${user?.fullName}
  Email: ${user?.primaryEmailAddress?.emailAddress}

  Endereço:
  Rua: ${order.address.street}
  Bairro: ${order.address.neighborhood}
  Numero: ${order.address.number}
  CEP: ${order.address.zipCode}
  Complemento: ${order.address.complement}

  Pedido:
  Total: ${formatPrice(order.total)}
  Pagamento: ${order.payment}
  Coleta: ${order.delivery}
  Produtos: 
  ${order.orderItems.map((item) => `
  Nome: ${item.product.name}
  Quantidade: ${item.quantity}`)}
  `

    toast.success('Compra finalizada.')
    setTimeout(() => {
      sendMessageToWhatsapp(textFormatted)
    }, 1500)
  }

  return (
    <Button className="w-full" onClick={handleSendMessageToWhatsapp}>
      Finalizar compra
    </Button>
  )
}
