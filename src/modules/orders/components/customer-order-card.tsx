'use client'

import Image from 'next/image'
import { useId, useState } from 'react'
import { ChevronDown, CreditCard, MapPin, Package } from 'lucide-react'
import { IOrder } from '@/interface'
import { Button } from '@/components/Button'
import { formatPrice } from '@/utils/format-price'
import { statusLabels, OrderStatus } from '../schemas/order'

const statusStyles: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-400/10 text-amber-800', PAID: 'bg-blue-400/10 text-blue-700',
  PROCESSING: 'bg-violet-400/10 text-accent', SHIPPED: 'bg-sky-400/10 text-sky-700',
  COMPLETED: 'bg-emerald-400/10 text-emerald-700', CANCELLED: 'bg-red-400/10 text-red-700',
}
const paymentLabels = { Pix: 'Pix', Card: 'Cartão', Money: 'Dinheiro' }

export function CustomerOrderCard({ order }: { order: IOrder; position?: number }) {
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()
  const date = order.createdAt && !Number.isNaN(Date.parse(order.createdAt))
    ? new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Fortaleza' }) : 'Data não informada'
  const quantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)

  return <article className="overflow-hidden rounded-2xl border border-border bg-surface/50">
    <div className="space-y-5 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="break-all text-sm font-semibold text-slate-800">Pedido #{order.id}</h2><p className="mt-1 text-xs text-slate-500">{date}</p></div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${order.status ? statusStyles[order.status] : 'bg-stone-100 text-slate-600'}`}>{order.status ? statusLabels[order.status] : 'Status não informado'}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex shrink-0 -space-x-3" aria-hidden="true">{order.orderItems.slice(0, 3).map((item) => <div key={item.id} className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-zinc-900 bg-stone-100 p-2"><Image src={item.product.image.url} alt="" width={40} height={40} className="h-10 w-10 object-contain" /></div>)}</div>
        <div className="min-w-0"><p className="truncate text-sm text-slate-700">{order.orderItems[0]?.product.name ?? 'Pedido sem itens'}</p><p className="mt-1 text-xs text-slate-500">{quantity} {quantity === 1 ? 'item' : 'itens'}{order.orderItems.length > 1 ? ` · ${order.orderItems.length} produtos` : ''}</p></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <div><p className="text-xs text-slate-500">Total do pedido</p><p className="mt-1 text-xl font-bold text-slate-800">{formatPrice(order.total)}</p></div>
        <Button aria-expanded={expanded} aria-controls={detailsId} onClick={() => setExpanded(!expanded)} className="h-10 border border-violet-400/20 bg-violet-400/10 px-4 text-sm text-accent hover:bg-violet-400/20">{expanded ? 'Fechar detalhes' : 'Ver detalhes'}<ChevronDown size={16} className={expanded ? 'rotate-180' : ''} /></Button>
      </div>
    </div>
    <div id={detailsId} hidden={!expanded} className="border-t border-border bg-shell/30 p-5 md:p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800"><Package size={16} />Itens do pedido</h3>
      <ul className="divide-y divide-zinc-800">{order.orderItems.map((item) => <li key={item.id} className="flex items-center gap-3 py-4 first:pt-0"><Image src={item.product.image.url} alt={item.product.name} width={56} height={56} className="h-14 w-14 shrink-0 rounded-lg bg-stone-100 object-contain p-2" /><div className="min-w-0 flex-1"><p className="text-sm text-slate-800">{item.product.name}</p><p className="mt-1 text-xs text-slate-500">Quantidade: {item.quantity}</p></div>{item.total !== undefined && <span className="shrink-0 text-sm font-medium text-slate-800">{formatPrice(item.total)}</span>}</li>)}</ul>
      <div className="mt-5 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
        <div><h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800"><CreditCard size={16} />Pagamento</h3><p className="mt-2 text-sm text-slate-500">{paymentLabels[order.payment] ?? 'Não informado'}</p>{order.paidAt && <p className="mt-1 text-xs text-slate-500">Pago em {new Date(order.paidAt).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })}</p>}</div>
        <div><h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800"><MapPin size={16} />{order.delivery === 'Retirada' ? 'Retirada na loja' : 'Entrega'}</h3>{order.delivery === 'Entrega' && order.address ? <div className="mt-2 space-y-1 text-sm text-slate-500"><p>{order.address.street}, {order.address.number}</p><p>{order.address.neighborhood} · CEP {String(order.address.zipCode).padStart(8, '0').replace(/(\d{5})(\d{3})/, '$1-$2')}</p>{order.address.complement && <p>{order.address.complement}</p>}</div> : <p className="mt-2 text-sm text-slate-500">{order.delivery === 'Retirada' ? 'Recebimento no estabelecimento.' : 'Não informada'}</p>}</div>
      </div>
    </div>
  </article>
}
