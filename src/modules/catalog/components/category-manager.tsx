'use client'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { categorySchema } from '@/lib/backend/schema'
import { BackendCategory, BackendAsset } from '@/lib/backend/types'
import { productSlug } from '@/lib/backoffice/product-schema'
import { loadCategories, removeCategory, saveCategory } from '../actions/catalog'
import { ImagePicker } from '@/components/backoffice/ImagePicker'

const inputClass = 'mt-2 w-full rounded-lg border border-border bg-shell px-3 py-3 text-sm'

export function CategoryManager({ initialCategories, assets }: { initialCategories: BackendCategory[]; assets: BackendAsset[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [imageOptions, setImageOptions] = useState(assets)
  const [editing, setEditing] = useState<BackendCategory | null>(null)
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting, dirtyFields } } = useForm<z.infer<typeof categorySchema>>({ resolver: zodResolver(categorySchema), defaultValues: { name: '', slug: '', imageId: null } })

  function edit(category?: BackendCategory) {
    setEditing(category ?? null); setOpen(true)
    reset(category ? { name: category.name, slug: category.slug, imageId: category.imageId || null } : { name: '', slug: '', imageId: null })
  }

  return <>
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-xs uppercase tracking-widest text-accent">Organização da loja</p><h1 className="text-3xl font-bold">Categorias</h1><p className="mt-2 text-sm text-slate-500">Organize os produtos e facilite a navegação no catálogo.</p></div><Button onClick={() => edit()} disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm"><Plus size={18} />Nova categoria</Button></div>
    {open && <form onSubmit={handleSubmit(async (input) => {
      try {
        const result = await saveCategory(input, editing?.id)
        if (!result.success) { toast.error(result.message); return }
        setCategories(await loadCategories()); setOpen(false); toast.success('Categoria salva.')
      } catch { toast.error('Não foi possível salvar a categoria.') }
    })} className="mb-8 rounded-xl border border-border bg-surface p-6">
      <h2 className="mb-5 text-xl font-bold">{editing ? 'Editar categoria' : 'Nova categoria'}</h2>
      <fieldset disabled={isSubmitting} className="grid gap-5 md:grid-cols-2"><label className="text-sm">Nome da categoria<Input className={inputClass} {...register('name', { onChange: (event) => { if (!editing && !dirtyFields.slug) setValue('slug', productSlug(event.target.value)) } })} />{errors.name && <span role="alert" className="mt-1 block text-red-400">Informe um nome com pelo menos 2 caracteres.</span>}</label>
        <label className="text-sm">Endereço da categoria<Input className={inputClass} {...register('slug')} />{errors.slug && <span role="alert" className="mt-1 block text-red-400">Use letras minúsculas, números e hífens.</span>}</label>
        <ImagePicker label="Imagem da categoria" assets={imageOptions} value={watch('imageId') ?? null} onChange={(id) => setValue('imageId', id)} onUploaded={(asset) => setImageOptions((current) => [...current, asset])} />
        <div className="flex gap-3 md:col-span-2"><Button className="rounded-lg bg-accent px-5 py-3 text-sm">{isSubmitting ? 'Salvando…' : 'Salvar categoria'}</Button><Button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-5 py-3 text-sm">Cancelar</Button></div>
      </fieldset>
    </form>}
    <div className="overflow-x-auto rounded-xl border border-border bg-surface"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-zinc-500"><tr><th className="p-5">Categoria</th><th className="p-5">Produtos</th><th className="p-5">Ações</th></tr></thead><tbody className="divide-y divide-zinc-800">{categories.map((category) => <tr key={category.id}><td className="p-5"><div className="flex items-center gap-3"><img src={category.photo.url} alt="" className="h-12 w-12 rounded-lg object-contain" /><div>{category.name}<p className="mt-1 text-xs text-zinc-500">/{category.slug}</p></div></div></td><td className="p-5">{category.productCount}</td><td className="p-5"><div className="flex gap-3"><Button disabled={isSubmitting || !!deleting} onClick={() => edit(category)} aria-label={`Editar categoria ${category.name}`} className="p-2 text-slate-500 hover:text-slate-800"><Pencil size={18} /></Button><Button disabled={category.productCount > 0 || !!deleting || isSubmitting} title={category.productCount ? 'Mova os produtos antes de excluir' : 'Excluir categoria vazia'} aria-label={`Excluir categoria ${category.name}`} className="p-2 text-slate-500 hover:text-red-400" onClick={async () => {
          if (!window.confirm(`Excluir a categoria ${category.name}?`)) return
          setDeleting(category.id)
          try { const result = await removeCategory(category.id); if (!result.success) toast.error(result.message); else { setCategories(await loadCategories()); toast.success('Categoria excluída.') } }
          catch { toast.error('Não foi possível excluir.') } finally { setDeleting(null) }
        }}><Trash2 size={18} /></Button></div></td></tr>)}</tbody></table>{!categories.length && <p className="p-8 text-center text-slate-500">Cadastre sua primeira categoria.</p>}</div>
  </>
}
