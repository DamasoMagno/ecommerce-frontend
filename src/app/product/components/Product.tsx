'use client'
import Image from 'next/image'
import Markdown from 'react-markdown'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCart } from '@/context/Cart'
import { formatPrice } from '@/utils/format-price'
import { formatDiscountPrice } from '@/utils/format-discount'

import { listProductInfo } from '@/graphql/queries/listProductInfo'
import { IProduct } from '@/interface'

import { Discount } from '@/components/Discount'
import { Button } from '@/components/Button'
import { ProductSkeleton } from './Loading'

export function ProductInfo() {
  const { addProductToCart } = useCart()
  const params = useParams<{ slug: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['product', params.slug],
    queryFn: () => listProductInfo({ slug: params.slug }),
  })

  const product = data?.product || ({} as IProduct)

  const { isPending, mutate } = useMutation({
    mutationFn: async () => addProductToCart(product),
  })

  const priceDiscounted = formatDiscountPrice(
    product.coupon?.discount,
    product.price,
  )

  const availabilityText = product.available
    ? 'Disponível em estoque'
    : 'Não disponível'

  return (
    <>
      <main className="grid grid-cols-1 xl:grid-cols-product max-w-7xl mx-auto md:px-4 md:gap-4 md:mt-4">
        {isLoading ? (
          <ProductSkeleton />
        ) : (
          <>
            <section className="text-white w-full md:h-[80vh] h-80 max-h-[670px] bg-[#1A1A1A] flex justify-center items-center relative md:rounded-md">
              <Image
                src={product.image.url}
                alt={product.name}
                width={0}
                height={0}
                priority
                sizes="100vw"
                className="object-contain w-auto h-auto max-w-[80%] max-h-[80%]"
              />
            </section>

            <section className="flex flex-col justify-between gap-8 p-6">
              <div className="flex flex-col">
                <div>
                  <h3 className="text-2xl text-white">{data?.product.name}</h3>

                  <span className="text-sm text-[#8162FF]">
                    {availabilityText}
                  </span>
                </div>

                <div className="flex flex-col mt-6">
                  <div className="flex items-center gap-2">
                    <strong className="text-2xl text-white">
                      {formatPrice(priceDiscounted)}
                    </strong>
                    {(product.coupon?.discount ?? 0) > 0 && (
                      <Discount discount={product.coupon?.discount ?? 0} />
                    )}
                  </div>

                  {(product.coupon?.discount ?? 0) > 0 && (
                    <span className="text-[#676767] line-through">
                      De: {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-8">
                  <strong className="text-white text-base">Descrição</strong>

                  <Markdown className="text-[#A1A1A1] text-sm leading-6">
                    {product.description}
                  </Markdown>
                </div>
              </div>

              <footer className="flex flex-col gap-2">
                <Button
                  onClick={() => mutate()}
                  disabled={!product.available}
                  loading={isPending}
                >
                  Adicionar ao carrinho
                </Button>
              </footer>
            </section>
          </>
        )}
      </main>
    </>
  )
}
