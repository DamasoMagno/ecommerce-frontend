'use client'
import Link from 'next/link'
import { useClerk } from '@clerk/clerk-react'
import * as Popover from '@radix-ui/react-popover'
import { CircleUserRound, Package, LogOut, LogIn, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUserInfo } from '@/context/User'

function ProfileMenu({ onSignOut }: { onSignOut: () => void | Promise<void> }) {
  const { user, userLoaded } = useUserInfo()
  return <Popover.Root><Popover.Trigger asChild><button aria-label="Minha conta" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-accent transition hover:border-accent/40 hover:bg-accent-soft"><CircleUserRound size={20} strokeWidth={1.6} /></button></Popover.Trigger><Popover.Portal><Popover.Content align="end" sideOffset={12} className="z-[60] w-64 rounded-2xl border border-border bg-surface p-2 shadow-xl">
    {!userLoaded ? <div className="flex justify-center p-5"><Loader2 className="animate-spin text-slate-500" size={20} /></div> : <><div className="border-b border-border px-3 py-3"><p className="text-sm font-bold text-slate-800">{user ? `Olá, ${user.firstName ?? 'cliente'}` : 'Bem-vindo à loja'}</p><p className="mt-1 text-xs text-slate-500">{user ? 'Acompanhe suas compras por aqui.' : 'Entre para acessar seus pedidos.'}</p></div><Popover.Close asChild><Link href={user ? '/orders' : '/sign'} className="mt-2 flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-700 hover:bg-accent-soft">{user ? <><Package size={17} />Meus pedidos</> : <><LogIn size={17} />Entrar na conta</>}</Link></Popover.Close>{user && <Popover.Close asChild><button onClick={onSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-500 hover:bg-accent-soft"><LogOut size={17} />Sair da conta</button></Popover.Close>}</>}
  </Popover.Content></Popover.Portal></Popover.Root>
}

function ClerkProfileOptions() {
  const { signOut } = useClerk()
  const router = useRouter()
  return <ProfileMenu onSignOut={() => signOut(() => router.push('/'))} />
}

export function ProfileOptions() {
  const { mockSession } = useUserInfo()
  return mockSession ? <ProfileMenu onSignOut={mockSession.signOut} /> : <ClerkProfileOptions />
}
