'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Package, Tags, ShoppingBag, Building2 } from 'lucide-react'
const links = [
  { href: '/backoffice', label: 'Visão geral', icon: BarChart3 },
  { href: '/backoffice/produtos', label: 'Produtos', icon: Package },
  { href: '/backoffice/categorias', label: 'Categorias', icon: Tags },
  { href: '/backoffice/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/backoffice/empresa', label: 'Empresa', icon: Building2 },
]
export function BackofficeNavigation() {
  const pathname = usePathname()
  return <nav aria-label="Áreas do backoffice" className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-4">{links.map(({ href, label, icon: Icon }) => {
    const active = pathname === href || (href !== '/backoffice' && pathname.startsWith(href + '/'))
    return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm ${active ? 'bg-violet-500/15 text-accent' : 'text-slate-500 hover:bg-surface hover:text-slate-800'}`}><Icon size={17} />{label}</Link>
  })}</nav>
}
