'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { ProductReview } from '@/mocks/reviews'

export function ReviewStars({ rating }: { rating: number }) {
  return <span aria-label={`${rating} de 5 estrelas`} className="inline-flex gap-1">{[1, 2, 3, 4, 5].map((value) => <Star key={value} size={15} aria-hidden="true" className={value <= Math.round(rating) ? 'fill-amber-500 text-amber-500' : 'text-slate-300'} />)}</span>
}

export function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  const [sort, setSort] = useState('recent')
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
  const sorted = [...reviews].sort((a, b) => sort === 'rating' ? b.rating - a.rating : b.date.localeCompare(a.date))
  return <section id="avaliacoes" className="scroll-mt-8 rounded-2xl border border-border bg-surface p-5 md:p-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-ink">Avaliações do produto</h2>{reviews.length > 0 && <p className="mt-2 text-xs text-muted-ink">Avaliações fictícias para demonstração.</p>}</div>{reviews.length > 0 && <select aria-label="Ordenar avaliações" value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border border-border bg-shell p-3 text-xs text-ink"><option value="recent">Mais recentes</option><option value="rating">Maior nota</option></select>}</div>
    {!reviews.length ? <p className="text-sm text-muted-ink">Este produto ainda não tem avaliações.</p> : <div className="grid gap-8 md:grid-cols-[230px_1fr]"><div className="rounded-xl bg-shell p-5"><div className="flex items-baseline gap-2"><strong className="text-4xl text-ink">{average.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</strong><span className="text-sm text-muted-ink">/ 5</span></div><div className="my-3"><ReviewStars rating={average} /></div><p className="mb-5 text-xs text-muted-ink">{reviews.length} avaliações de exemplo</p>{[5, 4, 3, 2, 1].map((rating) => { const count = reviews.filter((review) => review.rating === rating).length;return <div key={rating} className="mb-2 flex items-center gap-2 text-xs text-muted-ink"><span>{rating}</span><Star size={10} /><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-amber-500" style={{ width: `${count / reviews.length * 100}%` }} /></div><span className="w-4 text-right">{count}</span></div> })}</div><div className="divide-y divide-border">{sorted.map((review) => <article key={review.id} className="py-5 first:pt-0"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">{review.author.slice(0, 1)}</span><span className="text-sm font-semibold text-ink">{review.author}</span></div><time dateTime={review.date} className="text-xs text-muted-ink">{new Date(`${review.date}T12:00:00Z`).toLocaleDateString('pt-BR')}</time></div><div className="mb-2 mt-3"><ReviewStars rating={review.rating} /></div><h3 className="text-sm font-bold text-ink">{review.title}</h3><p className="mt-2 text-sm leading-6 text-muted-ink">{review.body}</p></article>)}</div></div>}
  </section>
}
