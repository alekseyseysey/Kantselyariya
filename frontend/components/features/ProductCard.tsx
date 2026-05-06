'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Plus, Minus } from 'lucide-react'
import { useCart } from '@/hooks/CartProvider'
import { formatPrice, calcDiscount } from '@/lib/utils'
import type { Product } from '@/lib/types'

const BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  hit:        { bg: '#2B4DD6', text: '#fff', label: 'Хит' },
  bestseller: { bg: '#2B4DD6', text: '#fff', label: 'Бестселлер' },
  new:        { bg: '#7DD3C0', text: '#fff', label: 'Новинка' },
  sale:       { bg: '#FF8A3D', text: '#fff', label: 'Скидка' },
}

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { addItem, items, updateQuantity } = useCart()
  const [wished, setWished] = useState(false)

  const cartItem = items.find(i => i.id === product.id)
  const qty = cartItem?.quantity ?? 0

  const discount = product.oldPrice ? calcDiscount(product.price, product.oldPrice) : null
  const firstBadge = product.badges?.[0]
  const badgeStyle = firstBadge ? BADGE_STYLES[firstBadge] : null

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    addItem({ id: product.id, name: product.name, price: product.price })
  }

  function handleInc(e: React.MouseEvent) {
    e.preventDefault()
    updateQuantity(product.id, qty + 1)
  }

  function handleDec(e: React.MouseEvent) {
    e.preventDefault()
    updateQuantity(product.id, qty - 1)
  }

  function handleWish(e: React.MouseEvent) {
    e.preventDefault()
    setWished(w => !w)
  }

  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden border border-transparent hover:border-[#2B4DD6]/15 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Badge */}
      {badgeStyle && (
        <div
          className="absolute top-3 left-3 z-10 rounded-lg px-2.5 py-1 text-xs font-bold"
          style={{ background: badgeStyle.bg, color: badgeStyle.text }}
          aria-label={badgeStyle.label}
        >
          {badgeStyle.label}
          {discount && firstBadge === 'sale' && ` −${discount}%`}
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={handleWish}
        aria-label={wished ? 'Убрать из избранного' : 'Добавить в избранное'}
        aria-pressed={wished}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)' }}
      >
        <Heart
          size={16}
          style={{ color: wished ? '#FF8A3D' : '#1A1F36' }}
          fill={wished ? '#FF8A3D' : 'none'}
        />
      </button>

      {/* Image */}
      <Link href={`/product/${product.slug}`} tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-square bg-[#F7F8FB] overflow-hidden">
          <Image
            src={product.images[0] || '/images/placeholder-product.svg'}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {/* Brand */}
        <div className="text-xs text-[#1A1F36]/50 font-medium uppercase tracking-wide mb-1">
          {product.brand}
        </div>

        {/* Name */}
        <Link
          href={`/product/${product.slug}`}
          className="block text-sm font-semibold text-[#1A1F36] leading-snug mb-2 line-clamp-2 hover:text-[#2B4DD6] transition-colors focus-visible:outline-2 focus-visible:outline-[#2B4DD6] focus-visible:rounded"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3" aria-label={`Рейтинг ${product.rating} из 5, ${product.reviewCount} отзывов`}>
          <div className="flex gap-0.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="w-3 h-3" fill={i < Math.round(product.rating) ? '#FF8A3D' : '#e2e8f0'} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-[#1A1F36]/50">({product.reviewCount})</span>
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-lg font-bold text-[#2B4DD6]">
              {formatPrice(product.price)}
            </div>
            {product.oldPrice && (
              <div className="text-xs text-[#1A1F36]/40 line-through">
                {formatPrice(product.oldPrice)}
              </div>
            )}
          </div>

          {/* Cart controls */}
          {qty === 0 ? (
            <button
              onClick={handleAddToCart}
              aria-label={`Добавить «${product.name}» в корзину`}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1e3ab8] hover:shadow-lg hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
              style={{ background: '#2B4DD6' }}
            >
              <ShoppingCart size={15} />
              В корзину
            </button>
          ) : (
            <div
              className="flex items-center gap-1 rounded-xl overflow-hidden"
              style={{ background: '#2B4DD6' }}
              role="group"
              aria-label={`Количество «${product.name}» в корзине: ${qty}`}
            >
              <button
                onClick={handleDec}
                aria-label="Уменьшить количество"
                className="w-8 h-9 flex items-center justify-center text-white hover:bg-[#1e3ab8] transition-colors focus-visible:outline-2 focus-visible:outline-white"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-[1.5rem] text-center text-sm font-bold text-white" aria-live="polite">
                {qty}
              </span>
              <button
                onClick={handleInc}
                aria-label="Увеличить количество"
                className="w-8 h-9 flex items-center justify-center text-white hover:bg-[#1e3ab8] transition-colors focus-visible:outline-2 focus-visible:outline-white"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}