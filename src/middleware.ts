import { authMiddleware } from '@clerk/nextjs'
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server'
import { isLocalMockAuthenticationEnabled } from './lib/backoffice/mock-mode'

const clerkMiddleware = authMiddleware({
  publicRoutes: ['/', '/orders', '/products/(.*)', '/product/:slug', '/sign(.*)', '/api/mock/graphql'],
})

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (isLocalMockAuthenticationEnabled()) {
    if (request.nextUrl.pathname === '/api/mock/graphql') return NextResponse.next()
    if (request.nextUrl.pathname.startsWith('/api/backoffice/')) return NextResponse.next()
    if (request.nextUrl.pathname.startsWith('/api/') || request.nextUrl.pathname.startsWith('/trpc/')) return new NextResponse('Indisponível no modo de demonstração.', { status: 404 })
    return NextResponse.next()
  }
  return clerkMiddleware(request, event)
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
