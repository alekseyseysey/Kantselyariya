import type { Metadata } from 'next'
import { fetchProducts, fetchCategories } from '@/lib/wp-api'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CatalogView from '@/components/features/CatalogView'

export const metadata: Metadata = {
  title: 'Товары со скидкой — КанцМир',
  description: 'Акции и скидки на канцелярские товары. Выгодные цены, ограниченный срок.',
}

export default async function SalePage() {
  const [allProducts, categories] = await Promise.all([
    fetchProducts({ limit: 100 }),
    fetchCategories(),
  ])

  const saleProducts = allProducts.filter(p => p.oldPrice && p.oldPrice > p.price)

  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Скидки' },
          ]}
          className="mb-6"
        />

        {/* Sale hero */}
        <div
          className="rounded-2xl px-8 py-6 mb-8 flex items-center gap-5"
          style={{ background: '#FFF4EC', border: '1.5px solid #FF8A3D30' }}
        >
          <span className="text-5xl" aria-hidden="true">🔥</span>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[#1A1F36]"
              style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
            >
              Товары со скидкой
            </h1>
            <p className="text-sm text-[#1A1F36]/55 mt-1">
              {saleProducts.length} товаров по сниженным ценам
            </p>
          </div>
        </div>

        <CatalogView
          allProducts={saleProducts}
          allCategories={categories}
          initialSaleOnly
        />
      </div>
    </div>
  )
}