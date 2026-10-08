import { loadCategories, loadImages } from '../actions'
import { CategoryManager } from '@/modules/catalog/components/category-manager'
import { BackendUnavailable } from '../components/unavailable'

export default async function CategoriesPage() {
  try {
    const [categories, assets] = await Promise.all([loadCategories(), loadImages()])
    return <CategoryManager initialCategories={categories} assets={assets} />
  } catch { return <BackendUnavailable /> }
}
