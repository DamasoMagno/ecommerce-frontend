import { BackendOrder } from '@/lib/backend/types'
import { statusLabels, statuses } from '@/modules/orders/schemas/order'

const dayMilliseconds = 86400000
export function dayKey(date: Date | string) {
  return new Date(new Date(date).getTime() - 3 * 3600000).toISOString().slice(0, 10)
}

export function summarizeOrders(orders: BackendOrder[], days: number, now = new Date()) {
  if (![7, 30, 90].includes(days)) throw new Error('Período inválido.')
  const today = dayKey(now)
  const start = new Date(`${today}T03:00:00Z`).getTime() - (days - 1) * dayMilliseconds
  const end = now.getTime()
  const inPeriod = (date: string | null) => Boolean(date && new Date(date).getTime() >= start && new Date(date).getTime() <= end)
  const created = orders.filter((order) => inPeriod(order.createdAt))
  const paid = orders.filter((order) => order.status !== 'CANCELLED' && inPeriod(order.paidAt))
  const revenueCents = paid.reduce((sum, order) => sum + Math.round(order.total * 100), 0)
  const series = Array.from({ length: days }, (_, index) => ({ date: dayKey(new Date(start + index * dayMilliseconds + 3 * 3600000)), revenue: 0, orders: 0 }))
  for (const order of created) {
    const day = series.find((item) => item.date === dayKey(order.createdAt))
    if (day) day.orders += 1
  }
  for (const order of paid) {
    const day = series.find((item) => item.date === dayKey(order.paidAt!))
    if (day) day.revenue = (Math.round(day.revenue * 100) + Math.round(order.total * 100)) / 100
  }
  return {
    days, revenue: revenueCents / 100, totalOrders: created.length, paidOrders: paid.length,
    averageTicket: paid.length ? revenueCents / 100 / paid.length : 0,
    pendingOrders: created.filter((order) => order.status === 'PENDING').length,
    cancelledOrders: created.filter((order) => order.status === 'CANCELLED').length,
    series, byStatus: statuses.map((status) => ({ status, label: statusLabels[status], count: created.filter((order) => order.status === status).length })),
  }
}
