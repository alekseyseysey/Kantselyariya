import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: Props) {
  return (
    <nav aria-label="Хлебные крошки" className={className}>
      <ol
        className="flex flex-wrap items-center gap-1 text-sm"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-1"
            itemScope
            itemProp="itemListElement"
            itemType="https://schema.org/ListItem"
          >
            {i > 0 && (
              <ChevronRight
                size={14}
                className="text-[#1A1F36]/30 flex-none"
                aria-hidden="true"
              />
            )}
            {item.href && i < items.length - 1 ? (
              <Link
                href={item.href}
                className="text-[#1A1F36]/55 hover:text-[#2B4DD6] transition-colors focus-visible:outline-2 focus-visible:outline-[#2B4DD6] focus-visible:rounded"
                itemProp="item"
              >
                <span itemProp="name">{item.label}</span>
              </Link>
            ) : (
              <span
                className="text-[#1A1F36] font-medium"
                itemProp="name"
                aria-current={i === items.length - 1 ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
            <meta itemProp="position" content={String(i + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  )
}