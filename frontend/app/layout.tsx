import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import CallbackModal from '@/components/common/CallbackModal'
import CartProvider from '@/hooks/CartProvider'

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

export const metadata: Metadata = {
  title: {
    default: 'КанцМир — канцелярские товары с доставкой по Беларуси',
    template: '%s | КанцМир',
  },
  description:
    'Более 12 000 канцелярских товаров в наличии. Доставка по Беларуси за 24 часа. Оптовые цены от 1 единицы — выгодно школам, офисам, студиям.',
  keywords: ['канцтовары', 'канцелярия', 'школьные товары', 'ручки', 'тетради', 'Минск', 'Беларусь'],
  openGraph: {
    type: 'website',
    locale: 'ru_BY',
    siteName: 'КанцМир',
    title: 'КанцМир — канцелярские товары с доставкой по Беларуси',
    description: 'Более 12 000 канцелярских товаров в наличии. Доставка за 24 часа.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'КанцМир — канцелярские товары',
    description: 'Более 12 000 позиций в наличии. Доставка по Беларуси за 24 часа.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col antialiased bg-white text-[#1A1F36]">
        <CartProvider>
          <a href="#main-content" className="skip-link">
            Перейти к содержимому
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <CallbackModal />
        </CartProvider>
      </body>
    </html>
  )
}