'use client'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { listProductsByName } from '@/graphql/queries/listProductsByName'
import { ProductLoader } from '@/components/ProductLoader'
import { Product } from '@/components/Product'

export function ProductList() {
  const params = useParams<{ name: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['products', params.name],
    queryFn: () => listProductsByName({ name: params.name }),
  })

  const products = data?.products.sort((a, b) => {
    const discountA = a.coupon?.discount || 0
    const discountB = b.coupon?.discount || 0

    if ((a.coupon && b.coupon) || (!a.coupon && !b.coupon)) {
      return discountA - discountB
    }

    return a.coupon ? -1 : 1
  })

  return (
    <main className="px-4 pb-4 max-w-7xl mx-auto flex flex-col">
      {isLoading ? (
        <div className="animate-pulse bg-white/10 h-8 rounded-lg w-3/12 my-8" />
      ) : (
        <strong className="text-white text-lg my-8">
          Busca por: {params.name}
        </strong>
      )}

      {isLoading ? (
        <section className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          <ProductLoader />
        </section>
      ) : products && products.length > 0 ? (
        <section className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          {products?.map((product) => (
            <Product key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <div className="text-white flex justify-center items-center h-52">
          Nenhum produto encontrado
        </div>
      )}
    </main>
  )
}
