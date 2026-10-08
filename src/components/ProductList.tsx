import { IProduct } from '@/interface'
import { Product } from './Product'

interface ProductListProps {
  products: IProduct[]
}

export function ProductList({ products }: ProductListProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-3 snap-x [&::-webkit-scrollbar]:hidden">
      {products.map((product) => (
        <Product key={product.id} product={product} className="w-[200px] shrink-0 snap-start" />
      ))}
    </div>
  )
}
