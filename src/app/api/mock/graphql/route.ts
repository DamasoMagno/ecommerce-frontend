import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isLocalMockAuthenticationEnabled, isStorefrontMockEnabled } from '@/lib/backoffice/mock-mode'
import { getMockCommerce } from '@/mocks/commerce'
import { currentUser } from '@clerk/nextjs'
import { authorizeMockRequest, MockAccessError } from '@/modules/shared/services/mock-request-access'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!isStorefrontMockEnabled()) return new NextResponse(null, { status: 404 })
  try {
    const { query, variables } = z.object({ query: z.string().min(1).max(20000), variables: z.record(z.unknown()).optional() }).parse(await request.json())
    const commerce = getMockCommerce()
    if (!isLocalMockAuthenticationEnabled()) {
      // Public catalog reads also run during server rendering without a session.
      try { authorizeMockRequest(query, variables ?? {}, null, (id) => commerce.cartItemOwner(id)) }
      catch (error) {
        if (!(error instanceof MockAccessError) || error.status !== 401) throw error
        const clerkUser = await currentUser()
        const primaryEmail = clerkUser?.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)?.emailAddress
        authorizeMockRequest(query, variables ?? {}, clerkUser && primaryEmail ? { id: clerkUser.id, email: primaryEmail } : null, (id) => commerce.cartItemOwner(id))
      }
    }
    return NextResponse.json({ data: commerce.request(query, variables) })
  } catch (error) {
    if (error instanceof MockAccessError) return NextResponse.json({ errors: [{ message: error.message }] }, { status: error.status })
    return NextResponse.json({ errors: [{ message: 'Não foi possível executar esta operação com os dados de demonstração.' }] }, { status: 400 })
  }
}
