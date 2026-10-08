import { z } from 'zod'
import { getMockCatalog } from '@/modules/catalog/repositories/mock-catalog'
import { getMockCommerce } from '@/mocks/commerce'
import { BackendOrder } from '@/lib/backend/types'
import { requireMockBackend } from '@/modules/shared/services/mock-access'
import { identifier } from '@/modules/shared/schemas/identifiers'
import { orderStatusSchema } from '../schemas/order'
import { summarizeOrders } from './analytics'

export function getAllOrders(): BackendOrder[] {
  requireMockBackend()
  return getMockCommerce().orders().map((order) => ({
    ...order, items: order.orderItems.map((item) => ({ id: item.id, productName: item.product.name, quantity: item.quantity, total: item.total })),
  }))
}

export function getOrders(input: unknown = {}) {
  const { search, status, page } = z.object({ search: z.string().trim().max(200).default(''), status: orderStatusSchema.optional(), page: z.number().int().min(1).max(10000).default(1) }).parse(input)
  const query = search.toLocaleLowerCase('pt-BR')
  const filtered = getAllOrders().filter((order) => (!status || order.status === status) && `${order.id} ${order.email} ${order.customerName}`.toLocaleLowerCase('pt-BR').includes(query)).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id))
  return { orders: filtered.slice((page - 1) * 20, page * 20), total: filtered.length, page, pages: Math.max(1, Math.ceil(filtered.length / 20)) }
}

export function updateOrderStatus(input: unknown) {
  requireMockBackend()
  const { id, status, expectedStatus } = z.object({ id: identifier, status: orderStatusSchema, expectedStatus: orderStatusSchema }).parse(input)
  return getMockCommerce().updateOrderStatus(id, status, expectedStatus)
}

export function getDashboard(days = 30) {
  return { ...summarizeOrders(getAllOrders(), days), products: getMockCatalog().all().length, categories: getMockCatalog().categories().length }
}
