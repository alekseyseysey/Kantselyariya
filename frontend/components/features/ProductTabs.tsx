'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Star, CheckCircle } from 'lucide-react'
import type { Product, Review } from '@/lib/types'
import { wooWriteReview } from '@/lib/woo-reviews'
import Stars from '@/components/ui/Stars'

type TabId = 'description' | 'specs' | 'reviews' | 'delivery'

const TABS: { id: TabId; label: string }[] = [
  { id: 'description', label: 'Описание' },
  { id: 'specs',       label: 'Характеристики' },
  { id: 'reviews',     label: 'Отзывы' },
  { id: 'delivery',    label: 'Доставка и оплата' },
]

interface Props {
  product: Product
  /** HTML-контент таба «Доставка и оплата» из WP-страницы со слагом `delivery`. */
  deliveryHtml: string
}

export default function ProductTabs({ product, deliveryHtml }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('description')

  return (
    <div>
      {/* Tab strip */}
      <div
        className="flex gap-0 border-b border-[#e2e8f0] overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label="Информация о товаре"
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className="relative px-5 py-3.5 text-sm font-semibold transition-colors whitespace-nowrap flex-none focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            style={{ color: activeTab === tab.id ? '#2B4DD6' : 'rgba(26,31,54,0.55)' }}
          >
            {tab.label}
            {tab.id === 'reviews' && product.reviews && product.reviews.length > 0 && (
              <span className="ml-1.5 text-xs text-[#1A1F36]/45">({product.reviews.length})</span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                style={{ background: '#2B4DD6' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="pt-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'description' && (
              <div className="prose prose-sm prose-kantsmir max-w-none">
                <p>{product.description ?? 'Описание отсутствует.'}</p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                {product.specs && Object.keys(product.specs).length > 0 ? (
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      {Object.entries(product.specs).map(([key, val], i) => (
                        <tr
                          key={key}
                          style={{ background: i % 2 === 0 ? '#F7F8FB' : '#fff' }}
                          className="border-b border-[#e2e8f0]"
                        >
                          <td className="py-2.5 px-4 text-[#1A1F36]/55 font-medium w-1/2">{key}</td>
                          <td className="py-2.5 px-4 text-[#1A1F36] font-semibold">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-[#1A1F36]/50 text-sm">Характеристики не указаны.</p>
                )}
                <p className="text-xs text-[#1A1F36]/35 mt-4">Артикул: {product.sku}</p>
              </div>
            )}

            {activeTab === 'reviews' && <ReviewsPanel product={product} />}

            {activeTab === 'delivery' && (
              <div
                className="prose prose-sm prose-kantsmir max-w-none"
                dangerouslySetInnerHTML={{ __html: deliveryHtml }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Reviews panel ─────────────────────────────────────────────── */

function ReviewsPanel({ product }: { product: Product }) {
  const reviews = product.reviews ?? []
  const [showForm, setShowForm] = useState(reviews.length === 0)
  const [submittedHold, setSubmittedHold] = useState(false)

  return (
    <div className="space-y-6">
      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 pb-4 border-b border-[#e2e8f0]">
          <div className="text-4xl font-extrabold text-[#1A1F36]"
               style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
            {product.rating.toFixed(1)}
          </div>
          <div>
            <Stars value={product.rating} />
            <p className="text-xs text-[#1A1F36]/55 mt-1">
              {reviews.length} {pluralize(reviews.length, 'отзыв', 'отзыва', 'отзывов')}
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="ml-auto rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1e3ab8] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
              style={{ background: '#2B4DD6' }}
            >
              Написать отзыв
            </button>
          )}
        </div>
      )}

      {/* List */}
      {reviews.length > 0 && (
        <ul className="space-y-4" role="list">
          {reviews.map(r => <ReviewItem key={r.id} review={r} />)}
        </ul>
      )}

      {/* Empty state */}
      {reviews.length === 0 && !showForm && (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">⭐</p>
          <p className="font-bold text-[#1A1F36] text-lg mb-1">Отзывов пока нет</p>
          <p className="text-sm text-[#1A1F36]/55 mb-5">Будьте первым, кто оценит этот товар</p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1e3ab8] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            style={{ background: '#2B4DD6' }}
          >
            Написать отзыв
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && !submittedHold && (
        <ReviewForm
          productDatabaseId={Number(product.id)}
          onSubmittedHold={() => setSubmittedHold(true)}
          onCancel={reviews.length > 0 ? () => setShowForm(false) : undefined}
        />
      )}

      {/* Pending moderation message */}
      {submittedHold && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#7DD3C0]/50 bg-[#EDFAF7] p-5">
          <CheckCircle size={24} className="text-[#22c55e] flex-none mt-0.5" />
          <div>
            <p className="font-bold text-[#1A1F36] mb-1">Спасибо за отзыв!</p>
            <p className="text-sm text-[#1A1F36]/70">
              Мы получили ваш отзыв — он появится здесь после модерации.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewItem({ review }: { review: Review }) {
  const dateStr = review.date
    ? new Date(review.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  return (
    <li className="rounded-2xl border border-[#e2e8f0] p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: '#2B4DD6' }}
            aria-hidden="true"
          >
            {review.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-[#1A1F36] text-sm">{review.author}</p>
            <p className="text-xs text-[#1A1F36]/45">{dateStr}</p>
          </div>
        </div>
        {review.rating !== null && <Stars value={review.rating} size={14} />}
      </div>
      <div
        className="prose prose-sm prose-kantsmir max-w-none"
        dangerouslySetInnerHTML={{ __html: review.content }}
      />
    </li>
  )
}

/* ─── Form ──────────────────────────────────────────────────────── */

const reviewSchema = z.object({
  rating:  z.number().int().min(1, 'Поставьте оценку').max(5),
  author:  z.string().min(2, 'Введите имя'),
  email:   z.email('Введите корректный e-mail'),
  content: z.string().min(10, 'Опишите впечатления — минимум 10 символов'),
})

type ReviewFormData = z.infer<typeof reviewSchema>

function ReviewForm({
  productDatabaseId,
  onSubmittedHold,
  onCancel,
}: {
  productDatabaseId: number
  onSubmittedHold: () => void
  onCancel?: () => void
}) {
  const router = useRouter()
  const [hoverRating, setHoverRating] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  })

  const rating = watch('rating')
  // Регистрируем «rating» как обычное поле — кликаем по звёздам.
  register('rating', { valueAsNumber: true })

  async function onSubmit(data: ReviewFormData) {
    setSubmitError(null)
    const { data: result, error } = await wooWriteReview({
      commentOn: productDatabaseId,
      rating: data.rating,
      content: data.content,
      author: data.author,
      authorEmail: data.email,
    })

    if (error || !result) {
      setSubmitError(error ?? 'Не удалось отправить отзыв')
      return
    }

    // Если опубликован сразу — обновим server data, чтобы отзыв появился в списке.
    if (result.review?.status === 'approve') {
      router.refresh()
    } else {
      // На модерации — покажем сообщение.
      onSubmittedHold()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-2xl border border-[#e2e8f0] p-6 space-y-4">
      <h3 className="font-bold text-[#1A1F36]"
          style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
        Ваш отзыв
      </h3>

      {/* Rating */}
      <div>
        <span className="block text-sm font-medium text-[#1A1F36] mb-1.5">
          Оценка <span className="text-[#FF8A3D]" aria-hidden="true">*</span>
        </span>
        <div className="flex gap-1" role="radiogroup" aria-label="Оценка">
          {[1, 2, 3, 4, 5].map(n => {
            const filled = (hoverRating || rating) >= n
            return (
              <button
                key={n}
                type="button"
                onClick={() => setValue('rating', n, { shouldValidate: true })}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} из 5`}
                className="p-1 rounded transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
              >
                <Star
                  size={28}
                  fill={filled ? '#FF8A3D' : 'none'}
                  stroke={filled ? '#FF8A3D' : '#cbd5e1'}
                />
              </button>
            )
          })}
        </div>
        {errors.rating && <p role="alert" className="mt-1 text-xs text-[#ef4444]">{errors.rating.message}</p>}
      </div>

      {/* Name + email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="rev-author" className="block text-sm font-medium text-[#1A1F36] mb-1.5">
            Имя <span className="text-[#FF8A3D]" aria-hidden="true">*</span>
          </label>
          <input
            id="rev-author"
            type="text"
            autoComplete="name"
            {...register('author')}
            placeholder="Иван"
            className="w-full rounded-xl px-4 py-2.5 text-sm bg-white border border-[#e2e8f0] text-[#1A1F36] focus:outline-none focus:border-[#2B4DD6] transition-colors"
          />
          {errors.author && <p role="alert" className="mt-1 text-xs text-[#ef4444]">{errors.author.message}</p>}
        </div>
        <div>
          <label htmlFor="rev-email" className="block text-sm font-medium text-[#1A1F36] mb-1.5">
            E-mail <span className="text-[#FF8A3D]" aria-hidden="true">*</span>
          </label>
          <input
            id="rev-email"
            type="email"
            autoComplete="email"
            {...register('email')}
            placeholder="ivan@example.com"
            className="w-full rounded-xl px-4 py-2.5 text-sm bg-white border border-[#e2e8f0] text-[#1A1F36] focus:outline-none focus:border-[#2B4DD6] transition-colors"
          />
          {errors.email && <p role="alert" className="mt-1 text-xs text-[#ef4444]">{errors.email.message}</p>}
          <p className="mt-1 text-xs text-[#1A1F36]/45">Не публикуется. Нужен только для подтверждения.</p>
        </div>
      </div>

      {/* Content */}
      <div>
        <label htmlFor="rev-content" className="block text-sm font-medium text-[#1A1F36] mb-1.5">
          Отзыв <span className="text-[#FF8A3D]" aria-hidden="true">*</span>
        </label>
        <textarea
          id="rev-content"
          rows={4}
          {...register('content')}
          placeholder="Поделитесь впечатлениями о товаре"
          className="w-full rounded-xl px-4 py-2.5 text-sm bg-white border border-[#e2e8f0] text-[#1A1F36] focus:outline-none focus:border-[#2B4DD6] transition-colors resize-none"
        />
        {errors.content && <p role="alert" className="mt-1 text-xs text-[#ef4444]">{errors.content.message}</p>}
      </div>

      {submitError && (
        <div role="alert" className="rounded-xl px-4 py-3 text-sm bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444]">
          {submitError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white text-sm transition-all hover:bg-[#1e3ab8] disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
          style={{ background: '#2B4DD6' }}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Опубликовать отзыв
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-6 py-3 text-sm font-semibold text-[#1A1F36]/65 hover:text-[#1A1F36] transition-colors"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  )
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}
