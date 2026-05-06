'use client'

import { useState, useMemo } from 'react'
import { SlidersHorizontal, X, ChevronDown, Grid3X3, List } from 'lucide-react'
import ProductCard from './ProductCard'
import type { Product, Category } from '@/lib/types'

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'new'

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: 'Популярные', value: 'popular' },
  { label: 'Дешевле',    value: 'price-asc' },
  { label: 'Дороже',     value: 'price-desc' },
  { label: 'Новинки',    value: 'new' },
]

interface Props {
  allProducts: Product[]
  allCategories: Category[]
  preselectedCategoryId?: string
  initialSaleOnly?: boolean 
}

export default function CatalogView({ allProducts, allCategories, preselectedCategoryId, initialSaleOnly = false }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    preselectedCategoryId ? [preselectedCategoryId] : []
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [onlySale, setOnlySale] = useState(false)
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [sort, setSort] = useState<SortKey>('popular')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [gridView, setGridView] = useState<'grid' | 'list'>('grid')
  const [sortOpen, setSortOpen] = useState(false)

  const availableBrands = useMemo(() => {
    const s = new Set(allProducts.map(p => p.brand))
    return Array.from(s).sort()
  }, [allProducts])

  const filtered = useMemo(() => {
    let items = [...allProducts]
    if (selectedCategories.length) {
      items = items.filter(p => selectedCategories.includes(p.categoryId))
    }
    if (selectedBrands.length) {
      items = items.filter(p => selectedBrands.includes(p.brand))
    }
    if (onlySale) items = items.filter(p => p.oldPrice && p.oldPrice > p.price)
    if (onlyInStock) items = items.filter(p => p.stock > 0)

    switch (sort) {
      case 'price-asc':  items.sort((a, b) => a.price - b.price); break
      case 'price-desc': items.sort((a, b) => b.price - a.price); break
      case 'new':        items.sort((a, b) => (b.badges?.includes('new') ? 1 : 0) - (a.badges?.includes('new') ? 1 : 0)); break
      default:           items.sort((a, b) => b.reviewCount - a.reviewCount)
    }
    return items
  }, [allProducts, selectedCategories, selectedBrands, onlySale, onlyInStock, sort])

  function toggleCategory(id: string) {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }
  function toggleBrand(b: string) {
    setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
  }

  const activeFilterCount = selectedCategories.length + selectedBrands.length + (onlySale ? 1 : 0) + (onlyInStock ? 1 : 0)

  function clearAll() {
    setSelectedCategories(preselectedCategoryId ? [preselectedCategoryId] : [])
    setSelectedBrands([])
    setOnlySale(false)
    setOnlyInStock(false)
  }

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold text-[#1A1F36] text-sm uppercase tracking-wide mb-3"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
          Категория
        </h3>
        <ul className="space-y-2">
          {allCategories.map(cat => (
            <li key={cat.id}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="w-4 h-4 rounded accent-[#2B4DD6] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                />
                <span className="text-sm text-[#1A1F36]/75 group-hover:text-[#2B4DD6] transition-colors leading-tight">
                  {cat.name}
                </span>
                <span className="ml-auto text-xs text-[#1A1F36]/35">{cat.count}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-bold text-[#1A1F36] text-sm uppercase tracking-wide mb-3"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
          Бренд
        </h3>
        <ul className="space-y-2">
          {availableBrands.map(brand => (
            <li key={brand}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-4 h-4 rounded accent-[#2B4DD6] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                />
                <span className="text-sm text-[#1A1F36]/75 group-hover:text-[#2B4DD6] transition-colors">{brand}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={onlySale} onChange={e => setOnlySale(e.target.checked)}
            className="w-4 h-4 rounded accent-[#FF8A3D] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]" />
          <span className="text-sm text-[#1A1F36]/75">Только со скидкой</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={onlyInStock} onChange={e => setOnlyInStock(e.target.checked)}
            className="w-4 h-4 rounded accent-[#2B4DD6] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]" />
          <span className="text-sm text-[#1A1F36]/75">Только в наличии</span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full py-2.5 rounded-xl border-2 border-[#2B4DD6] text-[#2B4DD6] text-sm font-semibold hover:bg-[#2B4DD6] hover:text-white transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
        >
          Сбросить фильтры ({activeFilterCount})
        </button>
      )}
    </div>
  )

  return (
    <div className="flex gap-8">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:block flex-none w-56 xl:w-64" aria-label="Фильтры">
        <div className="sticky top-24 bg-white rounded-2xl p-5 border border-[#e2e8f0]">
          <FilterPanel />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <p className="text-sm text-[#1A1F36]/60">
            <span className="font-semibold text-[#1A1F36]">{filtered.length}</span> товаров
          </p>

          <div className="flex items-center gap-2 ml-auto">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setFiltersOpen(true)}
              aria-expanded={filtersOpen}
              aria-controls="mobile-filters"
              className="lg:hidden flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium border border-[#e2e8f0] text-[#1A1F36]/70 hover:border-[#2B4DD6] hover:text-[#2B4DD6] transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            >
              <SlidersHorizontal size={15} />
              Фильтры
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: '#2B4DD6' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(o => !o)}
                aria-expanded={sortOpen}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium border border-[#e2e8f0] text-[#1A1F36]/70 hover:border-[#2B4DD6] hover:text-[#2B4DD6] transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
              >
                {SORT_OPTIONS.find(o => o.value === sort)?.label}
                <ChevronDown size={14} style={{ transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-[#e2e8f0] z-20 py-1 overflow-hidden">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setSortOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sort === opt.value
                          ? 'bg-[#EEF2FF] text-[#2B4DD6] font-semibold'
                          : 'text-[#1A1F36]/70 hover:bg-[#F7F8FB]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View toggle */}
            <div className="hidden sm:flex items-center rounded-xl border border-[#e2e8f0] overflow-hidden">
              <button
                onClick={() => setGridView('grid')}
                aria-label="Сетка"
                aria-pressed={gridView === 'grid'}
                className="w-9 h-9 flex items-center justify-center transition-colors"
                style={{ background: gridView === 'grid' ? '#EEF2FF' : 'transparent', color: gridView === 'grid' ? '#2B4DD6' : '#1A1F3699' }}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setGridView('list')}
                aria-label="Список"
                aria-pressed={gridView === 'list'}
                className="w-9 h-9 flex items-center justify-center transition-colors"
                style={{ background: gridView === 'list' ? '#EEF2FF' : 'transparent', color: gridView === 'list' ? '#2B4DD6' : '#1A1F3699' }}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-5" aria-label="Активные фильтры">
            {selectedCategories.map(id => {
              const cat = allCategories.find(c => c.id === id)
              return cat ? (
                <button
                  key={id}
                  onClick={() => toggleCategory(id)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-[#2B4DD6] hover:bg-[#2B4DD6] hover:text-white transition-all"
                  style={{ background: '#EEF2FF' }}
                >
                  {cat.name} <X size={12} />
                </button>
              ) : null
            })}
            {selectedBrands.map(b => (
              <button
                key={b}
                onClick={() => toggleBrand(b)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-[#FF8A3D] hover:bg-[#FF8A3D] hover:text-white transition-all"
                style={{ background: '#FFF4EC' }}
              >
                {b} <X size={12} />
              </button>
            ))}
            {onlySale && (
              <button onClick={() => setOnlySale(false)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-[#FF8A3D] hover:bg-[#FF8A3D] hover:text-white transition-all"
                style={{ background: '#FFF4EC' }}>
                Со скидкой <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bold text-[#1A1F36] text-lg mb-2">Ничего не найдено</p>
            <p className="text-[#1A1F36]/55 text-sm mb-4">Попробуйте изменить фильтры</p>
            <button onClick={clearAll} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1e3ab8]"
              style={{ background: '#2B4DD6' }}>
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <ul
            role="list"
            className={gridView === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'flex flex-col gap-3'}
          >
            {filtered.map(p => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[#1A1F36]/50 backdrop-blur-sm lg:hidden"
            onClick={() => setFiltersOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-filters"
            role="dialog"
            aria-label="Фильтры"
            aria-modal="true"
            className="fixed left-0 top-0 bottom-0 z-50 w-80 max-w-full bg-white overflow-y-auto p-6 shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-[#1A1F36] text-lg"
                  style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
                Фильтры
              </h2>
              <button
                onClick={() => setFiltersOpen(false)}
                aria-label="Закрыть фильтры"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#1A1F36]/50 hover:bg-[#F7F8FB] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <FilterPanel />
          </div>
        </>
      )}
    </div>
  )
}