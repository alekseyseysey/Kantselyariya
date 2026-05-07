import { Star } from 'lucide-react'

interface Props {
  /** Значение рейтинга, 0–5. Округляется до ближайшего целого. */
  value: number
  /** Размер одной звезды, px. */
  size?: number
}

/**
 * Презентационный компонент: 5 звёзд, закрашенных оранжевым в зависимости
 * от value. Используется в ProductTabs, на странице отзывов и в карточке.
 */
export default function Stars({ value, size = 16 }: Props) {
  const rounded = Math.round(value)
  return (
    <div className="flex gap-0.5" role="img" aria-label={`Рейтинг ${value} из 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < rounded ? '#FF8A3D' : 'none'}
          stroke={i < rounded ? '#FF8A3D' : '#e2e8f0'}
        />
      ))}
    </div>
  )
}
