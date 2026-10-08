'use client'
import Link from 'next/link'
import { ArrowLeft, CreditCard, MapPin, ShoppingBag } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCart } from '@/context/Cart'
import { useUserInfo } from '@/context/User'
import { Button } from '@/components/Button'
import { FormAddress } from './address-form'
import { Payment } from './payment-options'
import { CartItems } from './cart-items'
import { CartSummary } from './cart-summary'

export function Checkout() {
  const { orderItems, checkout } = useCart()
  const { user, userLoaded, address } = useUserInfo()
  const { mutate, isPending } = useMutation({ mutationFn: checkout, onError: () => toast.error('Não foi possível finalizar o pedido. Tente novamente.') })
  if (!userLoaded) return <p role="status" className="py-12 text-center text-slate-500">Carregando carrinho…</p>
  return <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12"><Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs text-slate-500"><ArrowLeft size={14} />Continuar comprando</Link><h1 className="text-3xl font-bold text-slate-800">Meu carrinho</h1><p className="mb-8 mt-2 text-sm text-slate-500">Revise seus produtos e escolha como receber sua compra.</p>
    {!user ? <div className="rounded-2xl border border-border bg-surface p-10 text-center"><ShoppingBag className="mx-auto mb-4 text-accent" /><h2 className="text-xl font-bold text-slate-800">Entre para acessar seu carrinho</h2><Link href="/sign" className="mt-5 inline-block rounded-lg bg-accent px-5 py-3 text-sm font-bold text-[white]">Entrar na minha conta</Link></div> : !orderItems.length ? <div className="rounded-2xl border border-border bg-surface"><CartItems /></div> : <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6"><section className="rounded-2xl border border-border bg-surface px-6 py-4"><h2 className="border-b border-border pb-4 text-lg font-bold text-slate-800">Produtos selecionados</h2><CartItems /></section><section className="rounded-2xl border border-border bg-surface p-6"><h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-800"><MapPin size={19} />Endereço de recebimento</h2><p className="mb-6 text-xs text-slate-500">Cadastre seu endereço para concluir o pedido.</p><FormAddress /></section><section className="rounded-2xl border border-border bg-surface p-6"><h2 className="flex items-center gap-2 text-lg font-bold text-slate-800"><CreditCard size={19} />Pagamento e entrega</h2><Payment /></section></div>
      <aside className="space-y-5 rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-6"><h2 className="text-lg font-bold text-slate-800">Resumo da compra</h2><CartSummary /><Button onClick={() => mutate()} disabled={!address} loading={isPending} className="w-full rounded-xl bg-accent hover:bg-[#3048C8]">Finalizar compra</Button>{!address && <p className="text-xs text-amber-800">Salve seu endereço para finalizar a compra.</p>}<p className="text-center text-xs leading-5 text-slate-500">Confira os produtos e o endereço antes de confirmar.</p></aside>
    </div>}
  </main>
}
