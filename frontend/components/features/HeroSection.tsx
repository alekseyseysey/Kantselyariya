'use client'

import { useEffect, useRef, useCallback } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion'
import Link from 'next/link'
import {
  PenLine,
  Pencil,
  BookOpen,
  Scissors,
  Ruler,
  Paintbrush,
  Package,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'
import type { HeroContent } from '@/lib/types'

/* ─── Floating item definitions ─── */
interface FloatItemDef {
  id: number
  Icon: LucideIcon
  label: string
  color: string
  bg: string
  left: string
  top: string
  size: number
  iconSize: number
  duration: number
  delay: number
  rotateRange: number
  depthPx: number
}

const FLOAT_ITEMS: FloatItemDef[] = [
  { id: 1, Icon: PenLine,       label: 'Ручка',      color: '#FF8A3D', bg: 'rgba(255,138,61,0.13)',  left: '55%', top: '8%',  size: 72, iconSize: 30, duration: 4.2, delay: 0.0, rotateRange: 10,  depthPx: 35 },
  { id: 2, Icon: Pencil,        label: 'Карандаш',   color: '#2B4DD6', bg: 'rgba(43,77,214,0.12)',   left: '78%', top: '14%', size: 60, iconSize: 24, duration: 3.6, delay: 0.6, rotateRange: -8,  depthPx: 55 },
  { id: 3, Icon: BookOpen,      label: 'Тетрадь',    color: '#7DD3C0', bg: 'rgba(125,211,192,0.13)', left: '64%', top: '42%', size: 80, iconSize: 34, duration: 5.2, delay: 0.3, rotateRange: 6,   depthPx: 25 },
  { id: 4, Icon: Scissors,      label: 'Ножницы',    color: '#FF8A3D', bg: 'rgba(255,138,61,0.11)',  left: '88%', top: '36%', size: 64, iconSize: 26, duration: 4.0, delay: 1.0, rotateRange: -12, depthPx: 45 },
  { id: 5, Icon: Ruler,         label: 'Линейка',    color: '#2B4DD6', bg: 'rgba(43,77,214,0.10)',   left: '72%', top: '70%', size: 58, iconSize: 22, duration: 3.8, delay: 0.8, rotateRange: 15,  depthPx: 40 },
  { id: 6, Icon: Paintbrush,    label: 'Кисть',      color: '#7DD3C0', bg: 'rgba(125,211,192,0.11)', left: '52%', top: '62%', size: 68, iconSize: 28, duration: 4.8, delay: 1.5, rotateRange: -7,  depthPx: 30 },
  { id: 7, Icon: GraduationCap, label: 'Учёба',      color: '#FF8A3D', bg: 'rgba(255,138,61,0.10)',  left: '90%', top: '60%', size: 62, iconSize: 26, duration: 4.4, delay: 0.4, rotateRange: 9,   depthPx: 50 },
  { id: 8, Icon: Package,       label: 'Доставка',   color: '#2B4DD6', bg: 'rgba(43,77,214,0.09)',   left: '60%', top: '84%', size: 56, iconSize: 22, duration: 5.0, delay: 1.2, rotateRange: -5,  depthPx: 38 },
]

/* ─── Single floating item with per-item parallax ─── */
function FloatingItem({
  item,
  rawMouseX,
  rawMouseY,
  reduced,
}: {
  item: FloatItemDef
  rawMouseX: MotionValue<number>
  rawMouseY: MotionValue<number>
  reduced: boolean
}) {
  const { depthPx } = item

  const x = useTransform(rawMouseX, [-0.5, 0.5], [depthPx, -depthPx])
  const y = useTransform(rawMouseY, [-0.5, 0.5], [depthPx * 0.6, -depthPx * 0.6])
  const springX = useSpring(x, { stiffness: 45, damping: 28 })
  const springY = useSpring(y, { stiffness: 45, damping: 28 })

  const { Icon, color, bg, left, top, size, iconSize, duration, delay, rotateRange } = item

  if (reduced) {
    return (
      <div
        className="absolute pointer-events-none select-none"
        style={{ left, top }}
        aria-hidden="true"
      >
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{ width: size, height: size, background: bg, border: `1.5px solid ${color}30` }}
        >
          <Icon size={iconSize} color={color} strokeWidth={1.8} />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left, top, x: springX, y: springY }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <motion.div
        animate={{ y: [0, -16, 0], rotate: [0, rotateRange, 0] }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: size,
          height: size,
          background: bg,
          border: `1.5px solid ${color}30`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        className="flex items-center justify-center rounded-2xl shadow-xl"
      >
        <Icon size={iconSize} color={color} strokeWidth={1.8} />
      </motion.div>
    </motion.div>
  )
}

/* ─── Main hero ─── */
interface Props {
  content: HeroContent
}

export default function HeroSection({ content }: Props) {
  const reduced = useReducedMotion() ?? false
  const heroRef = useRef<HTMLElement>(null)

  const rawMouseX = useMotionValue(0)
  const rawMouseY = useMotionValue(0)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = heroRef.current
      if (!el || reduced) return
      const rect = el.getBoundingClientRect()
      rawMouseX.set((e.clientX - rect.left - rect.width  / 2) / rect.width)
      rawMouseY.set((e.clientY - rect.top  - rect.height / 2) / rect.height)
    },
    [rawMouseX, rawMouseY, reduced]
  )

  const handleMouseLeave = useCallback(() => {
    rawMouseX.set(0)
    rawMouseY.set(0)
  }, [rawMouseX, rawMouseY])

  useEffect(() => {
    if (reduced) return
    const el = heroRef.current
    if (!el) return
    el.addEventListener('mousemove', handleMouseMove, { passive: true })
    el.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave, reduced])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0D1B6B 0%, #1a2d9a 45%, #2B4DD6 100%)',
      }}
      aria-label="Главный баннер"
    >
      {/* Ambient glows */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px]"
             style={{ background: 'rgba(255,138,61,0.08)' }} />
        <div className="absolute -bottom-40 right-0 w-[600px] h-[600px] rounded-full blur-[140px]"
             style={{ background: 'rgba(125,211,192,0.07)' }} />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[180px]"
             style={{ background: 'rgba(43,77,214,0.15)' }} />
      </div>

      {/* Floating stationery items — desktop only */}
      <div aria-hidden="true" className="absolute inset-0 hidden lg:block">
        {FLOAT_ITEMS.map(item => (
          <FloatingItem
            key={item.id}
            item={item}
            rawMouseX={rawMouseX}
            rawMouseY={rawMouseY}
            reduced={reduced}
          />
        ))}
      </div>

      {/* ─── Content ─── */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
        <div className="max-w-2xl">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white/90 mb-6"
                  style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <span className="w-2 h-2 rounded-full bg-[#FF8A3D]"
                    style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
              {content.badge}
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            {content.heading}{' '}
            <span style={{ color: '#FF8A3D' }}>{content.headingHighlight}</span>{' '}
            красиво
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="text-lg sm:text-xl leading-relaxed mb-10 max-w-xl"
            style={{ color: 'rgba(255,255,255,0.80)' }}
          >
            {content.subheading}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href={content.primaryCta.url}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              style={{
                background: '#FF8A3D',
                boxShadow: '0 8px 32px rgba(255,138,61,0.35)',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#e67722')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#FF8A3D')}
            >
              {content.primaryCta.label}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href={content.secondaryCta.url}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              style={{
                background: 'rgba(255,255,255,0.10)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {content.secondaryCta.label}
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.40 }}
            className="flex flex-wrap gap-8 mt-12 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
          >
            {content.stats.map(s => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white"
                     style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}>
                  {s.value}
                </div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: 'rgba(255,255,255,0.35)' }}
        aria-hidden="true"
      >
        <span className="text-xs uppercase tracking-[0.2em]">Листайте вниз</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full flex items-start justify-center p-1"
          style={{ border: '1.5px solid rgba(255,255,255,0.20)' }}
        >
          <div className="w-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.45)' }} />
        </motion.div>
      </motion.div>
    </section>
  )
}
