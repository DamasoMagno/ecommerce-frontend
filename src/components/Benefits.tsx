import { HTMLAttributes } from 'react'
import { Package, Store, CreditCard } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export function Benefits({ className }: HTMLAttributes<HTMLElement>) {
  return <div className={twMerge('grid gap-3 sm:grid-cols-3', className)}>{[{ icon: Package, title: 'Do seu jeito', text: 'Escolha entrega ou retirada' }, { icon: Store, title: 'Retire na loja', text: 'Sem taxa de entrega' }, { icon: CreditCard, title: 'Escolha como pagar', text: 'Pix, cartão ou dinheiro' }].map(({ icon: Icon, title, text }) => <div key={title} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-5 py-4"><Icon size={22} className="shrink-0 text-accent" /><div><p className="text-sm font-bold text-slate-800">{title}</p><p className="mt-1 text-xs text-slate-500">{text}</p></div></div>)}</div>
}
