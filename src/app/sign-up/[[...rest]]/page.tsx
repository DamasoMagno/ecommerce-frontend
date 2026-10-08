import { SignUp } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { isLocalMockAuthenticationEnabled } from '@/lib/backoffice/mock-mode'

export default function SignUpPage() {
  if (isLocalMockAuthenticationEnabled()) redirect('/sign')
  return <main className="flex min-h-[80vh] items-center justify-center px-4 py-10"><SignUp routing="path" path="/sign-up" signInUrl="/sign" afterSignUpUrl="/" /></main>
}
