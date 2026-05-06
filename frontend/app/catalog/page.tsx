import type { Metadata } from 'next'
import { fetchProducts, fetchCategories } from '@/lib/wp-api'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CatalogView from '@/components/features/CatalogView'

export const metadata: Metadata = {
  title: 'Каталог канцелярских товаров',
  description: 'Более 12 000 канцелярских товаров: тетради, ручки, краски, рюкзаки и многое другое. Фильтрация по категориям, брендам и цене.',
}

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([
    fetchProducts({ limit: 100 }),
    fetchCategories(),
  ])

  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[{ label: 'Главная', href: '/' }, { label: 'Каталог' }]}
          className="mb-6"
        />

        {/* Page heading */}
        <div className="mb-8">
          <h1
            className="text-3xl sm:text-4xl font-extrabold text-[#1A1F36]"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            Каталог товаров
          </h1>
          <p className="text-[#1A1F36]/60 text-base mt-2">
            {products.length} товаров в наличии
          </p>
        </div>

        <CatalogView allProducts={products} allCategories={categories} />
      </div>
    </div>
  )
}