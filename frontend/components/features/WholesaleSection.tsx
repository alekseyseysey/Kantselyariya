'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { CheckCircle, Loader2, Paperclip, X } from 'lucide-react'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]
const ALLOWED_FILE_EXTENSIONS = '.pdf,.doc,.docx,.xls,.xlsx'

// `File` и `FileList` — браузерные globals, в Node их нет. Все обращения
// к ним должны идти через guard'ы, иначе SSR-prerender компонента крашится
// с `ReferenceError: FileList is not defined` на этапе загрузки модуля.
const isFileList = (v: unknown): v is FileList =>
  typeof FileList !== 'undefined' && v instanceof FileList
const isFile = (v: unknown): v is File =>
  typeof File !== 'undefined' && v instanceof File

function isAttachmentValid(list: unknown): boolean {
  if (list === undefined || list === null) return true
  if (!isFileList(list) || list.length === 0) return true
  const f = list[0]
  if (!isFile(f)) return false
  if (f.size > MAX_FILE_SIZE) return false
  if (f.type && !ALLOWED_FILE_TYPES.includes(f.type)) return false
  return true
}

const schema = z.object({
  name:    z.string().min(2, 'Введите имя'),
  phone:   z.string().min(9, 'Введите корректный телефон'),
  email:   z.string().email('Введите корректный e-mail'),
  orgType: z.string().min(1, 'Выберите тип организации'),
  comment: z.string().optional(),
  consent: z.literal(true, { message: 'Необходимо ваше согласие' }),
  attachment: z
    .custom<FileList | undefined>(isAttachmentValid, {
      message: 'Файл не подходит — проверьте размер (до 10 МБ) и формат',
    })
    .optional(),
  // honeypot — невидимое поле, бот его заполнит и заявка отбросится сервером.
  website: z.string().optional(),
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
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const fileList = watch('attachment')
  const file = fileList && fileList.length > 0 ? fileList[0] : null

  async function onSubmit(data: FormData) {
    setServerError(null)
    try {
      const fd = new FormData()
      fd.append('name', data.name)
      fd.append('phone', data.phone)
      fd.append('email', data.email)
      fd.append('orgType', data.orgType)
      fd.append('comment', data.comment ?? '')
      fd.append('consent', data.consent ? 'true' : 'false')
      fd.append('website', data.website ?? '')
      if (data.attachment && data.attachment.length > 0) {
        fd.append('attachment', data.attachment[0])
      }

      const res = await fetch('/api/wholesale', { method: 'POST', body: fd })
      const payload = (await res.json()) as { ok?: boolean; message?: string }

      if (!res.ok || !payload.ok) {
        throw new Error(payload.message ?? 'Не удалось отправить заявку')
      }

      setSent(true)
      reset()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Что-то пошло не так')
    }
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
                  {/* Honeypot — скрытое поле, реальные пользователи его не увидят. */}
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    {...register('website')}
                    style={{
                      position: 'absolute',
                      left: '-9999px',
                      width: '1px',
                      height: '1px',
                      opacity: 0,
                    }}
                  />

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

                  {/* Attachment */}
                  <div>
                    <label htmlFor="ws-file" className="block text-sm font-medium text-white/80 mb-1">
                      Спецификация (PDF, DOC, XLS — до 10 МБ)
                    </label>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="ws-file"
                        className="flex items-center gap-2 cursor-pointer rounded-xl px-4 py-3 text-sm bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 transition-colors focus-within:outline-2 focus-within:outline-[#7DD3C0]"
                      >
                        <Paperclip size={16} />
                        {file ? 'Заменить файл' : 'Прикрепить файл'}
                      </label>
                      <input
                        id="ws-file"
                        type="file"
                        accept={ALLOWED_FILE_EXTENSIONS}
                        {...register('attachment')}
                        aria-describedby={errors.attachment ? 'ws-file-err' : undefined}
                        aria-invalid={!!errors.attachment}
                        className="sr-only"
                      />
                      {file && (
                        <div className="flex-1 flex items-center gap-2 min-w-0 rounded-xl px-3 py-2 bg-white/10 border border-white/20">
                          <span className="text-xs text-white/80 truncate flex-1" title={file.name}>
                            {file.name}{' '}
                            <span className="text-white/40">({(file.size / 1024).toFixed(0)} КБ)</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setValue('attachment', undefined, { shouldValidate: true })}
                            aria-label="Удалить файл"
                            className="text-white/50 hover:text-[#FF8A3D] transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    {errors.attachment && (
                      <p id="ws-file-err" role="alert" className="mt-1 text-xs text-[#FF8A3D]">
                        {errors.attachment.message as string}
                      </p>
                    )}
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

                  {/* Server error */}
                  {serverError && (
                    <div role="alert" className="rounded-xl px-4 py-3 text-sm bg-[#FF8A3D]/15 border border-[#FF8A3D]/40 text-[#FF8A3D]">
                      {serverError}
                    </div>
                  )}

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
