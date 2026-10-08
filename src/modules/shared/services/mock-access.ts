import { requireBackofficeAccess } from '@/lib/backoffice/access'
import { isBackofficeMockEnabled } from '@/lib/backoffice/mock-mode'

export function requireMockBackend() {
  requireBackofficeAccess()
  if (!isBackofficeMockEnabled()) throw new Error('Estas áreas estão disponíveis no modo de teste. Execute npm run dev:mock.')
}
