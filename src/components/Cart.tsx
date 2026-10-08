'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowRight, Package, ShoppingBag, X } from 'lucide-react'
import { useCart } from '@/context/Cart'
import { CartItems } from '@/modules/checkout/components/cart-items'
import { CartSummary } from '@/modules/checkout/components/cart-summary'

export function CartModal() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { orderItems } = useCart()
  const count = orderItems.reduce((sum, item) => sum + item.quantity, 0)
  useEffect(() => { setOpen(false) }, [pathname])

  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Trigger asChild><button aria-label={`Abrir carrinho, ${count} itens`} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-accent transition hover:border-accent/40 hover:bg-accent-soft"><ShoppingBag size={20} strokeWidth={1.6} />{count > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-surface bg-accent px-1 text-[10px] font-bold text-[white]">{count}</span>}</button></Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="cart-overlay fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm" />
      <Dialog.Content className="cart-sheet fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[480px] flex-col overflow-hidden bg-shell shadow-2xl sm:rounded-l-3xl">
        <header className="flex items-start justify-between border-b border-border bg-surface px-6 py-6"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-accent">Suas escolhas</p><Dialog.Title className="text-2xl font-bold text-ink">Meu carrinho <span className="ml-1 align-middle font-sans text-sm font-normal text-muted-ink">({count})</span></Dialog.Title><Dialog.Description className="mt-2 text-xs text-muted-ink">Revise seus produtos antes de finalizar.</Dialog.Description></div><Dialog.Close asChild><button aria-label="Fechar carrinho" className="rounded-full border border-border bg-shell p-2 text-muted-ink hover:bg-accent-soft"><X size={18} /></button></Dialog.Close></header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6">{count > 0 && <div className="mt-5 flex items-center gap-2 text-xs text-muted-ink"><Package size={14} /><span>{orderItems.length} {orderItems.length === 1 ? 'produto' : 'produtos'} no seu carrinho</span></div>}<CartItems />{!count && <Dialog.Close asChild><Link href="/" className="mb-6 flex items-center justify-center gap-2 rounded-full bg-accent py-3 text-sm font-bold text-[white]">Descobrir produtos<ArrowRight size={16} /></Link></Dialog.Close>}</div>
        {count > 0 && <footer className="space-y-4 border-t border-border bg-surface px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5"><CartSummary includeDelivery={false} /><Link href="/cart" onClick={() => setOpen(false)} className="flex items-center justify-center gap-3 rounded-full bg-accent p-4 text-sm font-bold text-[white] transition hover:bg-[#3048C8]">Ir para finalizar compra<ArrowRight size={17} /></Link><button onClick={() => setOpen(false)} className="w-full text-center text-xs font-semibold text-muted-ink hover:text-accent">Continuar comprando</button></footer>}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}
