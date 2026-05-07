import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MessageSquare } from 'lucide-react'
import { fetchProducts } from '@/lib/wp-api'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Stars from '@/components/ui/Stars'
import type { Review } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Отзывы покупателей',
  description: 'Реальные отзывы наших покупателей о товарах магазина — сгруппированы по товарам.',
}

export default async function ReviewsPage() {
  const products = await fetchProducts({ limit: 100 })

  // Берём только товары, у которых есть хотя бы один отзыв; самые «обсуждаемые» сверху.
  const productsWithReviews = products
    .filter(p => (p.reviews?.length ?? 0) > 0)
    .sort((a, b) => (b.reviews?.length ?? 0) - (a.reviews?.length ?? 0))

  const totalReviews = productsWithReviews.reduce((s, p) => s + (p.reviews?.length ?? 0), 0)

  // Средняя оценка по магазину = взвешенное среднее по всем отзывам.
  const avgRating =
    totalReviews > 0
      ? productsWithReviews.reduce(
          (s, p) => s + p.rating * (p.reviews?.length ?? 0),
          0,
        ) / totalReviews
      : 0

  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[{ label: 'Главная', href: '/' }, { label: 'Отзывы' }]}
          className="mb-6"
        />

        {/* Header card */}
        <div
          className="rounded-2xl px-6 sm:px-8 py-8 mb-8 flex flex-col sm:flex-row sm:items-center gap-5"
          style={{
            background: 'linear-gradient(135deg, #EEF2FF 0%, #F0FDF4 100%)',
            border: '1.5px solid #2B4DD620',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-none"
            style={{ background: '#fff' }}
            aria-hidden="true"
          >
            <MessageSquare size={28} className="text-[#2B4DD6]" />
          </div>
          <div className="flex-1">
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[#1A1F36]"
              style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
            >
              Отзывы покупателей
            </h1>
            {totalReviews > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#1A1F36]/65">
                <Stars value={avgRating} size={16} />
                <span className="font-semibold text-[#1A1F36]">{avgRating.toFixed(1)}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {totalReviews} {pluralize(totalReviews, 'отзыв', 'отзыва', 'отзывов')} на{' '}
                  {productsWithReviews.length}{' '}
                  {pluralize(productsWithReviews.length, 'товар', 'товара', 'товаров')}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-[#1A1F36]/60">
                Пока ни на один товар не оставлен отзыв
              </p>
            )}
          </div>
        </div>

        {/* Empty state */}
        {productsWithReviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] py-16 px-6 text-center">
            <p className="text-5xl mb-4">⭐</p>
            <p className="font-bold text-[#1A1F36] text-lg mb-2">Отзывов пока нет</p>
            <p className="text-sm text-[#1A1F36]/55 mb-6 max-w-md mx-auto">
              Купите товар и оставьте первый отзыв — он появится на странице товара
              и в этом списке.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all hover:bg-[#1e3ab8] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
              style={{ background: '#2B4DD6' }}
            >
              Перейти в каталог
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          /* Sections per product */
          <div className="space-y-6">
            {productsWithReviews.map(p => (
              <ProductReviewsSection
                key={p.id}
                slug={p.slug}
                name={p.name}
                brand={p.brand}
                image={p.images[0]}
                rating={p.rating}
                reviews={p.reviews ?? []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Per-product section ────────────────────────────────────── */

function ProductReviewsSection({
  slug, name, brand, image, rating, reviews,
}: {
  slug: string
  name: string
  brand: string
  image?: string
  rating: number
  reviews: Review[]
}) {
  return (
    <section
      aria-labelledby={`reviews-${slug}`}
      className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden"
    >
      {/* Product header */}
      <Link
        href={`/product/${slug}`}
        className="flex items-center gap-4 p-5 hover:bg-[#F7F8FB] transition-colors focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
      >
        <div className="relative w-16 h-16 flex-none rounded-xl overflow-hidden bg-[#F7F8FB] border border-[#e2e8f0]">
          <Image
            src={image ?? '/images/placeholder-product.svg'}
            alt={name}
            fill
            className="object-contain p-1.5"
            sizes="64px"
          />
        </div>
        <div className="flex-1 min-w-0">
          {brand && (
            <p className="text-xs text-[#1A1F36]/50 font-medium uppercase tracking-wide mb-0.5">
              {brand}
            </p>
          )}
          <h2
            id={`reviews-${slug}`}
            className="font-bold text-[#1A1F36] text-base leading-snug line-clamp-2"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            {name}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-xs text-[#1A1F36]/60">
            <Stars value={rating} size={12} />
            <span>{rating.toFixed(1)}</span>
            <span aria-hidden="true">·</span>
            <span>
              {reviews.length} {pluralize(reviews.length, 'отзыв', 'отзыва', 'отзывов')}
            </span>
          </div>
        </div>
        <ArrowRight size={18} className="text-[#1A1F36]/30 flex-none" aria-hidden="true" />
      </Link>

      {/* Reviews list */}
      <ul role="list" className="divide-y divide-[#e2e8f0] border-t border-[#e2e8f0]">
        {reviews.map(r => (
          <ReviewRow key={r.id} review={r} />
        ))}
      </ul>
    </section>
  )
}

function ReviewRow({ review }: { review: Review }) {
  const dateStr = review.date
    ? new Date(review.date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''
  return (
    <li className="p-5">
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-none"
            style={{ background: '#2B4DD6' }}
            aria-hidden="true"
          >
            {review.author.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#1A1F36] text-sm truncate">{review.author}</p>
            <p className="text-xs text-[#1A1F36]/45">{dateStr}</p>
          </div>
        </div>
        {review.rating !== null && <Stars value={review.rating} size={14} />}
      </div>
      <div
        className="prose prose-sm prose-kantsmir max-w-none mt-2"
        dangerouslySetInnerHTML={{ __html: review.content }}
      />
    </li>
  )
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}
