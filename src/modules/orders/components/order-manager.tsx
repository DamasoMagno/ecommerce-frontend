'use client'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Fragment, useState } from 'react'
import { toast } from 'sonner'
import { loadOrders, changeOrderStatus } from '../actions/orders'
import { OrderStatus, statuses, statusLabels, transitions } from '@/lib/backend/schema'
type OrderData = Awaited<ReturnType<typeof loadOrders>>
const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const inputClass = 'rounded-lg border border-border bg-shell px-3 py-3 text-sm'

export function OrderManager({ initialData }: { initialData: OrderData }) {
  const [data, setData] = useState(initialData)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [applied, setApplied] = useState({ search: '', status: '' })
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<string | null>(null)
  async function refresh(page = 1, filters = applied) {
    setLoading(true)
    try { setData(await loadOrders({ search: filters.search, status: filters.status || undefined, page })); setApplied(filters) }
    catch { toast.error('Não foi possível carregar os pedidos.') } finally { setLoading(false) }
  }
  return <>
    <p className="mb-2 text-xs uppercase tracking-widest text-accent">Atendimento e entrega</p><h1 className="text-3xl font-bold">Pedidos</h1><p className="mb-8 mt-2 text-sm text-slate-500">Consulte os detalhes e acompanhe cada etapa do pedido.</p>
    <form onSubmit={(event) => { event.preventDefault(); void refresh(1, { search, status }) }} className="mb-6 flex flex-wrap gap-3"><Input aria-label="Buscar pedido ou cliente" placeholder="Número, nome ou e-mail do cliente" value={search} onChange={(event) => setSearch(event.target.value)} className={`${inputClass} min-w-[200px] flex-1`} /><select aria-label="Filtrar status dos pedidos" value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}><option value="">Todos os status</option>{statuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select><Button disabled={loading} className="rounded-lg bg-accent px-5 py-3 text-sm">{loading ? 'Carregando…' : 'Filtrar pedidos'}</Button></form>
    <div aria-busy={loading} className="overflow-x-auto rounded-xl border border-border bg-surface"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-zinc-500"><tr><th className="p-5">Pedido / cliente</th><th className="p-5">Data</th><th className="p-5">Total</th><th className="p-5">Status</th><th className="p-5">Detalhes</th></tr></thead><tbody className="divide-y divide-zinc-800">{data.orders.map((order) => <Fragment key={order.id}><tr><td className="p-5"><p className="max-w-[200px] truncate text-xs text-accent" title={order.id}>#{order.id}</p><p className="mt-2">{order.customerName}</p><p className="mt-1 text-xs text-zinc-500">{order.email}</p></td><td className="whitespace-nowrap p-5 text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })}</td><td className="whitespace-nowrap p-5">{currency(order.total)}</td><td className="p-5"><select aria-label={`Status do pedido ${order.id}`} value={order.status} disabled={loading || !transitions[order.status].length} className="rounded-lg border border-border bg-shell px-2 py-2 text-xs" onChange={async (event) => {
          const next = event.target.value as OrderStatus
          if (!window.confirm(`Alterar o pedido para “${statusLabels[next]}”?`)) return
          setLoading(true)
          try { const result = await changeOrderStatus({ id: order.id, status: next, expectedStatus: order.status }); if (!result.success) toast.error(result.message); else toast.success('Status atualizado.'); await refresh(data.page) }
          catch { toast.error('Não foi possível atualizar o status.') } finally { setLoading(false) }
        }}><option value={order.status}>{statusLabels[order.status]}</option>{transitions[order.status].map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select></td><td className="p-5"><Button aria-expanded={details === order.id} onClick={() => setDetails(details === order.id ? null : order.id)} className="whitespace-nowrap text-xs text-accent">{details === order.id ? 'Fechar detalhes' : 'Ver detalhes'}</Button></td></tr>
        {details === order.id && <tr><td colSpan={5} className="bg-shell/40 p-6"><div className="grid gap-6 md:grid-cols-2"><div><h2 className="mb-3 font-bold">Itens do pedido</h2>{order.items.map((item) => <p key={item.id} className="mb-2 flex justify-between gap-4 text-sm text-slate-500"><span>{item.quantity} × {item.productName}</span><span>{currency(item.total)}</span></p>)}</div><div className="space-y-2 text-sm text-slate-500"><p>Pagamento: {order.payment}</p><p>Recebimento: {order.delivery}</p><p>{order.address.street}, {order.address.number} · {order.address.neighborhood}</p><p>CEP: {order.address.zipCode}</p>{order.paidAt && <p>Pago em: {new Date(order.paidAt).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })}</p>}</div></div></td></tr>}
      </Fragment>)}</tbody></table>{!data.orders.length && <p className="p-10 text-center text-slate-500">Nenhum pedido encontrado para os filtros.</p>}
      <div className="flex items-center justify-between gap-4 border-t border-border p-4 text-xs text-slate-500"><span>{data.total} pedidos · página {data.page} de {data.pages}</span><div className="flex gap-4"><Button disabled={loading || data.page <= 1} onClick={() => void refresh(data.page - 1)}>Anterior</Button><Button disabled={loading || data.page >= data.pages} onClick={() => void refresh(data.page + 1)}>Próxima</Button></div></div>
    </div>
  </>
}
