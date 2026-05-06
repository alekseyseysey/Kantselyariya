'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, X, CheckCircle, Loader2 } from 'lucide-react'

const schema = z.object({
  name:  z.string().min(2, 'Введите имя'),
  phone: z.string().min(9, 'Введите телефон'),
  time:  z.string().min(1, 'Выберите время'),
})
type FormData = z.infer<typeof schema>

const TIME_OPTIONS = ['Сейчас', 'В течение часа', 'Завтра', 'Указать время']

export default function CallbackModal() {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  /* focus first element when modal opens */
  useEffect(() => {
    if (open) {
      setTimeout(() => closeBtnRef.current?.focus(), 50)
    }
  }, [open])

  /* trap Escape key */
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  function close() {
    setOpen(false)
    setSent(false)
    reset()
  }

  async function onSubmit(data: FormData) {
    await new Promise(r => setTimeout(r, 700))
    console.info('Callback form:', data)
    setSent(true)
    reset()
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Заказать обратный звонок"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        style={{ background: 'linear-gradient(135deg, #2B4DD6, #FF8A3D)' }}
      >
        <Phone size={22} />
      </button>

      {/* Modal overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(26,31,54,0.55)', backdropFilter: 'blur(4px)' }}
              onClick={close}
              aria-hidden="true"
            />

            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="callback-title"
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#F7F8FB]">
                <h2
                  id="callback-title"
                  className="font-bold text-[#1A1F36] text-lg"
                  style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
                >
                  Перезвоните мне
                </h2>
                <button
                  ref={closeBtnRef}
                  onClick={close}
                  aria-label="Закрыть"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#1A1F36]/50 hover:bg-[#F7F8FB] hover:text-[#1A1F36] transition-colors focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-6">
                {sent ? (
                  <div className="flex flex-col items-center text-center py-6 gap-3">
                    <CheckCircle size={48} className="text-[#7DD3C0]" />
                    <h3 className="font-bold text-[#1A1F36] text-lg">Готово!</h3>
                    <p className="text-[#1A1F36]/65 text-sm">Мы перезвоним вам в указанное время. Спасибо!</p>
                    <button
                      onClick={close}
                      className="mt-2 rounded-xl px-6 py-3 font-semibold text-white text-sm transition-all hover:bg-[#1e3ab8] focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                      style={{ background: '#2B4DD6' }}
                    >
                      Закрыть
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="cb-name" className="block text-sm font-medium text-[#1A1F36] mb-1">
                        Ваше имя
                      </label>
                      <input
                        id="cb-name"
                        type="text"
                        autoComplete="name"
                        {...register('name')}
                        placeholder="Иван"
                        aria-describedby={errors.name ? 'cb-name-err' : undefined}
                        aria-invalid={!!errors.name}
                        className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm text-[#1A1F36] placeholder:text-[#1A1F36]/35 focus:outline-none focus:border-[#2B4DD6] transition-colors"
                      />
                      {errors.name && <p id="cb-name-err" role="alert" className="mt-1 text-xs text-[#FF8A3D]">{errors.name.message}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="cb-phone" className="block text-sm font-medium text-[#1A1F36] mb-1">
                        Телефон <span aria-hidden="true" className="text-[#FF8A3D]">*</span>
                      </label>
                      <input
                        id="cb-phone"
                        type="tel"
                        autoComplete="tel"
                        {...register('phone')}
                        placeholder="+375 (29) 000-00-00"
                        aria-describedby={errors.phone ? 'cb-phone-err' : undefined}
                        aria-invalid={!!errors.phone}
                        className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm text-[#1A1F36] placeholder:text-[#1A1F36]/35 focus:outline-none focus:border-[#2B4DD6] transition-colors"
                      />
                      {errors.phone && <p id="cb-phone-err" role="alert" className="mt-1 text-xs text-[#FF8A3D]">{errors.phone.message}</p>}
                    </div>

                    {/* Time */}
                    <div>
                      <fieldset>
                        <legend className="text-sm font-medium text-[#1A1F36] mb-2">
                          Удобное время для звонка
                        </legend>
                        <div className="flex flex-wrap gap-2">
                          {TIME_OPTIONS.map(t => (
                            <label
                              key={t}
                              className="inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <input
                                type="radio"
                                value={t}
                                {...register('time')}
                                className="sr-only peer"
                              />
                              <span className="rounded-lg px-3 py-1.5 text-sm border border-[#e2e8f0] text-[#1A1F36]/70 peer-checked:bg-[#2B4DD6] peer-checked:text-white peer-checked:border-[#2B4DD6] transition-all cursor-pointer hover:border-[#2B4DD6]">
                                {t}
                              </span>
                            </label>
                          ))}
                        </div>
                        {errors.time && <p role="alert" className="mt-1 text-xs text-[#FF8A3D]">{errors.time.message}</p>}
                      </fieldset>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-semibold text-white text-base transition-all hover:bg-[#1e3ab8] disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                      style={{ background: '#2B4DD6' }}
                    >
                      {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                      Перезвоните мне
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}