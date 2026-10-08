'use client'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Package, Pencil, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { IProduct } from '@/interface'
import { BackendCategory } from '@/lib/backend/types'
import { ImagePicker } from '@/components/backoffice/ImagePicker'
import { productSchema, productSlug, ProductInput } from '@/lib/backoffice/product-schema'
import { AssetOption, CatalogPage, loadProducts, saveProduct } from '../actions/products'

const inputClass = 'w-full rounded-lg border border-border bg-shell px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400'
const emptyProduct: ProductInput = { name: '', slug: '', description: '', price: 0, available: false, imageId: '', categoryId: null }

export function ProductManager({ initialCatalog, assets, categories = [], mockMode = false }: { initialCatalog: CatalogPage; assets: AssetOption[]; categories?: BackendCategory[]; mockMode?: boolean }) {
  const [imageOptions, setImageOptions] = useState(assets)
  const [catalog, setCatalog] = useState(initialCatalog)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<IProduct | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const formRef = useRef<HTMLElement>(null)
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting, dirtyFields } } = useForm<ProductInput>({ resolver: zodResolver(productSchema), defaultValues: emptyProduct })
  const selectedImage = imageOptions.find((asset) => asset.id === watch('imageId')) ?? (editing?.image.id === watch('imageId') ? editing.image : undefined)

  function openForm(product?: IProduct) {
    setEditing(product ?? null)
    reset(product ? { name: product.name, slug: product.slug, description: product.description, price: product.price, available: product.available, imageId: product.image?.id ?? '', categoryId: product.categoryId ?? null } : emptyProduct)
    setFormOpen(true)
    window.requestAnimationFrame(() => { formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.getElementById('product-name')?.focus({ preventScroll: true }) })
  }

  async function searchProducts(more = false) {
    setLoading(true)
    try {
      const query = more ? appliedSearch : search
      const next = await loadProducts(query, more ? catalog.cursor : null)
      setCatalog((current) => ({ ...next, products: more ? [...current.products, ...next.products] : next.products }))
      if (!more) setAppliedSearch(query)
    } catch { toast.error('Não foi possível carregar os produtos. Tente novamente.') }
    finally { setLoading(false) }
  }

  async function submit(input: ProductInput) {
    try {
      const result = await saveProduct(input, editing?.id)
      if (!result.success) { toast.error(result.message); return }
      toast.success(mockMode ? 'Produto de teste salvo.' : 'Produto salvo como rascunho.')
      setFormOpen(false)
      setEditing(null)
      reset(emptyProduct)
      try {
        const next = await loadProducts(appliedSearch)
        setCatalog(next)
      } catch { toast.error('Produto salvo. Recarregue a página para atualizar a lista.') }
    } catch { toast.error('Não foi possível salvar. Verifique sua sessão e tente novamente.') }
  }

  const fieldError = (field: keyof ProductInput) => errors[field] && <p id={`error-${field}`} role="alert" className="mt-1 text-xs text-red-400">{errors[field]?.message}</p>

  return <>
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-xs uppercase tracking-widest text-accent">Gestão do catálogo</p><h1 className="text-3xl font-bold">Produtos</h1><p className="mt-2 text-sm text-slate-500">Cadastre e edite os produtos da sua loja.</p></div><Button disabled={isSubmitting} onClick={() => openForm()} className="flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold hover:bg-violet-500"><Plus size={18} />Novo produto</Button></div>
    {!mockMode && <p className="mb-6 rounded-lg border border-violet-400/20 bg-violet-400/5 p-4 text-sm text-slate-600">As alterações são salvas como rascunho. Revise as categorias e publique o produto no Hygraph para atualizar a loja.</p>}
    {formOpen && <section ref={formRef} className="mb-8 scroll-mt-6 rounded-2xl border border-border bg-surface p-6">
      <h2 className="mb-6 text-xl font-bold">{editing ? 'Editar produto' : 'Novo produto'}</h2>
      <form onSubmit={handleSubmit(submit)} noValidate>
        <fieldset disabled={isSubmitting} className="grid gap-6 md:grid-cols-2">
          <div><label htmlFor="product-name" className="mb-2 block text-sm">Nome do produto</label><Input id="product-name" className={inputClass} aria-invalid={!!errors.name} aria-describedby="error-name" {...register('name', { onChange: (event) => { if (!editing && !dirtyFields.slug) setValue('slug', productSlug(event.target.value), { shouldValidate: false }) } })} />{fieldError('name')}</div>
          <div><label htmlFor="product-slug" className="mb-2 block text-sm">Endereço do produto (slug)</label><Input id="product-slug" className={inputClass} aria-invalid={!!errors.slug} aria-describedby="error-slug" {...register('slug')} /><p className="mt-1 text-xs text-zinc-500">Exemplo: teclado-sem-fio</p>{fieldError('slug')}</div>
          <div className="md:col-span-2"><label htmlFor="product-description" className="mb-2 block text-sm">Descrição</label><textarea id="product-description" rows={5} className={inputClass} aria-invalid={!!errors.description} aria-describedby="error-description" {...register('description')} />{fieldError('description')}</div>
          <div><label htmlFor="product-price" className="mb-2 block text-sm">Preço (R$)</label><Input id="product-price" type="number" min="0.01" step="0.01" inputMode="decimal" className={inputClass} aria-invalid={!!errors.price} aria-describedby="error-price" {...register('price', { valueAsNumber: true })} />{fieldError('price')}</div>
          {mockMode ? <div><ImagePicker label="Imagem do produto" value={watch('imageId')} assets={imageOptions} disabled={isSubmitting} onChange={(id) => setValue('imageId', id ?? '', { shouldValidate: true })} onUploaded={(asset) => setImageOptions((current) => [...current, asset])} />{fieldError('imageId')}</div> : <div><label htmlFor="product-image" className="mb-2 block text-sm">Imagem</label><select id="product-image" className={inputClass} aria-invalid={!!errors.imageId} aria-describedby="error-imageId" {...register('imageId')}><option value="">Selecione uma imagem</option>{editing?.image && !assets.some((asset) => asset.id === editing.image.id) && <option value={editing.image.id}>Imagem atual</option>}{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.fileName ?? asset.id}</option>)}</select><p className="mt-1 text-xs text-zinc-500">{mockMode ? 'Selecione uma das imagens fictícias disponíveis.' : 'Envie e publique imagens na biblioteca de assets do Hygraph.'}</p>{fieldError('imageId')}</div>}
          {mockMode && <div><label htmlFor="product-category" className="mb-2 block text-sm">Categoria</label><select id="product-category" className={inputClass} {...register('categoryId')}><option value="">Sem categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{fieldError('categoryId')}</div>}
          {!mockMode && selectedImage && <div className="md:col-span-2"><img src={selectedImage.url} alt="Prévia da imagem selecionada" className="h-36 w-36 rounded-lg bg-shell object-contain" /></div>}
          <label className="flex items-center gap-3 text-sm md:col-span-2"><Input type="checkbox" className="h-4 w-4 accent-violet-500" {...register('available')} />Disponível para compra</label>
          <div className="flex flex-wrap gap-3 border-t border-border pt-5 md:col-span-2"><Button type="submit" className="flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold hover:bg-violet-500">{isSubmitting && <Loader2 className="animate-spin" size={16} />}{mockMode ? 'Salvar produto de teste' : 'Salvar rascunho'}</Button><Button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-border px-5 py-3 text-sm">Cancelar</Button></div>
        </fieldset>
      </form>
    </section>}
    <section aria-label="Lista de produtos" className="overflow-hidden rounded-2xl border border-border bg-surface">
      <form onSubmit={(event) => { event.preventDefault(); void searchProducts() }} className="flex flex-wrap gap-3 border-b border-border p-5"><div className="relative flex-1"><Search size={18} className="absolute left-3 top-3 text-zinc-500" /><Input aria-label="Buscar produtos por nome" placeholder="Buscar por nome…" value={search} onChange={(event) => setSearch(event.target.value)} className={`${inputClass} pl-10`} /></div><Button disabled={loading || isSubmitting} className="rounded-lg border border-border px-5 text-sm">{loading ? 'Carregando…' : 'Buscar'}</Button></form>
      <div aria-busy={loading} className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-shell/40 text-xs uppercase text-zinc-500"><tr><th className="p-5">Produto</th><th className="p-5">Preço</th><th className="p-5">Disponibilidade</th><th className="p-5"><span className="sr-only">Ações</span></th></tr></thead><tbody className="divide-y divide-zinc-800">{catalog.products.map((product) => <tr key={product.id}><td className="p-5"><div className="flex items-center gap-3">{product.image?.url ? <img src={product.image.url} alt="" className="h-12 w-12 rounded-lg bg-shell object-contain" /> : <Package className="text-zinc-500" />}<div className="min-w-[160px]"><p>{product.name}</p><p className="mt-1 text-xs text-zinc-500">/{product.slug}</p></div></div></td><td className="whitespace-nowrap p-5">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="p-5"><span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${product.available ? 'bg-emerald-500/10 text-emerald-400' : 'bg-stone-100 text-slate-500'}`}>{product.available ? 'Disponível' : 'Indisponível'}</span></td><td className="p-5"><Button disabled={isSubmitting} aria-label={`Editar ${product.name}`} onClick={() => openForm(product)} className="rounded-lg p-2 text-slate-500 hover:bg-stone-100 hover:text-slate-800"><Pencil size={18} /></Button></td></tr>)}</tbody></table></div>
      {!catalog.products.length && <div className="p-12 text-center text-slate-500"><Package className="mx-auto mb-4" /><p>{appliedSearch ? 'Nenhum produto encontrado para essa busca.' : 'Seu catálogo ainda não tem produtos.'}</p><p className="mt-2 text-sm">Use “Novo produto” para começar.</p></div>}
      {catalog.hasNextPage && <div className="border-t border-border p-4 text-center"><Button disabled={loading || isSubmitting} onClick={() => void searchProducts(true)} className="text-sm text-accent">{loading ? 'Carregando…' : 'Carregar mais produtos'}</Button></div>}
    </section>
  </>
}
