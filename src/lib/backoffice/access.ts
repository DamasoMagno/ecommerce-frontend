import { auth } from '@clerk/nextjs'
import { isLocalMockAuthenticationEnabled } from './mock-mode'

export function getBackofficeAccess() {
  if (isLocalMockAuthenticationEnabled()) return { authenticated: true, allowed: true }
  const { userId } = auth()
  const administrators = (process.env.BACKOFFICE_ADMIN_USER_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  return { authenticated: Boolean(userId), allowed: Boolean(userId && administrators.includes(userId)) }
}

export function requireBackofficeAccess() {
  if (!getBackofficeAccess().allowed) {
    throw new Error('Você não tem permissão para acessar o backoffice.')
  }
}
