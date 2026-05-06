import type { Metadata } from 'next'
import { Truck, MapPin, CreditCard, Clock } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Доставка и оплата — КанцМир',
  description: 'Условия доставки по Минску и всей Беларуси. Самовывоз, СДЭК, Европочта. Способы оплаты.',
}

const DELIVERY_ZONES = [
  {
    icon: '🏙️',
    title: 'Минск',
    time: 'В течение 24 часов',
    price: '5 руб. / бесплатно от 50 руб.',
    desc: 'Доставка курьером по Минску в удобное время. Интервалы доставки: 9:00–13:00, 13:00–18:00, 18:00–21:00.',
  },
  {
    icon: '🗺️',
    title: 'По Беларуси',
    time: '1–3 рабочих дня',
    price: '6–9 руб. в зависимости от веса',
    desc: 'Доставка через СДЭК или Европочту в ваш город. Пункты выдачи по всей стране.',
  },
  {
    icon: '🏪',
    title: 'Самовывоз',
    time: 'В день заказа',
    price: 'Бесплатно',
    desc: 'г. Минск, ул. Примерная, 12, офис 305. Пн–Пт: 8:30–17:00, Сб: 10:00–15:00.',
  },
]

const PAYMENT_METHODS = [
  { icon: '💳', title: 'Банковская карта онлайн', desc: 'Visa, Mastercard, Мир — при оформлении заказа на сайте.' },
  { icon: '💵', title: 'Наличными курьеру', desc: 'При получении заказа от курьера по Минску.' },
  { icon: '🏦', title: 'Для юридических лиц', desc: 'Оплата по счёту с НДС. Отсрочка платежа до 30 дней.' },
  { icon: '🔄', title: 'Рассрочка', desc: 'Халва (Совкомбанк), Магнит — рассрочка 0% на 3–12 месяцев.' },
]

export default function DeliveryPage() {
  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Доставка и оплата' },
          ]}
          className="mb-6"
        />

        <h1
          className="text-3xl sm:text-4xl font-extrabold text-[#1A1F36] mb-2"
          style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
        >
          Доставка и оплата
        </h1>
        <p className="text-[#1A1F36]/60 mb-10">
          Доставляем по всей Беларуси. Бесплатная доставка по Минску при заказе от 50 руб.
        </p>

        {/* Delivery zones */}
        <section aria-labelledby="delivery-heading" className="mb-12">
          <h2
            id="delivery-heading"
            className="text-xl font-extrabold text-[#1A1F36] mb-5 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            <Truck size={22} className="text-[#2B4DD6]" />
            Способы доставки
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DELIVERY_ZONES.map(zone => (
              <div
                key={zone.title}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:border-[#2B4DD6]/30 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-3">{zone.icon}</div>
                <h3 className="font-bold text-[#1A1F36] text-base mb-1">{zone.title}</h3>
                <div className="flex items-center gap-1.5 text-sm text-[#22c55e] font-semibold mb-1">
                  <Clock size={14} />
                  {zone.time}
                </div>
                <div className="text-sm font-semibold text-[#2B4DD6] mb-3">{zone.price}</div>
                <p className="text-sm text-[#1A1F36]/60 leading-relaxed">{zone.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Address */}
        <section aria-labelledby="pickup-heading" className="mb-12">
          <h2
            id="pickup-heading"
            className="text-xl font-extrabold text-[#1A1F36] mb-5 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            <MapPin size={22} className="text-[#2B4DD6]" />
            Пункт самовывоза
          </h2>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-[#1A1F36] mb-1">г. Минск, ул. Примерная, 12, офис 305</p>
                <p className="text-sm text-[#1A1F36]/60 mb-4">3-й этаж, вход со двора</p>
                <div className="space-y-1.5 text-sm text-[#1A1F36]/70">
                  <p><span className="font-medium text-[#1A1F36]">Пн–Пт:</span> 8:30–18:00</p>
                  <p><span className="font-medium text-[#1A1F36]">Суббота:</span> 10:00–15:00</p>
                  <p><span className="font-medium text-[#1A1F36]">Воскресенье:</span> Выходной</p>
                </div>
              </div>
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: '#EEF2FF', minHeight: '180px' }}
                aria-label="Карта — пункт самовывоза"
              >
                <div className="w-full h-full flex items-center justify-center text-[#2B4DD6]/50 text-sm p-8 text-center">
                  Карта пункта самовывоза
                  <br />(интеграция с Яндекс.Картами)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment methods */}
        <section aria-labelledby="payment-heading">
          <h2
            id="payment-heading"
            className="text-xl font-extrabold text-[#1A1F36] mb-5 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            <CreditCard size={22} className="text-[#2B4DD6]" />
            Способы оплаты
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PAYMENT_METHODS.map(method => (
              <div
                key={method.title}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-5 flex gap-4 hover:border-[#2B4DD6]/30 hover:shadow-sm transition-all"
              >
                <span className="text-2xl flex-none">{method.icon}</span>
                <div>
                  <p className="font-semibold text-[#1A1F36] mb-1">{method.title}</p>
                  <p className="text-sm text-[#1A1F36]/60">{method.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}