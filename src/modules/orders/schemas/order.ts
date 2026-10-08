import { z } from 'zod'

export const statuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'] as const
export const orderStatusSchema = z.enum(statuses)
export type OrderStatus = z.infer<typeof orderStatusSchema>
export const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Aguardando pagamento', PAID: 'Pago', PROCESSING: 'Em preparação', SHIPPED: 'Enviado', COMPLETED: 'Concluído', CANCELLED: 'Cancelado',
}
export const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'], PAID: ['PROCESSING', 'CANCELLED'], PROCESSING: ['SHIPPED', 'COMPLETED', 'CANCELLED'], SHIPPED: ['COMPLETED'], COMPLETED: [], CANCELLED: [],
}
export function assertOrderTransition(current: OrderStatus, next: OrderStatus) {
  if (next !== current && !transitions[current].includes(next)) throw new Error('Esta mudança de status não é permitida.')
}
