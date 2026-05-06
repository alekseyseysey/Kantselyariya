import { Phone, Mail, Clock, MapPin, MessageCircle } from 'lucide-react'

const PHONES = [
  { number: '+375 (29) 610-41-41', label: 'A1' },
  { number: '+375 (29) 710-41-41', label: 'МТС' },
  { number: '+375 (17) 271-41-41', label: 'Гор.' },
]

const MESSENGERS = [
  { name: 'Telegram',  href: 'https://t.me/kantsmir',                                   emoji: '✈️' },
  { name: 'Viber',     href: 'viber://chat?number=%2B375296104141',                      emoji: '📲' },
  { name: 'WhatsApp',  href: 'https://wa.me/375296104141',                               emoji: '💬' },
]

const SOCIALS = [
  { name: 'Instagram', href: 'https://instagram.com/kantsmir',  emoji: '📸' },
  { name: 'VK',        href: 'https://vk.com/kantsmir',         emoji: '🔵' },
  { name: 'TikTok',    href: 'https://tiktok.com/@kantsmir',    emoji: '🎵' },
  { name: 'YouTube',   href: 'https://youtube.com/@kantsmir',   emoji: '▶️' },
]

export default function ContactsSection() {
  return (
    <section aria-labelledby="contacts-heading" className="py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#2B4DD6] mb-2">
            Всегда на связи
          </p>
          <h2
            id="contacts-heading"
            className="text-3xl sm:text-4xl font-extrabold text-[#1A1F36]"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            Контакты
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Address & working hours */}
          <div className="bg-[#F7F8FB] rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4" aria-hidden="true">
              <MapPin size={22} className="text-[#2B4DD6]" />
            </div>
            <h3 className="font-bold text-[#1A1F36] mb-2"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
              Адрес
            </h3>
            <address className="not-italic text-sm text-[#1A1F36]/70 leading-relaxed">
              г. Минск, ул. Примерная, 12,<br />офис 305
            </address>
          </div>

          {/* Phones */}
          <div className="bg-[#F7F8FB] rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4" aria-hidden="true">
              <Phone size={22} className="text-[#2B4DD6]" />
            </div>
            <h3 className="font-bold text-[#1A1F36] mb-3"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
              Телефоны
            </h3>
            <ul className="space-y-2">
              {PHONES.map(p => (
                <li key={p.number} className="flex items-center gap-2">
                  <a
                    href={`tel:${p.number.replace(/\D/g, '')}`}
                    className="text-sm font-semibold text-[#2B4DD6] hover:text-[#1e3ab8] transition-colors focus-visible:outline-2 focus-visible:outline-[#2B4DD6] focus-visible:rounded"
                  >
                    {p.number}
                  </a>
                  <span className="text-xs text-[#1A1F36]/40 bg-white px-1.5 py-0.5 rounded-md">{p.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Email & hours */}
          <div className="bg-[#F7F8FB] rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4" aria-hidden="true">
              <Clock size={22} className="text-[#2B4DD6]" />
            </div>
            <h3 className="font-bold text-[#1A1F36] mb-2"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
              Режим работы
            </h3>
            <p className="text-sm text-[#1A1F36]/70 leading-relaxed mb-2">
              Операторы: <strong>9:00–22:00</strong>, ежедневно
            </p>
            <p className="text-sm text-[#1A1F36]/70 leading-relaxed mb-3">
              Офис: пн–пт, <strong>8:30–17:00</strong>
            </p>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#2B4DD6]" aria-hidden="true" />
              <a
                href="mailto:info@kantsmir.by"
                className="text-sm font-semibold text-[#2B4DD6] hover:text-[#1e3ab8] transition-colors focus-visible:outline-2 focus-visible:outline-[#2B4DD6] focus-visible:rounded"
              >
                info@kantsmir.by
              </a>
            </div>
          </div>

          {/* Messengers & socials */}
          <div className="bg-[#F7F8FB] rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4" aria-hidden="true">
              <MessageCircle size={22} className="text-[#2B4DD6]" />
            </div>
            <h3 className="font-bold text-[#1A1F36] mb-3"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
              Мессенджеры
            </h3>
            <div className="flex gap-2 mb-4">
              {MESSENGERS.map(m => (
                <a
                  key={m.name}
                  href={m.href}
                  aria-label={m.name}
                  title={m.name}
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl hover:scale-110 transition-transform focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                >
                  {m.emoji}
                </a>
              ))}
            </div>
            <p className="text-xs font-semibold text-[#1A1F36]/50 uppercase tracking-wide mb-2">Соцсети</p>
            <div className="flex gap-2">
              {SOCIALS.map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  title={s.name}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl hover:scale-110 transition-transform focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                >
                  {s.emoji}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}