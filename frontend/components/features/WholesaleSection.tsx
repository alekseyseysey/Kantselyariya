'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'

const schema = z.object({
  name:  z.string().min(2, 'Введите имя'),
  phone: z.string().min(9, 'Введите корректный телефон'),
  email: z.string().email('Введите корректный e-mail'),
  orgType: z.string().min(1, 'Выберите тип организации'),
  comment: z.string().optional(),
  consent: z.literal(true, { message: 'Необходимо ваше согласие' }),
})

type FormData = z.infer<typeof schema>

const ORG_TYPES = ['Школа', 'Детский сад', 'Офис', 'Творческая студия', 'Другое']

const BENEFITS = [
  '✅ Персональный менеджер',
  '✅ Договорные цены',
  '✅ Постоплата для постоянных клиентов',
  '✅ Доставка прямо в офис',
  '✅ ЭСЧФ и все закрывающие документы',
]

export default function WholesaleSection() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    await new Promise(r => setTimeout(r, 800))
    console.info('Wholesale form:', data)
    setSent(true)
    reset()
  }

  return (
    <section
      aria-labelledby="wholesale-heading"
      className="py-20"
      style={{ background: 'linear-gradient(135deg, #0D1B6B 0%, #1a2d9a 50%, #2B4DD6 100%)' }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <div className="text-white">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#7DD3C0] mb-3">
              Корпоративным клиентам
            </p>
            <h2
              id="wholesale-heading"
              className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4"
              style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
            >
              Канцелярия для офиса, школы, студии — на ваших условиях
            </h2>
            <p className="text-white/75 text-lg leading-relaxed mb-8">
              Персональный менеджер. Договорные цены. Постоплата для постоянных клиентов.
              Доставка прямо в офис.
            </p>
            <ul className="space-y-3">
              {BENEFITS.map(b => (
                <li key={b} className="flex items-center gap-2 text-white/85 text-base">
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: form */}
          <div
            className="rounded-2xl p-8"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}
          >
            {sent ? (
              <div className="flex flex-col items-center text-center py-8 gap-4">
                <CheckCircle size={56} className="text-[#7DD3C0]" />
                <h3 className="text-xl font-bold text-white">Заявка отправлена!</h3>
                <p className="text-white/70">Наш менеджер свяжется с вами в течение 1 рабочего дня.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-2 text-sm text-[#7DD3C0] underline hover:text-white transition-colors"
                >
                  Отправить ещё одну заявку
                </button>
              </div>
            ) : (
              <>
                <h3
                  className="text-xl font-bold text-white mb-6"
                  style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
                >
                  Заявка на индивидуальный заказ
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="ws-name" className="block text-sm font-medium text-white/80 mb-1">
                      Имя <span aria-hidden="true" className="text-[#FF8A3D]">*</span>
                    </label>
                    <input
                      id="ws-name"
                      type="text"
                      autoComplete="name"
                      {...register('name')}
                      placeholder="Иван Иванов"
                      aria-describedby={errors.name ? 'ws-name-err' : undefined}
                      aria-invalid={!!errors.name}
                      className="w-full rounded-xl px-4 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#7DD3C0] transition-colors"
                    />
                    {errors.name && <p id="ws-name-err" role="alert" className="mt-1 text-xs text-[#FF8A3D]">{errors.name.message}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="ws-phone" className="block text-sm font-medium text-white/80 mb-1">
                      Телефон <span aria-hidden="true" className="text-[#FF8A3D]">*</span>
                    </label>
                    <input
                      id="ws-phone"
                      type="tel"
                      autoComplete="tel"
                      {...register('phone')}
                      placeholder="+375 (29) 000-00-00"
                      aria-describedby={errors.phone ? 'ws-phone-err' : undefined}
                      aria-invalid={!!errors.phone}
                      className="w-full rounded-xl px-4 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#7DD3C0] transition-colors"
                    />
                    {errors.phone && <p id="ws-phone-err" role="alert" className="mt-1 text-xs text-[#FF8A3D]">{errors.phone.message}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="ws-email" className="block text-sm font-medium text-white/80 mb-1">
                      E-mail <span aria-hidden="true" className="text-[#FF8A3D]">*</span>
                    </label>
                    <input
                      id="ws-email"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      placeholder="info@company.by"
                      aria-describedby={errors.email ? 'ws-email-err' : undefined}
                      aria-invalid={!!errors.email}
                      className="w-full rounded-xl px-4 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#7DD3C0] transition-colors"
                    />
                    {errors.email && <p id="ws-email-err" role="alert" className="mt-1 text-xs text-[#FF8A3D]">{errors.email.message}</p>}
                  </div>

                  {/* Org type */}
                  <div>
                    <label htmlFor="ws-org" className="block text-sm font-medium text-white/80 mb-1">
                      Тип организации <span aria-hidden="true" className="text-[#FF8A3D]">*</span>
                    </label>
                    <select
                      id="ws-org"
                      {...register('orgType')}
                      aria-describedby={errors.orgType ? 'ws-org-err' : undefined}
                      aria-invalid={!!errors.orgType}
                      className="w-full rounded-xl px-4 py-3 text-sm bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#7DD3C0] transition-colors"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" className="text-[#1A1F36]">Выберите тип…</option>
                      {ORG_TYPES.map(t => (
                        <option key={t} value={t} className="text-[#1A1F36]">{t}</option>
                      ))}
                    </select>
                    {errors.orgType && <p id="ws-org-err" role="alert" className="mt-1 text-xs text-[#FF8A3D]">{errors.orgType.message}</p>}
                  </div>

                  {/* Comment */}
                  <div>
                    <label htmlFor="ws-comment" className="block text-sm font-medium text-white/80 mb-1">
                      Краткое описание заказа
                    </label>
                    <textarea
                      id="ws-comment"
                      rows={3}
                      {...register('comment')}
                      placeholder="Тетради А5 — 500 шт., ручки — 1000 шт. …"
                      className="w-full rounded-xl px-4 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#7DD3C0] transition-colors resize-none"
                    />
                  </div>

                  {/* Consent */}
                  <div className="flex items-start gap-3">
                    <input
                      id="ws-consent"
                      type="checkbox"
                      {...register('consent')}
                      className="mt-0.5 w-4 h-4 rounded accent-[#7DD3C0] focus-visible:outline-2 focus-visible:outline-[#7DD3C0]"
                    />
                    <label htmlFor="ws-consent" className="text-xs text-white/60 leading-relaxed">
                      Согласен на обработку персональных данных в соответствии с{' '}
                      <a href="/privacy" className="text-[#7DD3C0] underline hover:text-white">
                        политикой конфиденциальности
                      </a>
                    </label>
                  </div>
                  {errors.consent && <p role="alert" className="text-xs text-[#FF8A3D]">{errors.consent.message}</p>}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-semibold text-white text-base transition-all duration-200 hover:bg-[#e67722] disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-white"
                    style={{ background: '#FF8A3D' }}
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                    Отправить заявку
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}