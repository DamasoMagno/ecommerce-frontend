'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/context/Cart'
import { formatPrice } from '@/utils/format-price'

export function CartItems() {
  const { orderItems, deleteProductFromCart, incrementProductQuantity, decrementProductQuantity } = useCart()
  const [deleting, setDeleting] = useState<string | null>(null)
  async function remove(id: string) {
    setDeleting(id)
    try { await deleteProductFromCart(id) } catch { toast.error('Não foi possível remover o produto. Tente novamente.') } finally { setDeleting(null) }
  }
  if (!orderItems.length) return <div className="px-4 py-12 text-center"><ShoppingBag size={38} className="mx-auto mb-4 text-stone-400" /><h2 className="font-bold text-slate-800">Seu carrinho está vazio</h2><p className="mt-2 text-sm text-slate-500">Que tal encontrar algo para o seu dia a dia?</p><Link href="/" className="mt-5 inline-block text-sm font-semibold text-accent">Explorar catálogo →</Link></div>
  return <ul className="space-y-3">{orderItems.map((item) => <li key={item.id} className="flex gap-3 rounded-2xl border border-border bg-surface p-4 my-4"><Link href={`/product/${item.product.slug}`} className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-shell p-3"><Image src={item.product.image.url} alt={item.product.name} width={64} height={64} className="h-16 w-16 object-contain" /></Link><div className="min-w-0 flex-1"><Link href={`/product/${item.product.slug}`} className="text-sm font-semibold text-slate-800">{item.product.name}</Link><p className="mt-1 text-xs text-muted-ink">{formatPrice(Number(item.total) / item.quantity)} / unidade</p><p className="mt-2 text-sm font-bold text-ink">{formatPrice(Number(item.total))}</p><div className="mt-3 flex items-center justify-between gap-2"><div className="inline-flex items-center rounded-lg border border-border bg-surface"><button type="button" aria-label={`Diminuir quantidade de ${item.product.name}`} disabled={item.quantity <= 1 || deleting === item.id} onClick={() => decrementProductQuantity(item.id)} className="p-2.5 text-slate-600 hover:bg-shell"><Minus size={14} /></button><span aria-live="polite" className="min-w-8 text-center text-sm text-slate-800">{item.quantity}</span><button type="button" aria-label={`Aumentar quantidade de ${item.product.name}`} disabled={deleting === item.id} onClick={() => incrementProductQuantity(item.id)} className="p-2.5 text-slate-600 hover:bg-shell"><Plus size={14} /></button></div><button type="button" aria-label={`Remover ${item.product.name}`} disabled={deleting === item.id} onClick={() => remove(item.id)} className="rounded-lg p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></div></div></li>)}</ul>
}
