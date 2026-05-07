import Link from 'next/link'
import { CheckCircle, Package, Phone } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ total?: string; number?: string }>
}) {
  const { id } = await params
  const { total, number } = await searchParams

  // `id` приходит из `databaseId` Woo-ордера, `number` — это user-friendly orderNumber.
  const displayNumber = number ?? id

  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Заказ' },
          ]}
          className="mb-8"
        />

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 sm:p-12 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: '#F0FDF4' }}
            aria-hidden="true"
          >
            <CheckCircle size={48} className="text-[#22c55e]" />
          </div>

          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#1A1F36] mb-3"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            Заказ №{displayNumber} принят
          </h1>

          <p className="text-[#1A1F36]/65 text-base mb-8 max-w-md mx-auto leading-relaxed">
            Спасибо за покупку! Мы получили ваш заказ и отправили подтверждение
            на указанный e-mail. Менеджер свяжется с вами для уточнения деталей доставки.
          </p>

          {total && (
            <div className="inline-flex items-center gap-3 rounded-xl px-5 py-3 mb-8 bg-[#EEF2FF]">
              <span className="text-sm text-[#1A1F36]/60">Сумма заказа:</span>
              <span
                className="text-xl font-extrabold text-[#2B4DD6]"
                dangerouslySetInnerHTML={{ __html: total }}
              />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8 text-left">
            <div className="rounded-xl bg-[#F7F8FB] p-4">
              <Package size={20} className="text-[#2B4DD6] mb-2" />
              <p className="text-xs text-[#1A1F36]/55 mb-1">Доставка</p>
              <p className="text-sm font-semibold text-[#1A1F36]">
                По Минску — 24 часа<br />По Беларуси — 1–3 дня
              </p>
            </div>
            <div className="rounded-xl bg-[#F7F8FB] p-4">
              <Phone size={20} className="text-[#2B4DD6] mb-2" />
              <p className="text-xs text-[#1A1F36]/55 mb-1">Поддержка</p>
              <a href="tel:+375296104141" className="text-sm font-semibold text-[#2B4DD6] hover:underline">
                +375 (29) 610-41-41
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all hover:bg-[#1e3ab8] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
              style={{ background: '#2B4DD6' }}
            >
              Продолжить покупки
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold border-2 border-[#e2e8f0] text-[#1A1F36]/75 transition-all hover:border-[#2B4DD6] hover:text-[#2B4DD6] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
