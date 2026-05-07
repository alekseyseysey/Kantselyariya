'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import type { FAQ } from '@/lib/types'

interface Props {
  items: FAQ[]
}

export default function FAQSection({ items }: Props) {
  const [openId, setOpenId] = useState<number | null>(null)

  function toggle(i: number) {
    setOpenId(prev => (prev === i ? null : i))
  }

  return (
    <section aria-labelledby="faq-heading" className="py-16 bg-[#F7F8FB]">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#2B4DD6] mb-2">FAQ</p>
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl font-extrabold text-[#1A1F36]"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            Частые вопросы
          </h2>
        </div>

        <dl className="space-y-3">
          {items.map((item, i) => {
            const isOpen = openId === i
            return (
              <div
                key={i}
                className="rounded-2xl bg-white border transition-all duration-200"
                style={{
                  borderColor: isOpen ? '#2B4DD6' : 'transparent',
                  boxShadow: isOpen ? '0 4px 24px rgba(43,77,214,0.10)' : '0 1px 4px rgba(26,31,54,0.06)',
                }}
              >
                <dt>
                  <button
                    id={`faq-btn-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-[#2B4DD6] focus-visible:rounded-2xl"
                  >
                    <span
                      className="font-semibold text-[#1A1F36] text-base leading-snug"
                      style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
                    >
                      {item.question}
                    </span>
                    <span
                      className="flex-none w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                      style={{ background: isOpen ? '#2B4DD6' : '#EEF2FF' }}
                      aria-hidden="true"
                    >
                      {isOpen
                        ? <Minus size={16} color="#fff" />
                        : <Plus size={16} color="#2B4DD6" />
                      }
                    </span>
                  </button>
                </dt>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.dd
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-btn-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-[#1A1F36]/70 text-base leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.dd>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}