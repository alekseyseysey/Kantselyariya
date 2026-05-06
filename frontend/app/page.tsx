import type { Metadata } from 'next'
import { fetchCategories, fetchFeaturedProducts, fetchSaleProducts } from '@/lib/wp-api'
import HeroSection from '@/components/features/HeroSection'
import PromoSlider from '@/components/features/PromoSlider'
import CategoryGrid from '@/components/features/CategoryGrid'
import ProductCarousel from '@/components/features/ProductCarousel'
import WhyUs from '@/components/features/WhyUs'
import WholesaleSection from '@/components/features/WholesaleSection'
import FAQSection from '@/components/features/FAQSection'
import ContactsSection from '@/components/features/ContactsSection'

export const metadata: Metadata = {
  title: 'КанцМир — канцелярские товары с доставкой по Беларуси',
  description:
    'Более 12 000 канцелярских товаров в наличии. Доставка по Беларуси за 24 часа. Оптовые цены от 1 единицы.',
}

/* JSON-LD structured data */
function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'КанцМир',
    url: 'https://kantsmir.by',
    description: 'Интернет-магазин канцелярских товаров в Беларуси',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Примерная, 12, офис 305',
      addressLocality: 'Минск',
      addressCountry: 'BY',
    },
    telephone: '+375-29-610-41-41',
    email: 'info@kantsmir.by',
    priceRange: '₽',
    openingHours: 'Mo-Su 09:00-22:00',
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default async function HomePage() {
  const [categories, featured, sale] = await Promise.all([
    fetchCategories(),
    fetchFeaturedProducts(10),
    fetchSaleProducts(10),
  ])

  return (
    <>
      <JsonLd />

      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Promo slider */}
      <PromoSlider />

      {/* 3. Categories */}
      <CategoryGrid categories={categories} />

      {/* 4. Sale carousel */}
      {sale.length > 0 && (
        <ProductCarousel
          title="Цены, от которых не отвертеться"
          badge="🔥 Акции"
          products={sale}
        />
      )}

      {/* 5. Featured carousel */}
      {featured.length > 0 && (
        <section className="bg-[#F7F8FB]">
          <ProductCarousel
            title="Популярные товары"
            badge="⭐ Хиты продаж"
            products={featured}
          />
        </section>
      )}

      {/* 6. Why us */}
      <WhyUs />

      {/* 7. Wholesale CTA */}
      <WholesaleSection />

      {/* 8. FAQ */}
      <FAQSection />

      {/* 9. Contacts */}
      <ContactsSection />
    </>
  )
}