'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react'
import { useCart } from '@/hooks/CartProvider'
import { formatPrice } from '@/lib/utils'
import Breadcrumb from '@/components/ui/Breadcrumb'

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="bg-[#F7F8FB] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb
            items={[{ label: 'Главная', href: '/' }, { label: 'Корзина' }]}
            className="mb-6"
          />
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: '#EEF2FF' }}
            >
              <ShoppingBag size={36} className="text-[#2B4DD6]" />
            </div>
            <h1
              className="text-2xl font-extrabold text-[#1A1F36] mb-2"
              style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
            >
              Корзина пуста
            </h1>
            <p className="text-[#1A1F36]/55 mb-8 max-w-xs">
              Добавьте товары из каталога, чтобы оформить заказ
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

  const delivery = totalPrice >= 50 ? 0 : 5.00
  const orderTotal = totalPrice + delivery

  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[{ label: 'Главная', href: '/' }, { label: 'Корзина' }]}
          className="mb-6"
        />

        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#1A1F36]"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            Корзина
            <span className="ml-2 text-lg font-semibold text-[#1A1F36]/40">
              {totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}
            </span>
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-[#1A1F36]/40 hover:text-[#ef4444] transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            Очистить
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-4 flex gap-4 items-center"
              >
                <div className="relative w-20 h-20 flex-none rounded-xl overflow-hidden bg-[#F7F8FB] border border-[#e2e8f0]">
                  <Image
                    src={item.image ?? '/images/placeholder-product.svg'}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1A1F36] text-sm leading-snug line-clamp-2 mb-1">
                    {item.name}
                  </p>
                  <p className="text-[#2B4DD6] font-bold text-base">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3 flex-none">
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Удалить «${item.name}» из корзины`}
                    className="text-[#1A1F36]/30 hover:text-[#ef4444] transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div
                    className="flex items-center rounded-xl overflow-hidden border-2 border-[#2B4DD6]"
                    role="group"
                    aria-label={`Количество: ${item.quantity}`}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Уменьшить"
                      className="w-9 h-9 flex items-center justify-center text-[#2B4DD6] hover:bg-[#EEF2FF] transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-[2rem] text-center font-bold text-[#2B4DD6] text-sm" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Увеличить"
                      className="w-9 h-9 flex items-center justify-center text-[#2B4DD6] hover:bg-[#EEF2FF] transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="text-sm font-bold text-[#1A1F36]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sticky top-24">
              <h2 className="font-extrabold text-[#1A1F36] text-lg mb-5"
                  style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
                Итого
              </h2>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-[#1A1F36]/60">Товары ({totalItems} шт.)</span>
                  <span className="font-semibold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1A1F36]/60">Доставка</span>
                  <span className="font-semibold">
                    {delivery === 0
                      ? <span className="text-[#22c55e]">Бесплатно</span>
                      : formatPrice(delivery)
                    }
                  </span>
                </div>
                {delivery > 0 && (
                  <p className="text-xs text-[#1A1F36]/45">
                    Бесплатная доставка от 50 руб. (ещё {formatPrice(50 - totalPrice)})
                  </p>
                )}
                <div className="h-px bg-[#e2e8f0]" />
                <div className="flex justify-between text-base font-bold">
                  <span>К оплате</span>
                  <span className="text-[#2B4DD6]">{formatPrice(orderTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-semibold text-white text-base transition-all hover:bg-[#1e3ab8] hover:shadow-lg hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                style={{ background: '#2B4DD6' }}
              >
                Оформить заказ
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/catalog"
                className="block text-center mt-4 text-sm text-[#2B4DD6] hover:underline"
              >
                Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}