'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'
import type { Product } from '@/lib/types'

interface Props {
  title: string
  badge?: string
  products: Product[]
}

export default function ProductCarousel({ title, badge, products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    const amount = el.offsetWidth * 0.8
    el.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  return (
    <section aria-labelledby={`carousel-${title}`} className="py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            {badge && (
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white mb-2"
                style={{ background: '#FF8A3D' }}
              >
                {badge}
              </span>
            )}
            <h2
              id={`carousel-${title}`}
              className="text-3xl sm:text-4xl font-extrabold text-[#1A1F36]"
              style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
            >
              {title}
            </h2>
          </div>
          {/* Scroll buttons — desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              aria-label="Прокрутить влево"
              className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#2B4DD6]/20 text-[#2B4DD6] hover:bg-[#2B4DD6] hover:text-white hover:border-[#2B4DD6] transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Прокрутить вправо"
              className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#2B4DD6]/20 text-[#2B4DD6] hover:bg-[#2B4DD6] hover:text-white hover:border-[#2B4DD6] transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          role="list"
          aria-label={title}
        >
          {products.map(p => (
            <div
              key={p.id}
              className="flex-none w-[230px] sm:w-[250px] snap-start"
              role="listitem"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}