import type { Metadata } from 'next'
import { fetchCategories, fetchProductsPage } from '@/lib/wp-api'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CatalogView from '@/components/features/CatalogView'

export const metadata: Metadata = {
  title: 'Каталог канцелярских товаров',
  description: 'Более 12 000 канцелярских товаров: тетради, ручки, краски, рюкзаки и многое другое. Фильтрация по категориям, брендам и цене.',
}

const PAGE_SIZE = 20

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: categorySlug } = await searchParams

  // Грузим только первую порцию — остальное подтягивается клиентом по кнопке.
  const [page, categories] = await Promise.all([
    fetchProductsPage({ first: PAGE_SIZE, categorySlug }),
    fetchCategories(),
  ])

  const preselectedCategoryId = categorySlug
    ? categories.find(c => c.slug === categorySlug)?.id
    : undefined

  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[{ label: 'Главная', href: '/' }, { label: 'Каталог' }]}
          className="mb-6"
        />

        <div className="mb-8">
          <h1
            className="text-3xl sm:text-4xl font-extrabold text-[#1A1F36]"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            Каталог товаров
          </h1>
        </div>

        <CatalogView
          key={preselectedCategoryId ?? 'all'}
          allProducts={page.products}
          allCategories={categories}
          preselectedCategoryId={preselectedCategoryId}
          initialEndCursor={page.endCursor}
          initialHasNextPage={page.hasNextPage}
          categorySlug={categorySlug}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  )
}
