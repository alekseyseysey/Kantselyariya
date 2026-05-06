import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'
import WholesaleSection from '@/components/features/WholesaleSection'

export const metadata: Metadata = {
  title: 'Оптовые закупки — КанцМир',
  description: 'Специальные условия для юридических лиц и ИП. Отсрочка платежа, персональный менеджер, доставка по всей Беларуси.',
}

export default function WholesalePage() {
  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Оптовые закупки' },
          ]}
          className="mb-8"
        />
        <WholesaleSection />
      </div>
    </div>
  )
}