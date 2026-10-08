import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { ICategory, IProduct } from '@/interface'
import { ProductList } from '@/components/ProductList'
import { Benefits } from '@/components/Benefits'

type HomeCategory = { name: string; products: IProduct[] }
export function StorefrontHome({ categories, mainCategories }: { categories: ICategory[]; mainCategories: HomeCategory[] }) {
  const featured = mainCategories.flatMap((category) => category.products).find((product) => product.available)
  const offers = mainCategories.flatMap((category) => category.products).filter((product) => product.coupon && product.available)
  return <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-6 md:space-y-14 md:px-6 md:py-8">
    <section className="relative grid overflow-hidden rounded-3xl border border-border bg-accent-soft/50 p-7 md:grid-cols-[1.2fr_1fr] md:p-12">
      <div className="relative z-10 max-w-xl"><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-accent">Para facilitar seu dia a dia</p><h1 className="text-3xl font-bold leading-tight text-ink md:text-5xl">Boas escolhas.<br />Mais possibilidades.</h1><p className="mt-5 max-w-md text-sm leading-7 text-muted-ink md:text-base">Encontre tecnologia e acessórios para trabalhar, criar e aproveitar cada momento.</p><Link href="#categorias" className="mt-7 inline-flex items-center gap-3 rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-[white] transition hover:bg-[#3048C8]">Explorar catálogo<ArrowRight size={17} /></Link></div>
      {featured && <Link href={`/product/${featured.slug}`} className="relative mt-7 flex min-h-48 items-center justify-center rounded-3xl bg-surface/40 p-6 md:mt-0"><Image src={featured.image.url} alt={featured.name} width={280} height={230} priority className="h-48 w-auto max-w-full object-contain md:h-60" /><span className="absolute bottom-3 rounded-full bg-surface/90 px-4 py-2 text-xs text-slate-600">Conheça {featured.name}<ArrowRight size={12} className="ml-2 inline" /></span></Link>}
    </section>
    <Benefits />
    <section id="categorias" className="scroll-mt-6"><div className="mb-5"><p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">Encontre o que precisa</p><h2 className="text-2xl font-bold text-slate-800">Explore por categoria</h2></div><div className="grid gap-3 sm:grid-cols-3">{categories.map((category) => <Link key={category.id} href={`/products/category/${category.slug}`} className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/40 hover:shadow-sm"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-shell"><Image src={category.photo.url} alt="" width={44} height={44} className="h-11 w-11 object-contain" /></div><div className="flex-1"><h3 className="text-sm font-bold text-slate-800">{category.name}</h3><p className="mt-1 text-xs text-slate-500">Ver produtos</p></div><ArrowRight size={17} className="text-slate-400 transition group-hover:translate-x-1" /></Link>)}</div></section>
    {offers.length > 0 && <section><div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-2xl font-bold text-slate-800">Achados em oferta</h2><span className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">Preços especiais</span></div><ProductList products={offers} /></section>}
    {mainCategories.map((category) => category.products.length > 0 && <section key={category.name}><div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-2xl font-bold text-slate-800">{category.name}</h2>{categories.find((item) => item.name === category.name) && <Link href={`/products/category/${categories.find((item) => item.name === category.name)?.slug}`} className="flex items-center gap-2 text-xs font-semibold text-accent">Ver todos<ArrowRight size={14} /></Link>}</div><ProductList products={category.products} /></section>)}
    <footer className="border-t border-border py-6 text-center text-xs text-slate-500">Tudo o que você precisa, perto de você.</footer>
  </main>
}
