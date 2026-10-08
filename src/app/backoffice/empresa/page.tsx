import { loadCompany, loadImages } from '../actions'
import { CompanyManager } from '@/modules/company/components/company-manager'
import { BackendUnavailable } from '../components/unavailable'

export default async function CompanyPage() {
  try {
    const [company, assets] = await Promise.all([loadCompany(), loadImages()])
    return <CompanyManager initialCompany={company} assets={assets} />
  } catch { return <BackendUnavailable /> }
}
