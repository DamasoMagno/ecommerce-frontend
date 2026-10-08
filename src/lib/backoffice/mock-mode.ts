export function isBackofficeMockEnabled() {
  return process.env.NODE_ENV !== 'production' && process.env.BACKOFFICE_MOCK_DATA === 'true'
}

export function isLocalMockAuthenticationEnabled() {
  return process.env.NODE_ENV === 'development'
    && isBackofficeMockEnabled()
    && process.env.BACKOFFICE_MOCK_AUTH === 'true'
}

export function isStorefrontMockEnabled() {
  return process.env.NODE_ENV === 'development'
    && isBackofficeMockEnabled()
    && process.env.NEXT_PUBLIC_LOCAL_DEMO === 'true'
}
