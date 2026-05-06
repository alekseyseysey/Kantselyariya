'use client'

import { useState } from 'react'
import { ShoppingCart, Heart, Plus, Minus, Share2, Check } from 'lucide-react'
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

export default function ProductAddToCart({ product }: Props) {
  const { addItem, items, updateQuantity } = useCart()
  const [wished, setWished]   = useState(false)
  const [copied, setCopied]   = useState(false)

  const cartItem = items.find(i => i.id === product.id)
  const qty = cartItem?.quantity ?? 0
  const discount = product.oldPrice ? calcDiscount(product.price, product.oldPrice) : null

  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 1)
  const deliveryStr = deliveryDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

  function handleAdd() {
    addItem({ id: product.id, name: product.name, price: product.price })
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div className="space-y-5">
      {/* Badges */}
      {product.badges && product.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.badges.map(badge => {
            const style = BADGE_STYLES[badge]
            if (!style) return null
            return (
              <span key={badge} className="rounded-lg px-2.5 py-1 text-xs font-bold"
                style={{ background: style.bg, color: style.text }}>
                {style.label}
                {discount && badge === 'sale' && ` −${discount}%`}
              </span>
            )
          })}
          {product.stock > 0 ? (
            <span className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#22c55e]"
                  style={{ background: '#F0FDF4' }}>
              ✓ В наличии ({product.stock} шт.)
            </span>
          ) : (
            <span className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#ef4444]"
                  style={{ background: '#FEF2F2' }}>
              Нет в наличии
            </span>
          )}
        </div>
      )}

      {/* Price */}
      <div>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-extrabold text-[#2B4DD6]"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-xl text-[#1A1F36]/40 line-through mb-0.5">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
        {discount && (
          <p className="text-sm text-[#FF8A3D] font-semibold mt-1">
            Вы экономите {formatPrice(product.oldPrice! - product.price)} ({discount}%)
          </p>
        )}
      </div>

      {/* Delivery info */}
      <div className="flex items-center gap-2 text-sm text-[#1A1F36]/65">
        <span className="text-[#22c55e]" aria-hidden="true">🚚</span>
        <span>Доставка <strong className="text-[#1A1F36]">{deliveryStr}</strong> при заказе до 18:00</span>
      </div>

      {/* Cart controls */}
      {qty === 0 ? (
        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            aria-label={`Добавить «${product.name}» в корзину`}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-4 font-semibold text-base text-white transition-all duration-200 hover:bg-[#1e3ab8] hover:shadow-lg hover:-translate-y-px disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            style={{ background: '#2B4DD6' }}
          >
            <ShoppingCart size={20} />
            В корзину
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="flex items-center rounded-xl overflow-hidden border-2 border-[#2B4DD6]"
               role="group" aria-label={`Количество: ${qty}`}>
            <button
              onClick={() => updateQuantity(product.id, qty - 1)}
              aria-label="Уменьшить"
              className="w-12 h-12 flex items-center justify-center text-[#2B4DD6] hover:bg-[#EEF2FF] transition-colors focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            >
              <Minus size={18} />
            </button>
            <span className="min-w-[3rem] text-center font-bold text-[#2B4DD6] text-lg" aria-live="polite">
              {qty}
            </span>
            <button
              onClick={() => updateQuantity(product.id, qty + 1)}
              aria-label="Увеличить"
              className="w-12 h-12 flex items-center justify-center text-[#2B4DD6] hover:bg-[#EEF2FF] transition-colors focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            >
              <Plus size={18} />
            </button>
          </div>
          <button
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm text-white transition-all hover:bg-[#1e3ab8] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            style={{ background: '#2B4DD6' }}
          >
            <Check size={16} />
            В корзине
          </button>
        </div>
      )}

      {/* Wishlist + Share */}
      <div className="flex gap-3">
        <button
          onClick={() => setWished(w => !w)}
          aria-label={wished ? 'Убрать из избранного' : 'Добавить в избранное'}
          aria-pressed={wished}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium border-2 transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
          style={{
            borderColor: wished ? '#FF8A3D' : '#e2e8f0',
            color: wished ? '#FF8A3D' : 'rgba(26,31,54,0.65)',
          }}
        >
          <Heart size={16} fill={wished ? '#FF8A3D' : 'none'} />
          {wished ? 'В избранном' : 'В избранное'}
        </button>
        <button
          onClick={handleShare}
          aria-label={copied ? 'Ссылка скопирована' : 'Поделиться'}
          className="w-11 h-11 rounded-xl border-2 border-[#e2e8f0] flex items-center justify-center text-[#1A1F36]/55 hover:border-[#2B4DD6] hover:text-[#2B4DD6] transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
        >
          {copied ? <Check size={16} className="text-[#22c55e]" /> : <Share2 size={16} />}
        </button>
      </div>
    </div>
  )
}