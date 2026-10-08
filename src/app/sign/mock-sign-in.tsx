'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserInfo } from '@/context/User'

export function MockSignIn() {
  const { mockSession, user } = useUserInfo()
  const router = useRouter()
  return <main className="mx-auto my-16 max-w-md rounded-2xl border border-border bg-surface p-8 text-slate-800">
    <p className="mb-3 text-sm text-amber-800">Demonstração local</p>
    <h1 className="text-2xl font-bold">Entrar na loja</h1>
    <p className="my-5 text-sm text-slate-500">Use a conta fictícia para testar carrinho, endereço e pedidos. Nenhuma senha ou conta real é necessária.</p>
    <button onClick={() => { mockSession?.signIn(); router.push('/') }} className="w-full rounded-lg bg-accent p-3 font-bold">{user ? 'Continuar como cliente de teste' : 'Entrar como cliente de teste'}</button>
    <Link href="/" className="mt-5 block text-center text-sm text-slate-500">Voltar ao catálogo</Link>
  </main>
}
