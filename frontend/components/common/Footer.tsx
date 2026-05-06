'use client'

import Link from 'next/link'

const COL_COMPANY = [
  { label: 'О нас',      href: '/about' },
  { label: 'Контакты',   href: '/contacts' },
  { label: 'Реквизиты',  href: '/requisites' },
  { label: 'Вакансии',   href: '/jobs' },
  { label: 'Отзывы',     href: '/reviews' },
]

const COL_BUYERS = [
  { label: 'Доставка и оплата', href: '/delivery' },
  { label: 'Возврат',           href: '/return' },
  { label: 'Гарантия',          href: '/guarantee' },
  { label: 'FAQ',               href: '/faq' },
  { label: 'Карта сайта',       href: '/sitemap' },
]

const COL_CATALOG = [
  { label: 'Тетради и дневники',   href: '/catalog/notebooks' },
  { label: 'Ручки и карандаши',    href: '/catalog/pens-pencils' },
  { label: 'Краски и кисти',       href: '/catalog/paints-brushes' },
  { label: 'Ежедневники',          href: '/catalog/planners' },
  { label: 'Рюкзаки и пеналы',    href: '/catalog/bags-pencilcases' },
  { label: 'Хобби и творчество',   href: '/catalog/hobbies-art' },
  { label: 'Подарки',              href: '/catalog/gifts-souvenirs' },
]

const SOCIALS = [
  { name: 'Telegram',  href: 'https://t.me/kantsmir',             emoji: '✈️' },
  { name: 'Viber',     href: 'viber://chat?number=%2B375296104141',emoji: '📲' },
  { name: 'WhatsApp',  href: 'https://wa.me/375296104141',         emoji: '💬' },
  { name: 'Instagram', href: 'https://instagram.com/kantsmir',     emoji: '📸' },
  { name: 'VK',        href: 'https://vk.com/kantsmir',            emoji: '🔵' },
]

export default function Footer() {
  return (
    <footer className="bg-[#1A1F36] text-white">
      {/* Main footer grid */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand + about */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 focus-visible:outline-2 focus-visible:outline-white focus-visible:rounded">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-none"
                style={{ background: 'linear-gradient(135deg, #2B4DD6, #FF8A3D)' }}
                aria-hidden="true"
              >
                КМ
              </div>
              <span className="font-extrabold text-lg" style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
                КанцМир
              </span>
            </Link>
            <p className="text-white/55 text-sm leading-relaxed mb-5">
              Всё для учёбы, работы и творчества — более 12 000 позиций в наличии.
            </p>
            <div className="flex flex-wrap gap-2">
              {SOCIALS.map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  title={s.name}
                  rel="noopener noreferrer"
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all hover:scale-110 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  {s.emoji}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Company */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-4"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
              О компании
            </h3>
            <ul className="space-y-2.5">
              {COL_COMPANY.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/55 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:rounded">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Buyers */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-4"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
              Покупателям
            </h3>
            <ul className="space-y-2.5">
              {COL_BUYERS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/55 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:rounded">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Catalog + subscribe */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-4"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
              Каталог
            </h3>
            <ul className="space-y-2.5 mb-6">
              {COL_CATALOG.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/55 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:rounded">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Subscribe */}
            <form
              onSubmit={e => e.preventDefault()}
              aria-label="Подписка на рассылку"
              className="flex gap-2"
            >
              <label htmlFor="footer-email" className="sr-only">Email для подписки</label>
              <input
                id="footer-email"
                type="email"
                placeholder="Ваш e-mail"
                className="flex-1 min-w-0 rounded-xl px-3 py-2 text-sm bg-white/10 border border-white/15 text-white placeholder:text-white/35 focus:outline-none focus:border-[#7DD3C0] transition-colors"
              />
              <button
                type="submit"
                aria-label="Подписаться"
                className="flex-none rounded-xl px-3 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 focus-visible:outline-2 focus-visible:outline-white"
                style={{ background: '#2B4DD6' }}
              >
                OK
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-white/35">
            © 2026 КанцМир. Все права защищены.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="text-xs text-white/35 hover:text-white/70 transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:rounded">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="text-xs text-white/35 hover:text-white/70 transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:rounded">
              Пользовательское соглашение
            </Link>
          </div>
          {/* Payment icons */}
          <div className="flex items-center gap-2" aria-label="Способы оплаты">
            {['Visa', 'MC', 'БК', 'ЕРИП'].map(p => (
              <span
                key={p}
                className="px-2 py-1 rounded text-[10px] font-bold"
                style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.50)' }}
                aria-label={p}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}