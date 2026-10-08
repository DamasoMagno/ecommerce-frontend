'use client'
import { useId, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import { loadDashboard } from '../actions/orders'
type DashboardData = Awaited<ReturnType<typeof loadDashboard>>
const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function DailyChart({ data, metric }: { data: DashboardData; metric: 'revenue' | 'orders' }) {
  const titleId = useId()
  const width = 900, height = 250, left = 70, top = 15, bottom = 45
  const plotWidth = width - left - 20, plotHeight = height - top - bottom
  const maximum = Math.max(1, ...data.series.map((day) => day[metric]))
  const step = plotWidth / data.series.length
  return <svg role="img" aria-labelledby={titleId} viewBox={`0 0 ${width} ${height}`} className="w-full">
    <title id={titleId}>{`${metric === 'revenue' ? 'Receita recebida por dia, em reais' : 'Pedidos criados por dia'}, últimos ${data.days} dias`}</title>
    {[0, 0.5, 1].map((ratio) => <g key={ratio}><line x1={left} x2={width - 20} y1={top + plotHeight * (1 - ratio)} y2={top + plotHeight * (1 - ratio)} stroke="#27272a" /><text x={left - 10} y={top + plotHeight * (1 - ratio) + 4} textAnchor="end" fontSize={12} fill="#71717a">{metric === 'revenue' ? Math.round(maximum * ratio).toLocaleString('pt-BR') : Math.round(maximum * ratio)}</text></g>)}
    {data.series.map((day, index) => <g key={day.date}><rect x={left + index * step + 2} y={top + plotHeight * (1 - day[metric] / maximum)} width={Math.max(1, step - 4)} height={plotHeight * day[metric] / maximum} rx={2} fill={metric === 'revenue' ? '#8b5cf6' : '#34d399'}><title>{`${day.date}: ${metric === 'revenue' ? currency(day.revenue) : `${day.orders} pedidos`}`}</title></rect>{index % Math.max(1, Math.floor(data.days / 7)) === 0 && <text x={left + index * step + step / 2} y={height - 22} textAnchor="middle" fill="#71717a" fontSize={12}>{day.date.slice(8)}/{day.date.slice(5, 7)}</text>}</g>)}
    <text x={left} y={height - 3} fill="#71717a" fontSize={11}>Data (horário de Fortaleza)</text><text x={left} y={12} fill="#a1a1aa" fontSize={11}>{metric === 'revenue' ? 'R$' : 'Pedidos'}</text>
  </svg>
}

export function Dashboard({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue')
  async function refresh(days: number) {
    setLoading(true)
    try { setData(await loadDashboard(days)) } catch { toast.error('Não foi possível atualizar os indicadores.') } finally { setLoading(false) }
  }
  return <>
    <div className="mb-8 flex flex-wrap justify-between gap-5"><div><p className="mb-2 text-xs uppercase tracking-widest text-accent">Operação da loja</p><h1 className="text-3xl font-bold">Visão geral</h1><p className="mt-2 text-sm text-slate-500">Acompanhe seus pedidos e a receita recebida.</p></div><div className="flex items-center gap-3"><select aria-label="Período dos indicadores" value={data.days} disabled={loading} onChange={(event) => void refresh(Number(event.target.value))} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm"><option value={7}>Últimos 7 dias</option><option value={30}>Últimos 30 dias</option><option value={90}>Últimos 90 dias</option></select><button disabled={loading} onClick={() => void refresh(data.days)} aria-label="Atualizar indicadores" className="rounded-lg border border-border p-3"><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button></div></div>
    <p role="status" className="mb-6 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-800">Dados fictícios para testes. Receita considera a data de pagamento e exclui pedidos cancelados. Pedidos são contados pela data de criação.</p>
    <div aria-busy={loading} className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
      { label: 'Receita recebida', value: currency(data.revenue), detail: `${data.paidOrders} pedidos pagos no período` },
      { label: 'Pedidos criados', value: data.totalOrders, detail: `${data.cancelledOrders} cancelados no período` },
      { label: 'Ticket médio', value: currency(data.averageTicket), detail: 'Valor médio dos pedidos pagos' },
      { label: 'Aguardando pagamento', value: data.pendingOrders, detail: 'Dos pedidos criados no período' },
    ].map((item) => <div key={item.label} className="rounded-xl border border-border bg-surface p-5"><p className="text-sm text-slate-500">{item.label}</p><p className="my-3 text-2xl font-bold">{item.value}</p><p className="text-xs text-zinc-500">{item.detail}</p></div>)}</div>
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]"><section className="rounded-xl border border-border bg-surface p-5"><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h2 className="text-lg font-bold">{metric === 'revenue' ? 'Receita recebida por dia' : 'Pedidos criados por dia'}</h2><select aria-label="Métrica do gráfico" value={metric} onChange={(event) => setMetric(event.target.value as typeof metric)} className="rounded-lg border border-border bg-shell px-3 py-2 text-xs"><option value="revenue">Receita (R$)</option><option value="orders">Pedidos</option></select></div><DailyChart data={data} metric={metric} /><p className="mt-3 text-xs text-zinc-500">Fonte: pedidos mockados · últimos {data.days} dias · Fortaleza</p><details className="mt-4 text-xs text-slate-500"><summary className="cursor-pointer">Ver valores diários</summary><div className="mt-3 max-h-48 overflow-auto">{data.series.map((day) => <p key={day.date} className="flex justify-between py-1"><span>{day.date}</span><span>{currency(day.revenue)} · {day.orders} pedidos</span></p>)}</div></details></section>
    <section className="rounded-xl border border-border bg-surface p-5"><h2 className="mb-6 text-lg font-bold">Pedidos por status</h2><div className="space-y-5">{data.byStatus.map((item) => <div key={item.status}><div className="mb-2 flex justify-between text-xs"><span className="text-slate-500">{item.label}</span><span>{item.count}</span></div><div className="h-2 rounded-full bg-stone-100"><div className="h-2 rounded-full bg-violet-500" style={{ width: `${data.totalOrders ? item.count / data.totalOrders * 100 : 0}%` }} /></div></div>)}</div><Link href="/backoffice/pedidos" className="mt-7 flex items-center gap-2 text-sm text-accent">Gerenciar pedidos<ArrowUpRight size={16} /></Link></section></div>
    <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500"><Link href="/backoffice/produtos">{data.products} produtos no catálogo</Link><Link href="/backoffice/categorias">{data.categories} categorias cadastradas</Link></div>
  </>
}
