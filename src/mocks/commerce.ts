import { parse, Kind } from 'graphql'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { getMockCatalog } from '@/lib/backoffice/mock-store'
import { mockAddress, mockCustomer, mockOrders, MockOrder } from './customer'
import { IAddress, IOrderItem } from '@/interface'
import { OrderStatus, assertOrderTransition } from '@/lib/backend/schema'

type CartItem = IOrderItem & { email: string; finished: boolean }
type Resale = { id: string; email: string; dealer: string; enterprise: string; contact: number; approvedRequest: boolean }

const text = z.string().min(1).max(200)
const emailSchema = z.object({ email: z.string().email() })
const addressSchema = z.object({ street: text, number: z.number().int().positive(), zipCode: z.number().int().positive(), neighborhood: text, complement: z.string().max(200).optional() })
const clone = <T,>(data: T): T => JSON.parse(JSON.stringify(data)) as T

export function createMockCommerce() {
  let orders = clone(mockOrders)
  let items: CartItem[] = []
  const addresses: Record<string, IAddress> = { [mockCustomer.primaryEmailAddress.emailAddress]: clone(mockAddress) }
  const resales: Record<string, Resale> = {}

  return {
    cartItemOwner(id: string) { return items.find((item) => item.id === id)?.email },
    orders() { return clone(orders) },
    updateOrderStatus(id: string, status: OrderStatus, expectedStatus: OrderStatus) {
      const order = orders.find((item) => item.id === id)
      if (!order) throw new Error('Pedido não encontrado.')
      if (order.status !== expectedStatus) throw new Error('O pedido foi atualizado. Recarregue a lista antes de alterar.')
      assertOrderTransition(order.status, status)
      order.status = status
      if (status === 'PAID' && !order.paidAt) order.paidAt = new Date().toISOString()
      return clone(order)
    },
    request(query: string, variables: Record<string, unknown> = {}) {
      const document = parse(query)
      const operations = document.definitions.filter((definition) => definition.kind === Kind.OPERATION_DEFINITION)
      if (operations.length !== 1 || operations[0].kind !== Kind.OPERATION_DEFINITION) throw new Error('Operação inválida.')
      const operation = operations[0].name?.value
      const products = getMockCatalog().all()
      const categories = getMockCatalog().categories().map((category) => ({ ...category, products: products.filter((product) => product.categoryId ? product.categoryId === category.id : category.slug === 'acessorios') }))
      let data: unknown
      switch (operation) {
        case 'MainCategories': case 'Categories': data = { categories }; break
        case 'Resume': data = { banners: [
          { id: 'mock_banner_1', image: { id: 'mock_banner_image_1', url: '/images/mock/banner.svg' } },
          { id: 'mock_banner_2', image: { id: 'mock_banner_image_2', url: '/images/mock/banner.svg' } },
        ] }; break
        case 'Logo': case 'WhatsappContact': {
          const company = getMockCatalog().company()
          data = { enterpriseInfos: [{ name: company.name, logo: { url: company.logoUrl ?? '/images/logo.jpg' }, contact: '', pix: '' }] }; break
        }
        case 'Product': data = { product: products.find((product) => product.slug === variables.slug) ?? null }; break
        case 'ProductsByName': {
          const { name } = z.object({ name: z.string().max(200) }).parse(variables)
          const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
          data = { products: products.filter((product) => normalize(product.name).includes(normalize(name))) }
          break
        }
        case 'ProductsByCategory': data = { category: categories.find((category) => category.slug === variables.category) ?? null }; break
        case 'userAddress': {
          const { email } = emailSchema.parse(variables)
          data = { address: addresses[email] ?? null }; break
        }
        case 'RegisterAddress': {
          const { email } = emailSchema.parse(variables)
          addresses[email] = { ...addressSchema.parse(variables), id: addresses[email]?.id ?? `mock_address_${randomUUID()}` }
          data = { createAddress: addresses[email], publishAddress: { id: addresses[email].id } }; break
        }
        case 'UpdateAddress': {
          const { email } = emailSchema.parse(variables)
          addresses[email] = { ...addressSchema.parse(variables.updatedAddress), id: addresses[email]?.id ?? `mock_address_${randomUUID()}` }
          data = { updateAddress: addresses[email], publishAddress: { id: addresses[email].id } }; break
        }
        case 'OrderItems': data = { orderItems: items.filter((item) => item.email === variables.email && !item.finished) }; break
        case 'CreateOrderItem': {
          const { email, slug, total } = z.object({ email: z.string().email(), slug: text, total: z.number().finite().positive() }).parse(variables)
          const product = products.find((product) => product.slug === slug)
          if (!product || !product.available) throw new Error('Produto indisponível.')
          const item = { id: `mock_cart_${randomUUID()}`, email, finished: false, quantity: 1, total, product }
          items.push(item); data = { createOrderItem: item }; break
        }
        case 'DeleteOrderItem': {
          const { orderItemId } = z.object({ orderItemId: text }).parse(variables)
          items = items.filter((item) => item.id !== orderItemId)
          data = { deleteOrderItem: { id: orderItemId } }; break
        }
        case 'UpdateOrderItem': {
          const { orderItemId, quantity, total } = z.object({ orderItemId: text, quantity: z.number().int().positive(), total: z.number().finite().positive() }).parse(variables)
          const item = items.find((item) => item.id === orderItemId)
          if (!item) throw new Error('Item não encontrado.')
          Object.assign(item, { quantity, total, finished: true }); data = { updateOrderItem: { id: item.id } }; break
        }
        case 'CreateOrder': {
          const input = z.object({ email: z.string().email(), userId: text, addressId: text, total: z.number().finite().positive(), payment: z.enum(['Pix', 'Card', 'Money']), delivery: z.enum(['Retirada', 'Entrega']), orderItemId: z.array(z.object({ id: text })).min(1) }).parse(variables)
          const address = addresses[input.email]
          const orderItems = input.orderItemId.map(({ id }) => items.find((item) => item.id === id && item.email === input.email))
          if (!address || address.id !== input.addressId || orderItems.some((item) => !item)) throw new Error('Endereço ou itens inválidos.')
          const order: MockOrder = { ...input, id: `mock_order_${randomUUID()}`, address, orderItems: clone(orderItems as CartItem[]), customerName: 'Cliente de teste', status: 'PENDING', createdAt: new Date().toISOString(), paidAt: null }
          for (const item of orderItems) if (item) item.finished = true
          orders = [order, ...orders]; data = { createOrder: order }; break
        }
        case 'OrdersWithItems': data = { orders: orders.filter((order) => order.email === variables.email) }; break
        case 'orderDetails': data = { orders: orders.filter((order) => order.id === variables.id && order.userId === variables.userId) }; break
        case 'checkExistingRequest': data = { resale: resales[String(variables.email)] ?? null }; break
        case 'sendResaleRequest': {
          const input = z.object({ email: z.string().email(), dealer: text, enterprise: text, contact: z.number().int().positive() }).parse(variables)
          const resale = { ...input, id: `mock_resale_${randomUUID()}`, approvedRequest: false }
          resales[input.email] = resale; data = { createResale: resale, publishResale: { id: resale.id } }; break
        }
        case 'updateResale': {
          const input = z.object({ email: z.string().email(), contact: z.number().int().positive() }).parse(variables)
          const resale = resales[input.email]
          if (!resale) throw new Error('Solicitação não encontrada.')
          resale.contact = input.contact; data = { updateResale: resale, publishResale: { id: resale.id } }; break
        }
        case 'PublicOrderItem': data = { publishOrderItem: { id: variables.orderItemId } }; break
        case 'PublishOrder': data = { publishOrder: { id: variables.orderId } }; break
        case 'PublishOrderItems': data = { publishManyOrderItemsConnection: { edges: [] } }; break
        default: throw new Error('Operação não disponível na demonstração.')
      }
      return clone(data)
    },
  }
}

const mockGlobal = globalThis as typeof globalThis & { newbyteMockCommerce?: ReturnType<typeof createMockCommerce> }
export function getMockCommerce() {
  if (!mockGlobal.newbyteMockCommerce) mockGlobal.newbyteMockCommerce = createMockCommerce()
  return mockGlobal.newbyteMockCommerce
}
