import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'О компании КанцМир',
  description: 'КанцМир — интернет-магазин канцелярских товаров в Беларуси. Более 12 000 товаров, быстрая доставка, оптовые поставки.',
}

const STATS = [
  { value: '12 000+', label: 'товаров в ассортименте' },
  { value: '50 000+', label: 'довольных клиентов' },
  { value: '10 лет', label: 'на рынке Беларуси' },
  { value: '98%', label: 'заказов доставлено в срок' },
]

const TEAM = [
  { name: 'Александр Иванов', role: 'Директор', emoji: '👨‍💼' },
  { name: 'Мария Петрова', role: 'Руководитель закупок', emoji: '👩‍💼' },
  { name: 'Дмитрий Сидоров', role: 'Менеджер по работе с клиентами', emoji: '👨‍💻' },
]

export default function AboutPage() {
  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Главная', href: '/' },
            { label: 'О компании' },
          ]}
          className="mb-6"
        />

        {/* Hero */}
        <div
          className="rounded-2xl px-8 py-12 mb-10 text-center"
          style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', border: '1.5px solid #2B4DD620' }}
        >
          <div className="text-5xl mb-4">📎</div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold text-[#1A1F36] mb-3"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            О компании КанцМир
          </h1>
          <p className="text-[#1A1F36]/65 text-base max-w-2xl mx-auto leading-relaxed">
            Мы — ведущий интернет-магазин канцелярских товаров в Беларуси. Более 10 лет помогаем
            школьникам, студентам, художникам и офисам находить всё необходимое по доступным ценам.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {STATS.map(stat => (
            <div
              key={stat.value}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-6 text-center hover:border-[#2B4DD6]/30 hover:shadow-md transition-all"
            >
              <p
                className="text-3xl font-extrabold text-[#2B4DD6] mb-1"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
              >
                {stat.value}
              </p>
              <p className="text-sm text-[#1A1F36]/60">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8">
            <h2
              className="text-xl font-extrabold text-[#1A1F36] mb-4"
              style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
            >
              Наша история
            </h2>
            <div className="space-y-3 text-sm text-[#1A1F36]/70 leading-relaxed">
              <p>
                КанцМир основан в 2015 году как небольшой офлайн-магазин в центре Минска.
                За первый год работы мы завоевали доверие тысяч покупателей благодаря
                широкому ассортименту и честным ценам.
              </p>
              <p>
                В 2018 году мы запустили интернет-магазин и начали доставку по всей Беларуси.
                Сегодня более 80% заказов оформляется онлайн — это требует от нас постоянного
                совершенствования сервиса.
              </p>
              <p>
                Мы работаем напрямую с ведущими производителями канцелярских товаров: Hatber,
                Schneider, Pilot, ErichKrause, Koh-I-Noor — что позволяет предлагать лучшие
                цены без посредников.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8">
            <h2
              className="text-xl font-extrabold text-[#1A1F36] mb-4"
              style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
            >
              Наши принципы
            </h2>
            <ul className="space-y-3">
              {[
                { emoji: '✅', text: 'Только оригинальные товары — никаких подделок' },
                { emoji: '🚀', text: 'Доставка в срок — 98% заказов приходят вовремя' },
                { emoji: '💬', text: 'Поддержка 7 дней в неделю с 8:00 до 22:00' },
                { emoji: '🔄', text: 'Простой возврат в течение 14 дней без вопросов' },
                { emoji: '💰', text: 'Гарантия лучшей цены — найдём дешевле, вернём разницу' },
              ].map(item => (
                <li key={item.text} className="flex items-start gap-3 text-sm text-[#1A1F36]/70">
                  <span className="text-base flex-none">{item.emoji}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Team */}
        <section aria-labelledby="team-heading">
          <h2
            id="team-heading"
            className="text-xl font-extrabold text-[#1A1F36] mb-5"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            Команда
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TEAM.map(member => (
              <div
                key={member.name}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-6 text-center hover:border-[#2B4DD6]/30 hover:shadow-sm transition-all"
              >
                <div className="text-4xl mb-3">{member.emoji}</div>
                <p className="font-bold text-[#1A1F36]">{member.name}</p>
                <p className="text-sm text-[#1A1F36]/55 mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}