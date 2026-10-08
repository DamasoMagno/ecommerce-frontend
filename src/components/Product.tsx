import Image from 'next/image'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import { formatPrice } from '../utils/format-price'
import { AnchorHTMLAttributes } from 'react'
import { IProduct } from '@/interface'

import { Discount } from './Discount'
import { formatDiscountPrice } from '@/utils/format-discount'

interface ProductProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  product: IProduct
}

export function Product({ product, className, ...props }: ProductProps) {
  const productPriceFormatted = formatDiscountPrice(
    product.coupon?.discount,
    product.price,
  )

  return (
    <Link
      href={`/product/${product.slug}`}
      className={twMerge('group flex flex-col min-w-[180px] relative rounded-2xl border border-border bg-surface p-3 transition hover:border-border hover:shadow-md', className)}
      {...props}
    >
      {product.coupon && (
        <Discount
          discount={product.coupon.discount}
          className="left-2 top-2 absolute"
        />
      )}

      <div className="bg-shell rounded-md flex justify-center items-center min-h-[160px] max-h-[160px] h-full relative">
        <Image
          src={product.image.url}
          width={0}
          height={0}
          sizes="100vw"
          alt=""
          className="w-full max-h-[70%] max-w-[70%] object-contain transition group-hover:scale-105"
        />
      </div>

      <div className="mt-1">
        <span className="text-slate-800 text-xs md:text-sm line-clamp-2 min-h-10">{product.name}</span>

        <div className="mt-1 flex flex-col  text-slate-800 gap-1">
          <strong className="text-lg">
            {formatPrice(productPriceFormatted)}
          </strong>

          {product.coupon && (
            <small className="text-muted-ink line-through text-xs">
              {formatPrice(product.price)}
            </small>
          )}
        </div>
      </div>
    </Link>
  )
}
