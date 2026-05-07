'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PromoSlide } from '@/lib/types'

const AUTO_INTERVAL = 5000

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
}

interface Props {
  slides: PromoSlide[]
}

export default function PromoSlider({ slides }: Props) {
  const [current, setCurrent] = useState(0)
  const [dir, setDir] = useState(1)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((next: number) => {
    const clamped = (next + slides.length) % slides.length
    setDir(next > current ? 1 : -1)
    setCurrent(clamped)
  }, [current, slides.length])

  const next = useCallback(() => goTo(current + 1), [goTo, current])
  const prev = useCallback(() => goTo(current - 1), [goTo, current])

  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(next, AUTO_INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused, next])

  if (slides.length === 0) return null
  const slide = slides[current]

  return (
    <section
      aria-label="Акционные предложения"
      className="relative overflow-hidden h-[320px] sm:h-[280px] md:h-[320px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence custom={dir} initial={false}>
        <motion.div
          key={slide.id}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 flex items-center"
          style={{
            background: `linear-gradient(135deg, ${slide.bgFrom} 0%, ${slide.bgTo} 100%)`,
          }}
        >
          <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Text */}
            <div className="text-white text-center sm:text-left">
              <div className="text-5xl mb-3" aria-hidden="true">{slide.emoji}</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2"
                  style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
                {slide.heading}
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-lg">
                {slide.subheading}
              </p>
            </div>

            {/* CTA */}
            <Link
              href={slide.ctaHref}
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl px-8 py-4 font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.30)', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              {slide.cta}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next */}
      <button
        onClick={prev}
        aria-label="Предыдущий слайд"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 focus-visible:outline-2 focus-visible:outline-white"
        style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Следующий слайд"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 focus-visible:outline-2 focus-visible:outline-white"
        style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10" role="tablist" aria-label="Слайды">
        {slides.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === current}
            aria-label={`Слайд ${i + 1}`}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-white"
            style={{
              width: i === current ? '24px' : '8px',
              height: '8px',
              background: i === current ? '#fff' : 'rgba(255,255,255,0.45)',
            }}
          />
        ))}
      </div>
    </section>
  )
}