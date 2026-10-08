import { IAddress, IOrder, IOrderItem } from '@/interface'
import { mockProducts } from './catalog'
import { OrderStatus } from '@/lib/backend/schema'

export const mockCustomer = {
  id: 'mock_customer',
  firstName: 'Cliente',
  fullName: 'Cliente de teste',
  primaryEmailAddress: { emailAddress: 'cliente@example.test' },
}

export const mockAddress: IAddress = {
  id: 'mock_address', street: 'Rua de Demonstração', number: 123,
  zipCode: 62500000, neighborhood: 'Centro', complement: 'Endereço fictício',
}

export interface MockOrder extends IOrder {
  customerName: string
  status: OrderStatus
  createdAt: string
  paidAt: string | null
  email: string
  userId: string
  orderItems: IOrderItem[]
}

export const mockOrders: MockOrder[] = [
  { id: 'mock_order_01', email: mockCustomer.primaryEmailAddress.emailAddress, userId: mockCustomer.id,
    customerName: 'Cliente de teste', status: 'COMPLETED', createdAt: new Date().toISOString(), paidAt: new Date().toISOString(),
    total: 89.9, payment: 'Money', delivery: 'Retirada', address: mockAddress,
    orderItems: [{ id: 'mock_order_item_01', quantity: 1, total: 89.9, product: mockProducts[1] }] },
  { id: 'mock_order_02', email: mockCustomer.primaryEmailAddress.emailAddress, userId: mockCustomer.id,
    customerName: 'Cliente de teste', status: 'PENDING', createdAt: new Date().toISOString(), paidAt: null,
    total: 324.8, payment: 'Card', delivery: 'Entrega', address: mockAddress,
    orderItems: [{ id: 'mock_order_item_02', quantity: 2, total: 319.8, product: mockProducts[8] }] },
  ...Array.from({ length: 36 }, (_, index): MockOrder => {
    const created = new Date()
    created.setUTCDate(created.getUTCDate() - (index % 28))
    created.setUTCHours(15, 0, 0, 0)
    const status: OrderStatus = (['COMPLETED', 'PAID', 'PROCESSING', 'SHIPPED', 'PENDING', 'CANCELLED'] as const)[index % 6]
    const product = mockProducts[index % mockProducts.length]
    const quantity = index % 3 + 1
    const total = Math.round(product.price * quantity * 100) / 100
    return {
      id: `mock_order_history_${index + 1}`, email: `cliente${index + 1}@example.test`, userId: `mock_customer_${index + 1}`,
      customerName: `Cliente fictício ${index + 1}`, status, createdAt: created.toISOString(), paidAt: ['PENDING', 'CANCELLED'].includes(status) ? null : created.toISOString(),
      total, payment: ['Pix', 'Card', 'Money'][index % 3] as IOrder['payment'], delivery: 'Retirada', address: mockAddress,
      orderItems: [{ id: `mock_history_item_${index + 1}`, product, quantity, total }],
    }
  }),
]
