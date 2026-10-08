import { Metadata } from 'next'
import { Toaster } from 'sonner'
import { DM_Sans, Syne } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

import { CartProvider } from '@/context/Cart'
import { UserProvider } from '@/context/User'
import { MockUserProvider } from '@/context/MockUser'
import Link from 'next/link'

import { Whatsapp } from '@/components/Whatsapp'
import { isLocalMockAuthenticationEnabled } from '@/lib/backoffice/mock-mode'
import './globals.css'

const bodyFont = DM_Sans({ subsets: ['latin'] })
const headingFont = Syne({ subsets: ['latin'], variable: '--font-heading' })

export const metadata: Metadata = {
  title: 'Newbyte',
  icons: ['/images/logo.jpg'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (isLocalMockAuthenticationEnabled()) {
    return <html lang="pt-BR"><body className={`${bodyFont.className} ${headingFont.variable} bg-store-shell`}>
      <MockUserProvider><CartProvider>
        <nav aria-label="Navegação da demonstração" className="flex flex-wrap justify-center gap-5 border-b border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-800">
          <span>Loja de demonstração · dados fictícios</span>
          <Link href="/" className="underline">Catálogo</Link><Link href="/sign" className="underline">Login</Link><Link href="/cart" className="underline">Carrinho</Link><Link href="/orders" className="underline">Pedidos</Link><Link href="/backoffice/produtos" className="underline">Backoffice</Link>
        </nav>
        {children}
      </CartProvider></MockUserProvider>
      <Toaster position="top-center" theme="light" richColors closeButton />
    </body></html>
  }
  return (
    <ClerkProvider>
      <html lang="pt-Br">
        <body className={`${bodyFont.className} ${headingFont.variable} bg-store-shell`}>
          <UserProvider>
            <CartProvider>{children}</CartProvider>
          </UserProvider>

          <Toaster
            position="top-center"
            theme="light"
            richColors
            duration={1500}
            closeButton
          />

          <Whatsapp />
        </body>
      </html>
    </ClerkProvider>
  )
}
