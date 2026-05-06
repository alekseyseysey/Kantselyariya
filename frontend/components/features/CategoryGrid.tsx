import Link from 'next/link'
import type { Category } from '@/lib/types'

interface Props {
  categories: Category[]
}

export default function CategoryGrid({ categories }: Props) {
  return (
    <section aria-labelledby="categories-heading" className="py-16 bg-[#F7F8FB]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#2B4DD6] mb-2">
              Каталог
            </p>
            <h2
              id="categories-heading"
              className="text-3xl sm:text-4xl font-extrabold text-[#1A1F36]"
              style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
            >
              Все категории товаров
            </h2>
          </div>
          <Link
            href="/catalog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#2B4DD6] hover:text-[#1e3ab8] transition-colors"
          >
            Весь каталог
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <ul
          role="list"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {categories.map(cat => (
            <li key={cat.id}>
              <Link
                href={`/catalog/${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-transparent transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#2B4DD6]/20 focus-visible:outline-2 focus-visible:outline-[#2B4DD6] focus-visible:outline-offset-2"
              >
                {/* Icon tile */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-transform duration-200 group-hover:scale-110"
                  style={{ background: cat.iconBg }}
                  aria-hidden="true"
                >
                  {cat.emoji}
                </div>

                {/* Name */}
                <span className="text-sm font-semibold text-[#1A1F36] text-center leading-tight group-hover:text-[#2B4DD6] transition-colors">
                  {cat.name}
                </span>

                {/* Count */}
                <span className="text-xs text-[#1A1F36]/50">
                  {cat.count.toLocaleString('ru-RU')} товаров
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}