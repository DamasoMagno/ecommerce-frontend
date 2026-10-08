import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { Package } from 'lucide-react'
import { getBackofficeAccess } from '@/lib/backoffice/access'
import { isLocalMockAuthenticationEnabled } from '@/lib/backoffice/mock-mode'
import { BackofficeNavigation } from './components/navigation'

export const dynamic = 'force-dynamic'

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const access = getBackofficeAccess()
  if (!access.authenticated) redirect('/sign')
  if (!access.allowed) {
    return <main className="mx-auto max-w-xl p-10 text-slate-800"><h1 className="text-2xl font-bold">Acesso restrito</h1><p className="my-4 text-slate-500">Esta área está disponível apenas para administradores autorizados.</p><Link href="/" className="text-accent">Voltar à loja</Link></main>
  }

  return <div className="min-h-screen text-slate-800">
    <header className="border-b border-border"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
      <Link href="/backoffice" className="flex items-center gap-3 font-bold"><Package className="text-accent" />Newbyte <span className="hidden font-normal text-zinc-500 sm:inline">/ Backoffice</span></Link>
      <div className="flex items-center gap-5">{isLocalMockAuthenticationEnabled()
        ? <><Link href="/" className="text-sm text-slate-500 hover:text-slate-800">Ver loja</Link><span className="text-sm text-amber-800">Demonstração local · sem login</span></>
        : <><Link href="/" className="text-sm text-slate-500 hover:text-slate-800">Ver loja</Link><UserButton afterSignOutUrl="/" /></>}</div>
    </div></header>
    <div className="border-b border-border"><BackofficeNavigation /></div>
    <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
  </div>
}
