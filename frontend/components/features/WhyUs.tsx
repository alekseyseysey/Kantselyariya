const REASONS = [
  {
    emoji: '📦',
    title: 'Огромный ассортимент',
    desc: 'Более 12 000 позиций — от ученической ручки до ламинатора',
  },
  {
    emoji: '🚚',
    title: 'Быстрая доставка',
    desc: 'По Минску — за 24 часа, по Беларуси — за 1–3 дня',
  },
  {
    emoji: '💳',
    title: 'Любой способ оплаты',
    desc: 'Картой онлайн, наличными курьеру, по счёту для юрлиц',
  },
  {
    emoji: '🏆',
    title: 'Только проверенные бренды',
    desc: 'BRAUBERG, ErichKrause, Pilot, Schneider, Гознак',
  },
  {
    emoji: '🤝',
    title: 'Опт от 1 шт.',
    desc: 'Низкие цены без условия «закажите коробку»',
  },
  {
    emoji: '💬',
    title: 'Живая поддержка',
    desc: 'Операторы на связи с 9:00 до 22:00 без выходных',
  },
]

export default function WhyUs() {
  return (
    <section aria-labelledby="why-us-heading" className="py-16 bg-[#F7F8FB]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#2B4DD6] mb-2">
            Наши преимущества
          </p>
          <h2
            id="why-us-heading"
            className="text-3xl sm:text-4xl font-extrabold text-[#1A1F36]"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            Шесть причин заказать у нас
          </h2>
        </div>

        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map(r => (
            <li
              key={r.title}
              className="group bg-white rounded-2xl p-6 flex gap-4 border border-transparent hover:border-[#2B4DD6]/15 hover:shadow-lg transition-all duration-200"
            >
              <div
                className="flex-none w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                style={{ background: '#EEF2FF' }}
                aria-hidden="true"
              >
                {r.emoji}
              </div>
              <div>
                <h3 className="font-bold text-[#1A1F36] mb-1 group-hover:text-[#2B4DD6] transition-colors"
                    style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
                  {r.title}
                </h3>
                <p className="text-sm text-[#1A1F36]/65 leading-relaxed">
                  {r.desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}