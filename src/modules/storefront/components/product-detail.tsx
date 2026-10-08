'use client'
import Image from 'next/image'
import Link from 'next/link'
import Markdown from 'react-markdown'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronRight, Package, ShoppingBag, Store, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/context/Cart'
import { Button } from '@/components/Button'
import { ProductList } from '@/components/ProductList'
import { formatPrice } from '@/utils/format-price'
import { formatDiscountPrice } from '@/utils/format-discount'
import { loadProductDetail } from '../services/product-detail'
import { ProductReviews, ReviewStars } from './product-reviews'

export function ProductDetail() {
  const params = useParams<{ slug: string }>()
  const { addProductToCart } = useCart()
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['product-detail', params.slug], queryFn: () => loadProductDetail(params.slug) })
  const { mutate, isPending } = useMutation({ mutationFn: async () => { if (data) await addProductToCart(data.product) }, onError: () => toast.error('Não foi possível adicionar o produto. Tente novamente.') })
  if (isLoading) return <main role="status" aria-label="Carregando produto" className="mx-auto grid max-w-7xl animate-pulse gap-6 px-4 py-10 md:grid-cols-2"><div className="h-96 rounded-2xl bg-slate-200" /><div className="h-80 rounded-2xl bg-slate-200" /></main>
  if (isError || !data) return <main className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="text-2xl font-bold text-ink">{isError ? 'Não foi possível carregar o produto' : 'Produto não encontrado'}</h1><p className="my-4 text-sm text-muted-ink">{isError ? 'Tente novamente em alguns instantes.' : 'Explore o catálogo para encontrar outras opções.'}</p>{isError ? <Button onClick={() => refetch()} className="mx-auto px-5">Tentar novamente</Button> : <Link href="/" className="text-accent">Voltar ao catálogo</Link>}</main>
  const { product, category, related, reviews } = data
  const price = formatDiscountPrice(product.coupon?.discount, product.price)
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
  return <main className="mx-auto max-w-7xl space-y-9 px-4 py-6 md:px-6 md:py-8">
    <nav aria-label="Caminho do produto" className="flex flex-wrap items-center gap-2 text-xs text-muted-ink"><Link href="/">Início</Link><ChevronRight size={12} />{category && <><Link href={`/products/category/${category.slug}`}>{category.name}</Link><ChevronRight size={12} /></>}<span aria-current="page" className="text-ink">{product.name}</span></nav>
    <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_1fr]"><section className="relative flex min-h-72 items-center justify-center rounded-3xl border border-border bg-surface p-8 md:min-h-[480px]">{product.coupon && <span className="absolute left-5 top-5 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-bold text-accent">{product.coupon.discount}% de desconto</span>}<Image src={product.image.url} alt={product.name} width={440} height={400} priority sizes="(max-width: 1024px) 90vw, 45vw" className="h-60 w-auto max-w-full object-contain md:h-80" /></section>
      <section className="space-y-5 rounded-3xl border border-border bg-surface p-6 md:p-8">{category && <p className="text-xs font-semibold uppercase tracking-widest text-accent">{category.name}</p>}<h1 className="text-3xl font-bold leading-tight text-ink">{product.name}</h1>{reviews.length > 0 && <a href="#avaliacoes" className="flex flex-wrap items-center gap-2 text-xs text-muted-ink"><ReviewStars rating={average} /><span>{average.toLocaleString('pt-BR')} · {reviews.length} avaliações de exemplo</span></a>}<span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${product.available ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-slate-600'}`}><span className={`h-1.5 w-1.5 rounded-full ${product.available ? 'bg-emerald-600' : 'bg-slate-500'}`} />{product.available ? 'Disponível em estoque' : 'Indisponível no momento'}</span><div className="border-y border-border py-5">{product.coupon && <p className="mb-1 text-sm text-muted-ink line-through">{formatPrice(product.price)}</p>}<strong className="text-4xl font-bold tracking-tight text-ink">{formatPrice(price)}</strong><p className="mt-2 text-xs text-muted-ink">Pix, cartão ou dinheiro · escolha ao finalizar</p></div><Button onClick={() => mutate()} disabled={!product.available} loading={isPending} className="w-full rounded-xl"><ShoppingBag size={18} />{product.available ? 'Adicionar ao carrinho' : 'Produto indisponível'}</Button><div className="grid gap-3 text-xs text-muted-ink"><p className="flex items-center gap-2"><Truck size={16} className="text-accent" />Entrega local: R$ 5,00</p><p className="flex items-center gap-2"><Store size={16} className="text-accent" />Retirada na loja sem taxa de entrega</p></div></section>
    </div>
    <section className="rounded-2xl border border-border bg-surface p-6 md:p-8"><h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-ink"><Package size={20} />Sobre o produto</h2><Markdown className="text-sm leading-7 text-muted-ink">{product.description}</Markdown></section>
    <ProductReviews reviews={reviews} />
    {related.length > 0 && <section><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-ink">Você também pode gostar</h2><p className="mt-1 text-sm text-muted-ink">Outros produtos de {category?.name}.</p></div><Link href={`/products/category/${category?.slug}`} className="text-xs font-semibold text-accent">Ver categoria →</Link></div><ProductList products={related} /></section>}
  </main>
}
