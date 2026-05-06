import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchProducts, fetchCategories } from '@/lib/wp-api'
import { CATEGORIES } from '@/lib/mock-data'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CatalogView from '@/components/features/CatalogView'

export async function generateStaticParams() {
  const categories = await fetchCategories()
  return categories.map(c => ({ category: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category: slug } = await params
  const cat = CATEGORIES.find(c => c.slug === slug)
  if (!cat) return { title: 'Категория не найдена' }
  return {
    title: cat.name,
    description: `${cat.name} в интернет-магазине КанцМир. Большой выбор, низкие цены, быстрая доставка.`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category: slug } = await params
  const category = CATEGORIES.find(c => c.slug === slug)
  if (!category) notFound()

  const [products, allCategories] = await Promise.all([
    fetchProducts({ limit: 100 }),
    fetchCategories(),
  ])

  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Каталог', href: '/catalog' },
            { label: category.name },
          ]}
          className="mb-6"
        />

        {/* Category hero strip */}
        <div
          className="rounded-2xl px-8 py-6 mb-8 flex items-center gap-5"
          style={{ background: category.iconBg, border: `1.5px solid ${category.color}20` }}
        >
          <span className="text-5xl" aria-hidden="true">{category.emoji}</span>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[#1A1F36]"
              style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
            >
              {category.name}
            </h1>
            <p className="text-sm text-[#1A1F36]/55 mt-1">
              {category.count.toLocaleString('ru-RU')} товаров в этой категории
            </p>
          </div>
        </div>

        <CatalogView
          allProducts={products}
          allCategories={allCategories}
          preselectedCategoryId={category.id}
        />
      </div>
    </div>
  )
}