import { loadOrders } from '../actions'
import { OrderManager } from '@/modules/orders/components/order-manager'
import { BackendUnavailable } from '../components/unavailable'
export default async function OrdersPage() {
  try { return <OrderManager initialData={await loadOrders()} /> }
  catch { return <BackendUnavailable /> }
}
