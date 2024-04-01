import Link from 'next/link'
import Image from 'next/image'

import { listMainCategories } from '@/graphql/queries/listMainCategories'
import { getBanners } from '@/graphql/queries/getBanners'
import { listCategories } from '@/graphql/queries/listCategories'

import { IProduct } from '@/interface'

import { Header } from '@/components/Header'
import { ProductList } from '@/components/ProductList'
import { Banners } from '@/components/Banners'
import { Benefits } from '@/components/Benefits'

interface ICategory {
  name: string
  products: IProduct[]
}

async function getHomeResume() {
  const { categories: mainCategories } = await listMainCategories()
  const { categories } = await listCategories()
  const { banners } = await getBanners()

  return {
    mainCategories,
    categories,
    banners,
  }
}

export default async function Home() {
  const { banners, categories, mainCategories } = await getHomeResume()

  const productsInOffers = mainCategories
    .slice(0, 6)
    .reduce((acc: IProduct[], currentValue: ICategory) => {
      for (const product of currentValue.products) {
        if (product.coupon) {
          acc.push(product)
        }
      }

      return acc
    }, [])

  const categoriesWithoutProductsOffers = mainCategories
    .slice(0, 6)
    .map(({ name, products }) => {
      return {
        name,
        products: products.filter((product) => !product.coupon),
      }
    })

  return (
    <>
      <Header />
      <Banners banners={banners} />
      <main className="px-4 flex flex-col pb-4 max-w-7xl mx-auto w-full">
        <Benefits className="mt-6 mb-12" />

        <div className="flex gap-2 overflow-scroll overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
            >
              <div className="flex flex-col items-center justify-center gap-2 border-[#2A2A2A] border-2 w-32 h-32 rounded-xl">
                <Image
                  src={category.photo.url}
                  alt=""
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="h-auto w-auto max-h-12 object-contain "
                />
                <strong className="text-white text-base">
                  {category.name}
                </strong>
              </div>
            </Link>
          ))}
        </div>

        <section className="flex flex-col gap-8 mt-16">
          {categoriesWithoutProductsOffers.map((category) => {
            return (
              category.products.length > 0 && (
                <div className="flex flex-col gap-5" key={category.name}>
                  <strong className="text-white text-base">
                    {category.name}
                  </strong>
                  <ProductList products={category.products} />
                </div>
              )
            )
          })}

          {productsInOffers.length > 0 && (
            <div className="flex flex-col gap-5">
              <strong className="text-white text-base">OFERTAS</strong>
              <ProductList products={productsInOffers} />
            </div>
          )}
        </section>
      </main>
    </>
  )
}
