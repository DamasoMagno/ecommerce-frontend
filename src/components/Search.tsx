'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function SearchInput() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    if (search.trim()) router.push(`/products/${encodeURIComponent(search.trim())}`)
  }
  return <form onSubmit={submit} role="search" className="order-3 flex h-11 w-full items-center gap-3 rounded-xl border border-border bg-shell px-4 md:order-none md:max-w-lg md:flex-1"><Search size={18} className="shrink-0 text-slate-400" /><input aria-label="Buscar produtos" placeholder="O que você está procurando?" value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none" /><button type="submit" aria-label="Pesquisar produtos" className="text-xs font-semibold text-accent">Buscar</button></form>
}
