import { loadDashboard } from './actions'
import { Dashboard } from '@/modules/orders/components/dashboard'
import { BackendUnavailable } from './components/unavailable'

export default async function BackofficePage() {
  try { return <Dashboard initialData={await loadDashboard()} /> }
  catch { return <BackendUnavailable /> }
}
