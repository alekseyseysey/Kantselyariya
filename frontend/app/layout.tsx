import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import CallbackModal from '@/components/common/CallbackModal'
import CartProvider from '@/hooks/CartProvider'
import WishlistProvider from '@/hooks/WishlistProvider'
import { fetchCategories, fetchSiteSettings } from '@/lib/wp-api'

const manrope = Manrope({
  variable: '--font-manrope-var',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  variable: '--font-inter-var',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  weight: ['400', '500', '600'],
})

// Метаданные тоже подтягиваем динамически — WP Site Title подменяется тут.
export async function generateMetadata(): Promise<Metadata> {
  const site = await fetchSiteSettings()
  const fullTitle = `${site.title} — ${site.description}`
  return {
    title: { default: fullTitle, template: `%s | ${site.title}` },
    description: site.description,
    keywords: ['канцтовары', 'канцелярия', 'школьные товары', 'ручки', 'тетради', 'Минск', 'Беларусь'],
    openGraph: {
      type: 'website',
      locale: 'ru_BY',
      siteName: site.title,
      title: fullTitle,
      description: site.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: site.description,
    },
    robots: { index: true, follow: true },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, categories] = await Promise.all([
    fetchSiteSettings(),
    fetchCategories(),
  ])

  return (
    <html lang="ru" className={`${manrope.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col antialiased bg-white text-[#1A1F36]">
        <CartProvider>
          <WishlistProvider>
            <a href="#main-content" className="skip-link">
              Перейти к содержимому
            </a>
            <Header siteName={site.title} />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer
              siteName={site.title}
              siteTagline={site.description}
              categories={categories}
            />
            <CallbackModal />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}