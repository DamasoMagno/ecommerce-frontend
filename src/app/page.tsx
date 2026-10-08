import { listMainCategories } from '@/graphql/queries/listMainCategories'
import { listCategories } from '@/graphql/queries/listCategories'
import { Header } from '@/components/Header'
import { StorefrontHome } from '@/modules/storefront/components/home'

export default async function Home() {
  const [main, catalog] = await Promise.all([listMainCategories(), listCategories()])
  return <><Header /><StorefrontHome categories={catalog.categories} mainCategories={main.categories} /></>
}
