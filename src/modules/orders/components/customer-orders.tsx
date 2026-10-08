'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Package, RefreshCw, Search, ShoppingBag, Truck } from 'lucide-react'
import { useUserInfo } from '@/context/User'
import { listOrders } from '@/graphql/queries/listOrders'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { CustomerOrderCard } from './customer-order-card'

const filters = [{ value: 'all', label: 'Todos' }, { value: 'active', label: 'Em andamento' }, { value: 'completed', label: 'Concluídos' }, { value: 'cancelled', label: 'Cancelados' }] as const

export function CustomerOrders() {
  const { user, userLoaded } = useUserInfo()
  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    enabled: Boolean(email), queryKey: ['orders', email], queryFn: () => listOrders({ email }), refetchInterval: 30000,
  })
  const orders = [...(data?.orders ?? [])].sort((a, b) => (Date.parse(b.createdAt ?? '') || 0) - (Date.parse(a.createdAt ?? '') || 0))
  const active = orders.filter((order) => order.status && !['COMPLETED', 'CANCELLED'].includes(order.status)).length
  const completed = orders.filter((order) => order.status === 'COMPLETED').length
  const visible = orders.filter((order) => {
    const statusMatches = filter === 'all' || (filter === 'active' ? order.status && !['COMPLETED', 'CANCELLED'].includes(order.status) : order.status === (filter === 'completed' ? 'COMPLETED' : 'CANCELLED'))
    const text = `${order.id} ${order.orderItems.map((item) => item.product.name).join(' ')}`.toLocaleLowerCase('pt-BR')
    return statusMatches && text.includes(search.trim().toLocaleLowerCase('pt-BR'))
  })
  if (!userLoaded || isLoading) return <div role="status" aria-label="Carregando pedidos" className="animate-pulse space-y-5"><div className="h-12 w-56 rounded-xl bg-stone-100" /><div className="h-24 rounded-xl bg-stone-100" /><div className="h-64 rounded-xl bg-stone-100" /><span className="sr-only">Carregando pedidos…</span></div>
  if (!email) return <div className="rounded-2xl border border-border p-10 text-center text-slate-800"><ShoppingBag className="mx-auto mb-4 text-accent" /><h1 className="text-2xl font-bold">Seus pedidos em um só lugar</h1><p className="my-4 text-slate-500">Entre na sua conta para acompanhar suas compras.</p><Link href="/sign" className="inline-block rounded-lg bg-accent px-5 py-3 font-semibold">Entrar na minha conta</Link></div>

  return <div className="space-y-7 text-slate-800">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Minha conta</p><h1 className="text-3xl font-bold">Meus pedidos</h1><p className="mt-2 text-sm text-slate-500">Acompanhe suas compras e consulte os detalhes de cada pedido.</p></div><Button onClick={() => refetch()} disabled={isFetching} className="h-10 border border-border bg-transparent px-4 text-sm hover:bg-stone-100"><RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />Atualizar</Button></div>
    {isError ? <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-6"><h2 className="font-semibold">Não foi possível carregar os pedidos</h2><p className="mt-2 text-sm text-slate-500">Tente atualizar a lista novamente.</p><Button onClick={() => refetch()} loading={isFetching} className="mt-4 px-4 text-sm">Tentar novamente</Button></div> : <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[{ label: 'Total de pedidos', value: orders.length, icon: ShoppingBag }, { label: 'Em andamento', value: active, icon: Truck }, { label: 'Concluídos', value: completed, icon: CheckCircle2 }].map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center gap-4 rounded-xl border border-border bg-surface/50 p-5"><div className="rounded-lg bg-violet-400/10 p-3 text-accent"><Icon size={20} /></div><div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div></div>)}</div>
      <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex flex-wrap gap-2" aria-label="Filtrar pedidos">{filters.map((item) => <Button key={item.value} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={`h-10 px-4 text-xs ${filter === item.value ? 'bg-accent text-[white]' : 'border border-border bg-transparent text-slate-500 hover:bg-stone-100'}`}>{item.label}</Button>)}</div><div className="relative w-full sm:w-72"><Search className="pointer-events-none absolute left-3 top-4 text-zinc-500" size={16} /><Input aria-label="Buscar pedido ou produto" placeholder="Buscar pedido ou produto" value={search} onChange={(event) => setSearch(event.target.value)} className="h-12 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm text-slate-800" /></div></div>
      <p aria-live="polite" className="text-xs text-slate-500">{visible.length} {visible.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}</p>
      {visible.length ? <div className="grid items-start gap-4 lg:grid-cols-2">{visible.map((order) => <CustomerOrderCard key={order.id} order={order} />)}</div> : <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center"><Package size={36} className="mx-auto mb-4 text-zinc-500" /><h2 className="text-lg font-semibold">{orders.length ? 'Nenhum pedido encontrado' : 'Sua primeira compra começa aqui'}</h2><p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">{orders.length ? 'Tente outro produto, número de pedido ou filtro.' : 'Explore o catálogo. Seus pedidos aparecerão aqui depois da compra.'}</p>{orders.length ? <Button onClick={() => { setSearch(''); setFilter('all') }} className="mx-auto mt-5 h-10 px-5 text-sm">Limpar filtros</Button> : <Link href="/" className="mt-5 inline-block rounded-lg bg-accent px-5 py-3 text-sm font-semibold">Explorar catálogo</Link>}</div>}
    </>}
  </div>
}
