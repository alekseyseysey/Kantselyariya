import type { Metadata } from 'next'
import { fetchFaqItems } from '@/lib/wp-api'
import Breadcrumb from '@/components/ui/Breadcrumb'
import FAQSection from '@/components/features/FAQSection'

export const metadata: Metadata = {
  title: 'Частые вопросы — КанцМир',
  description: 'Ответы на самые популярные вопросы о заказе, доставке, оплате и возврате товаров в КанцМир.',
}

export default async function FAQPage() {
  const items = await fetchFaqItems()

  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Частые вопросы' },
          ]}
          className="mb-8"
        />
        <FAQSection items={items} />
      </div>
    </div>
  )
}
