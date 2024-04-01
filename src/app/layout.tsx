import { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Poppins } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

import { CartProvider } from '@/context/Cart'
import { UserProvider } from '@/context/User'

import { Whatsapp } from '@/components/Whatsapp'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'Newbyte',
  icons: ['/images/logo.jpg'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="pt-Br">
        <body className={`${poppins.className} bg-black-02`}>
          <UserProvider>
            <CartProvider>{children}</CartProvider>
          </UserProvider>

          <Toaster
            position="top-center"
            theme="dark"
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
