'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Heart, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/hooks/CartProvider'
import { useWishlist } from '@/hooks/WishlistProvider'
import { formatPrice, calcDiscount } from '@/lib/utils'
import Breadcrumb from '@/components/ui/Breadcrumb'

export default function WishlistPage() {
  const { items, totalItems, hydrated, removeItem, clear } = useWishlist()
  const { items: cartItems, addItem: addToCart, updateQuantity } = useCart()

  // До гидратации показываем skeleton — иначе на одно мгновение мелькнёт
  // «Список пуст» даже если в localStorage сохранены товары.
  if (!hydrated) {
    return (
      <div className="bg-[#F7F8FB] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb
            items={[{ label: 'Главная', href: '/' }, { label: 'Избранное' }]}
            className="mb-6"
          />
          <div className="h-64 rounded-2xl bg-white animate-pulse" aria-hidden="true" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#F7F8FB] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb
            items={[{ label: 'Главная', href: '/' }, { label: 'Избранное' }]}
            className="mb-6"
          />
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: '#FFF4EC' }}
            >
              <Heart size={36} className="text-[#FF8A3D]" />
            </div>
            <h1
              className="text-2xl font-extrabold text-[#1A1F36] mb-2"
              style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
            >
              Список избранного пуст
            </h1>
            <p className="text-[#1A1F36]/55 mb-8 max-w-xs">
              Жмите на сердечко на карточке товара — он окажется здесь
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
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[{ label: 'Главная', href: '/' }, { label: 'Избранное' }]}
          className="mb-6"
        />

        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#1A1F36]"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            Избранное
            <span className="ml-2 text-lg font-semibold text-[#1A1F36]/40">
              {totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}
            </span>
          </h1>
          <button
            onClick={clear}
            className="text-sm text-[#1A1F36]/40 hover:text-[#ef4444] transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            Очистить
          </button>
        </div>

        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => {
            const discount = item.oldPrice ? calcDiscount(item.price, item.oldPrice) : null
            return (
              <li
                key={item.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-4 flex gap-4 items-stretch"
              >
                <Link
                  href={`/product/${item.slug}`}
                  aria-label={item.name}
                  className="relative w-24 h-24 flex-none rounded-xl overflow-hidden bg-[#F7F8FB] border border-[#e2e8f0] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                >
                  <Image
                    src={item.image ?? '/images/placeholder-product.svg'}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col">
                  {item.brand && (
                    <p className="text-xs text-[#1A1F36]/50 font-medium uppercase tracking-wide mb-1">
                      {item.brand}
                    </p>
                  )}
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-semibold text-[#1A1F36] text-sm leading-snug line-clamp-2 mb-2 hover:text-[#2B4DD6] transition-colors focus-visible:outline-2 focus-visible:outline-[#2B4DD6] focus-visible:rounded"
                  >
                    {item.name}
                  </Link>

                  <div className="flex items-end gap-2 mt-auto">
                    <span className="text-lg font-bold text-[#2B4DD6]">
                      {formatPrice(item.price)}
                    </span>
                    {item.oldPrice && (
                      <>
                        <span className="text-xs text-[#1A1F36]/40 line-through mb-1">
                          {formatPrice(item.oldPrice)}
                        </span>
                        {discount && (
                          <span className="text-xs text-[#FF8A3D] font-semibold mb-1">
                            −{discount}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-none">
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Убрать «${item.name}» из избранного`}
                    className="text-[#1A1F36]/30 hover:text-[#ef4444] transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>

                  {(() => {
                    const cartItem = cartItems.find(c => c.id === item.id)
                    const qty = cartItem?.quantity ?? 0
                    if (qty === 0) {
                      return (
                        <button
                          onClick={() =>
                            addToCart({
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              image: item.image,
                            })
                          }
                          aria-label={`Добавить «${item.name}» в корзину`}
                          className="mt-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-[#1e3ab8] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                          style={{ background: '#2B4DD6' }}
                        >
                          <ShoppingCart size={15} />
                          В корзину
                        </button>
                      )
                    }
                    return (
                      <div
                        className="mt-auto flex items-center gap-1 rounded-xl overflow-hidden"
                        style={{ background: '#2B4DD6' }}
                        role="group"
                        aria-label={`«${item.name}» в корзине: ${qty}`}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, qty - 1)}
                          aria-label="Уменьшить количество"
                          className="w-8 h-9 flex items-center justify-center text-white hover:bg-[#1e3ab8] transition-colors focus-visible:outline-2 focus-visible:outline-white"
                        >
                          <Minus size={14} />
                        </button>
                        <span
                          className="min-w-[1.5rem] text-center text-sm font-bold text-white"
                          aria-live="polite"
                        >
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, qty + 1)}
                          aria-label="Увеличить количество"
                          className="w-8 h-9 flex items-center justify-center text-white hover:bg-[#1e3ab8] transition-colors focus-visible:outline-2 focus-visible:outline-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )
                  })()}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
