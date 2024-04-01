import { IProduct } from '@/interface'
import { Product } from './Product'

interface ProductListProps {
  products: IProduct[]
}

export function ProductList({ products }: ProductListProps) {
  return (
    <div className="flex gap-6 overflow-scroll overflow-x-auto [&::-webkit-scrollbar]:hidden">
      {products.map((product) => (
        <Product key={product.id} product={product} className="max-w-[160px]" />
      ))}
    </div>
  )
}
