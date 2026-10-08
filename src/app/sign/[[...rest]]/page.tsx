import { SignIn } from '@clerk/nextjs'
import { isLocalMockAuthenticationEnabled } from '@/lib/backoffice/mock-mode'
import { MockSignIn } from '../mock-sign-in'

export default async function Sign() {
  if (isLocalMockAuthenticationEnabled()) return <MockSignIn />
  return <main className="flex min-h-[80vh] items-center justify-center px-4 py-10"><SignIn routing="path" path="/sign" signUpUrl="/sign-up" afterSignInUrl="/" /></main>
}
