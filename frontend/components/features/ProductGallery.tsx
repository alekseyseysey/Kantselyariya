'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface Props {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

  const imgs = images.length > 0 ? images : ['/images/placeholder-product.svg']

  function prev() { setActive(i => (i - 1 + imgs.length) % imgs.length) }
  function next() { setActive(i => (i + 1) % imgs.length) }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-24">
      {/* Main image */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-[#F7F8FB] cursor-zoom-in border border-[#e2e8f0]"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        aria-label={`Фото товара ${productName}${zoomed ? ' (увеличено)' : ''}`}
      >
        <Image
          src={imgs[active]}
          alt={productName}
          fill
          priority
          className="object-contain p-6 transition-transform duration-200"
          style={{
            transform: zoomed ? `scale(1.6)` : 'scale(1)',
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
          }}
          sizes="(max-width:768px) 100vw, 50vw"
        />

        {/* Zoom icon */}
        {!zoomed && (
          <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm pointer-events-none"
               aria-hidden="true">
            <ZoomIn size={15} className="text-[#1A1F36]/60" />
          </div>
        )}

        {/* Nav arrows (multiple images) */}
        {imgs.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Предыдущее фото"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm text-[#1A1F36]/70 hover:bg-white hover:text-[#2B4DD6] transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              aria-label="Следующее фото"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm text-[#1A1F36]/70 hover:bg-white hover:text-[#2B4DD6] transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex gap-2 flex-wrap" role="list" aria-label="Фотографии товара">
          {imgs.map((src, i) => (
            <div key={i} role="listitem">
              <button
                onClick={() => setActive(i)}
                aria-label={`Фото ${i + 1}`}
                aria-pressed={i === active}
                className="relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                style={{
                  borderColor: i === active ? '#2B4DD6' : '#e2e8f0',
                  background: '#F7F8FB',
                }}
              >
                <Image src={src} alt={`${productName}, фото ${i + 1}`} fill className="object-contain p-2"
                  sizes="64px" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}