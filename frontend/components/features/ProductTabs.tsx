'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/lib/types'

type TabId = 'description' | 'specs' | 'reviews' | 'delivery'

const TABS: { id: TabId; label: string }[] = [
  { id: 'description', label: 'Описание' },
  { id: 'specs',       label: 'Характеристики' },
  { id: 'reviews',     label: 'Отзывы' },
  { id: 'delivery',    label: 'Доставка и оплата' },
]

interface Props {
  product: Product
}

const deliveryContent = `
**Доставка по Минску** — в течение 24 часов с момента подтверждения заказа.

**Доставка по Беларуси** — 1–3 рабочих дня курьером или в пункт выдачи СДЭК / Европочта.

**Бесплатная доставка** при заказе от 50 руб.

**Самовывоз** — бесплатно, г. Минск, ул. Примерная, 12, офис 305 (пн–пт 8:30–17:00).

**Способы оплаты:** банковская карта онлайн, наличные курьеру, по счёту для юрлиц, рассрочка (Халва, Магнит).
`

export default function ProductTabs({ product }: Props) {
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
              <div className="prose prose-sm max-w-none text-[#1A1F36]/80 leading-relaxed">
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

            {activeTab === 'reviews' && (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">⭐</p>
                <p className="font-bold text-[#1A1F36] text-lg mb-1">Отзывов пока нет</p>
                <p className="text-sm text-[#1A1F36]/55 mb-5">Будьте первым, кто оценит этот товар</p>
                <button
                  className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1e3ab8] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                  style={{ background: '#2B4DD6' }}
                >
                  Написать отзыв
                </button>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-3 text-sm text-[#1A1F36]/80 leading-relaxed">
                {deliveryContent.trim().split('\n\n').map((para, i) => (
                  <p key={i} dangerouslySetInnerHTML={{
                    __html: para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  }} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}