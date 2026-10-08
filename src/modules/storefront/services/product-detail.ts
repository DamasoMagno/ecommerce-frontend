import { listProductInfo } from '@/graphql/queries/listProductInfo'
import { listCategories } from '@/graphql/queries/listCategories'
import { listMainCategories } from '@/graphql/queries/listMainCategories'
import { listProductsByCategory } from '@/graphql/queries/listProductsByCategory'
import { mockProductReviews } from '@/mocks/reviews'

export async function loadProductDetail(slug: string) {
  const { product } = await listProductInfo({ slug })
  if (!product) return null
  const { categories } = await listCategories()
  let category = categories.find((item) => item.id === product.categoryId)
  if (!category) {
    const main = await listMainCategories()
    const linked = main.categories.find((item) => item.products.some((candidate) => candidate.id === product.id))
    category = categories.find((item) => item.id === linked?.id)
  }
  const related = category ? (await listProductsByCategory({ category: category.slug })).category?.products.filter((item) => item.id !== product.id).slice(0, 8) ?? [] : []
  const reviews = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_LOCAL_DEMO === 'true' ? mockProductReviews(product.id) : []
  return { product, category, related, reviews }
}
