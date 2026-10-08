import Image from 'next/image'
import { redirect } from 'next/navigation'
import { gql } from 'graphql-request'
import { QrCodePix } from 'qrcode-pix'
import { auth } from '@clerk/nextjs'

import { listOrderDetails } from '@/graphql/queries/listOrderDetails'
import { formatPrice } from '@/utils/format-price'

import { Header } from '@/components/Header'
import { Code } from '../components/code'
import { SendOrderToWhatsapp } from '../components/send-order-to-whatsapp'
import { Order } from '../components/order'
import { client } from '@/lib/graphql'
import Link from 'next/link'
import { isLocalMockAuthenticationEnabled, isStorefrontMockEnabled } from '@/lib/backoffice/mock-mode'
import { mockCustomer } from '@/mocks/customer'
import { getMockCommerce } from '@/mocks/commerce'

interface Props {
  params: {
    orderId: string
  }
}

export default async function Payment({ params }: Props) {
  const demo = isStorefrontMockEnabled()
  const { userId } = isLocalMockAuthenticationEnabled() ? { userId: mockCustomer.id } : auth()
  const order = demo ? getMockCommerce().orders().find((item) => item.id === params.orderId && item.userId === userId) : await listOrderDetails({
    orderId: params.orderId,
    userId: String(userId),
  })

  if (!order) {
    return redirect('/')
  }

  if (demo) return <><Header /><main className="mx-auto my-10 max-w-xl space-y-5 rounded-xl border border-border bg-surface p-8 text-slate-800">
    <p className="text-sm text-amber-800">Pedido fictício · nenhum pagamento será cobrado</p><h1 className="text-2xl font-bold">Pedido de teste recebido</h1>
    <p>Total: {formatPrice(Number(order.total))}</p><p>Pagamento: {order.payment} · {order.delivery}</p>
    <ul className="space-y-3">{order.orderItems.map((item) => <li key={item.id}>{item.quantity} × {item.product.name}</li>)}</ul>
    <p className="text-sm text-slate-500">{order.address.street}, {order.address.number} · {order.address.neighborhood}</p>
    <div className="flex gap-5 text-accent"><Link href="/orders">Meus pedidos</Link><Link href="/">Voltar à loja</Link></div>
  </main></>

  const { enterpriseInfos } = await client.request<{
    enterpriseInfos: { pix: string }[]
  }>(gql`
    query WhatsappContact {
      enterpriseInfos(first: 1) {
        pix
      }
    }
  `)

  const generateDynamicPix = async () => {
    const qrCodePix = QrCodePix({
      version: '01',
      city: 'Itapipoca',
      key: enterpriseInfos[0].pix,
      name: order.email,
      transactionId: order.id,
      value: Number(order.total),
    })

    const qrCode = await qrCodePix.base64()
    const code = qrCodePix.payload()

    return {
      qrCode,
      code,
    }
  }

  const { code, qrCode } = await generateDynamicPix()

  return (
    <>
      <Header />

      <main className="flex flex-col items-center max-w-md w-[90%] mx-auto my-4 bg-shell/40 px-6 py-12 rounded-md max-h-[85vh] overflow-y-scroll [&::-webkit-scrollbar]:hidden">
        <div className="w-full p-4 flex flex-col items-center gap-4 relative">
          {order.payment === 'Pix' ? (
            <>
              <Image
                src={qrCode}
                alt=""
                sizes="100vw"
                width={0}
                height={0}
                className="w-auto"
              />

              <Code code={code} />
            </>
          ) : (
            <Image
              src="/images/delivery.png"
              alt=""
              sizes="100vw"
              width={0}
              height={0}
              className="w-auto"
            />
          )}

          <SendOrderToWhatsapp order={order} />
        </div>

        <div className="mt-8 w-full flex flex-col">
          <span className="p-4 rounded-lg font-bold border-2 border-[#5033C3] text-slate-800 flex justify-between">
            <strong>Total:</strong>
            {formatPrice(Number(order.total))}
          </span>

          <ul className="list-none w-full mt-2 flex flex-col gap-2 mb-2">
            {order.orderItems.map((order) => (
              <Order key={order.id} order={order} />
            ))}
          </ul>

          <div className="h-[1px] w-full bg-shell/100 my-4 rounded-xl" />

          <ul className="flex flex-col gap-2">
            <li className="rounded-lg text-sm text-slate-800 flex justify-between p-4 border-border border-2">
              <span>Pagamento:</span>
              <span>{order.payment}</span>
            </li>
            <li className="rounded-lg text-sm text-slate-800 flex justify-between p-4 border-border border-2">
              <span>Receber:</span>
              <span>{order.delivery}</span>
            </li>
            <li className="rounded-lg text-sm text-slate-800 flex justify-between p-4 border-border border-2">
              <span>Rua</span>
              <span>{order.address.street}</span>
            </li>
            <li className="rounded-lg text-sm text-slate-800 flex justify-between p-4 border-border border-2">
              <span>Número</span>
              <span>{order.address.number}</span>
            </li>
            <li className="rounded-lg text-sm text-slate-800 flex justify-between p-4 border-border border-2">
              <span>Bairro</span>
              <span>{order.address.neighborhood}</span>
            </li>
            <li className="rounded-lg text-sm text-slate-800 flex justify-between p-4 border-border border-2">
              <span>CEP</span>
              <span>{order.address.zipCode}</span>
            </li>
            <li className="rounded-lg text-sm text-slate-800 flex justify-between p-4 border-border border-2">
              <span>Complemento</span>
              <span>{order.address.complement}</span>
            </li>
          </ul>
        </div>
      </main>
    </>
  )
}
