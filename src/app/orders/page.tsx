import { Header } from '@/components/Header'
import { CustomerOrders } from '@/modules/orders/components/customer-orders'

export default function OrdersPage() {
  return <><Header /><main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12"><CustomerOrders /></main></>
}
