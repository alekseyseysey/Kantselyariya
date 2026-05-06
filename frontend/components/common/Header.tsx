'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Heart, User, ShoppingCart, Phone, Menu, X, ChevronDown } from 'lucide-react'
import { useCart } from '@/hooks/CartProvider'
import { CATEGORIES } from '@/lib/mock-data'

const NAV_LINKS = [
  { label: 'Акции',            href: '/sale' },
  { label: 'Оптовикам',        href: '/wholesale' },
  { label: 'Доставка и оплата',href: '/delivery' },
  { label: 'О компании',       href: '/about' },
  { label: 'Контакты',         href: '/contacts' },
]

export default function Header() {
  const { totalItems } = useCart()
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]      = useState(false)
  const [megaOpen, setMegaOpen]      = useState(false)
  const [searchVal, setSearchVal]    = useState('')
  const megaRef   = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* close mega-menu on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
        boxShadow: scrolled ? '0 2px 20px rgba(26,31,54,0.08)' : '0 1px 0 #e2e8f0',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      {/* ─── Top bar ─── */}
      <div className="border-b border-[#F7F8FB]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 py-2.5">
          {/* Logo */}
          <Link
            href="/"
            aria-label="КанцМир — на главную"
            className="flex-none flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#2B4DD6] focus-visible:rounded"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm"
              style={{ background: 'linear-gradient(135deg, #2B4DD6, #FF8A3D)' }}
              aria-hidden="true"
            >
              КМ
            </div>
            <span
              className="hidden sm:block font-extrabold text-[#1A1F36] text-lg leading-none"
              style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
            >
              КанцМир
            </span>
          </Link>

          {/* Search — 40% width on desktop */}
          <div className="flex-1 max-w-none lg:max-w-[40%] lg:mx-auto">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A1F36]/40 pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor="site-search" className="sr-only">
                Поиск товаров
              </label>
              <input
                ref={searchRef}
                id="site-search"
                type="search"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Найти товар, бренд, артикул…"
                autoComplete="off"
                role="combobox"
                aria-expanded="false"
                aria-haspopup="listbox"
                aria-autocomplete="list"
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#F7F8FB] pl-10 pr-4 py-2.5 text-sm text-[#1A1F36] placeholder:text-[#1A1F36]/40 focus:outline-none focus:border-[#2B4DD6] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Right icons */}
          <nav aria-label="Утилиты" className="flex items-center gap-1 sm:gap-2 ml-auto lg:ml-0">
            {/* Phone — desktop */}
            <div className="hidden lg:flex items-center gap-2 mr-2">
              <Phone size={16} className="text-[#2B4DD6]" aria-hidden="true" />
              <a
                href="tel:+375296104141"
                className="text-sm font-semibold text-[#1A1F36] hover:text-[#2B4DD6] transition-colors focus-visible:outline-2 focus-visible:outline-[#2B4DD6] focus-visible:rounded"
              >
                +375 (29) 610-41-41
              </a>
            </div>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Избранное"
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#1A1F36]/60 hover:bg-[#F7F8FB] hover:text-[#2B4DD6] transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            >
              <Heart size={20} />
            </Link>

            {/* Account */}
            <Link
              href="/account"
              aria-label="Личный кабинет"
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#1A1F36]/60 hover:bg-[#F7F8FB] hover:text-[#2B4DD6] transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            >
              <User size={20} />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`Корзина, ${totalItems} товаров`}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#1A1F36]/60 hover:bg-[#F7F8FB] hover:text-[#2B4DD6] transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                  style={{ background: '#FF8A3D' }}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile burger */}
            <button
              onClick={() => setMenuOpen(m => !m)}
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[#1A1F36]/60 hover:bg-[#F7F8FB] hover:text-[#2B4DD6] transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </nav>
        </div>
      </div>

      {/* ─── Category nav bar ─── */}
      <div className="hidden lg:block" ref={megaRef}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Категории каталога" className="flex items-center gap-1 h-11">
            {/* Catalog button with mega-menu */}
            <div className="relative">
              <button
                onClick={() => setMegaOpen(m => !m)}
                aria-expanded={megaOpen}
                aria-haspopup="menu"
                aria-controls="mega-menu"
                className="flex items-center gap-1.5 h-11 px-4 text-sm font-semibold text-white rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                style={{ background: '#2B4DD6' }}
              >
                <Menu size={15} aria-hidden="true" />
                Каталог
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  style={{ transform: megaOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                />
              </button>

              {/* Mega menu panel */}
              {megaOpen && (
                <div
                  id="mega-menu"
                  role="menu"
                  className="absolute left-0 top-full mt-2 w-[680px] rounded-2xl bg-white shadow-2xl border border-[#e2e8f0] z-50 p-4 grid grid-cols-3 gap-1"
                >
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/catalog/${cat.slug}`}
                      role="menuitem"
                      onClick={() => setMegaOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#1A1F36] hover:bg-[#F7F8FB] hover:text-[#2B4DD6] transition-colors focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                    >
                      <span className="text-xl" aria-hidden="true">{cat.emoji}</span>
                      <span className="font-medium leading-tight">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Nav links */}
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="h-11 px-4 flex items-center text-sm font-medium text-[#1A1F36]/75 hover:text-[#2B4DD6] hover:bg-[#F7F8FB] rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ─── Mobile nav ─── */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Мобильная навигация"
          className="lg:hidden border-t border-[#F7F8FB] bg-white"
        >
          <div className="max-w-[1280px] mx-auto px-4 py-4 space-y-1">
            <Link
              href="/catalog"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-white"
              style={{ background: '#2B4DD6' }}
            >
              <Menu size={16} />
              Каталог
            </Link>
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-[#1A1F36]/75 hover:text-[#2B4DD6] hover:bg-[#F7F8FB] transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 px-4 pt-2 border-t border-[#F7F8FB]">
              <Phone size={16} className="text-[#2B4DD6]" aria-hidden="true" />
              <a href="tel:+375296104141" className="text-sm font-semibold text-[#1A1F36] hover:text-[#2B4DD6]">
                +375 (29) 610-41-41
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}