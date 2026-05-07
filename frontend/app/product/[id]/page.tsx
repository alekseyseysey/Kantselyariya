import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  fetchAllProductSlugs,
  fetchCategories,
  fetchDeliveryContent,
  fetchProductBySlug,
  fetchProducts,
} from '@/lib/wp-api'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ProductGallery from '@/components/features/ProductGallery'
import ProductAddToCart from '@/components/features/ProductAddToCart'
import ProductTabs from '@/components/features/ProductTabs'
import ProductCard from '@/components/features/ProductCard'

export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await fetchAllProductSlugs()
  return slugs.map(slug => ({ id: slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id: slug } = await params
  const product = await fetchProductBySlug(slug)
  if (!product) return { title: 'Товар не найден' }
  return {
    title: product.name,
    description:
      product.description ?? `${product.name} — купить в КанцМир. Быстрая доставка по Беларуси.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: slug } = await params
  const product = await fetchProductBySlug(slug)
  if (!product) notFound()

  const [allProducts, categories, deliveryHtml] = await Promise.all([
    fetchProducts({ limit: 100 }),
    fetchCategories(),
    fetchDeliveryContent(),
  ])
  const related = allProducts
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4)

  const categorySlug =
    categories.find(c => c.id === product.categoryId)?.slug ?? ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'BYN',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[#F7F8FB] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Каталог', href: '/catalog' },
              { label: product.categoryName, href: `/catalog/${categorySlug}` },
              { label: product.name },
            ]}
            className="mb-6"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            <ProductGallery images={product.images} productName={product.name} />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 text-sm text-[#1A1F36]/50">
                <span className="font-semibold uppercase tracking-wide text-xs">{product.brand}</span>
                <span>·</span>
                <span>Арт. {product.sku}</span>
              </div>

              <h1
                className="text-2xl sm:text-3xl font-extrabold text-[#1A1F36] leading-tight"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
              >
                {product.name}
              </h1>

              {product.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill={i < Math.round(product.rating) ? '#FF8A3D' : '#e2e8f0'} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span
                    className="text-sm text-[#1A1F36]/60"
                    aria-label={`Рейтинг ${product.rating} из 5, ${product.reviewCount} отзывов`}
                  >
                    {product.rating} ({product.reviewCount} отзывов)
                  </span>
                </div>
              )}

              <div className="h-px bg-[#e2e8f0] my-2" />

              <ProductAddToCart product={product} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 mb-12">
            <ProductTabs product={product} deliveryHtml={deliveryHtml} />
          </div>

          {related.length > 0 && (
            <section aria-labelledby="related-heading">
              <h2
                id="related-heading"
                className="text-xl sm:text-2xl font-extrabold text-[#1A1F36] mb-6"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
              >
                Похожие товары
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {related.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
