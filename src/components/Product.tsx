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
      className={twMerge('flex flex-col min-w-[150px] relative', className)}
      {...props}
    >
      {product.coupon && (
        <Discount
          discount={product.coupon.discount}
          className="left-2 top-2 absolute"
        />
      )}

      <div className="bg-[#1A1A1A] rounded-md flex justify-center items-center min-h-[160px] max-h-[160px] h-full relative">
        <Image
          src={product.image.url}
          width={0}
          height={0}
          sizes="100vw"
          alt=""
          className="w-full max-h-[70%] max-w-[70%] object-contain"
        />
      </div>

      <div className="mt-1">
        <span className="text-white text-xs md:text-sm">{product.name}</span>

        <div className="mt-1 flex flex-col  text-white gap-1">
          <strong className="text-lg">
            {formatPrice(productPriceFormatted)}
          </strong>

          {product.coupon && (
            <small className="text-[#676767] line-through text-xs">
              {formatPrice(product.price)}
            </small>
          )}
        </div>
      </div>
    </Link>
  )
}
