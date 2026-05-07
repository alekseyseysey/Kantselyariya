export interface Product {
  id: string
  name: string
  slug: string
  price: number
  oldPrice?: number
  brand: string
  sku: string
  /** Primary category — used for breadcrumb / display. */
  categoryId: string
  categoryName: string
  /** All categories the product belongs to. Used for client-side filtering. */
  categoryIds?: string[]
  images: string[]
  rating: number
  reviewCount: number
  stock: number
  badges?: Array<'hit' | 'new' | 'sale' | 'bestseller'>
  description?: string
  specs?: Record<string, string>
  reviews?: Review[]
}

export interface Review {
  id: string
  databaseId: number
  /** ISO date. */
  date: string
  /** Имя автора (для гостевых — заполняется в форме). */
  author: string
  /** HTML после `wp_kses` (Woo обрабатывает). */
  content: string
  /** 1–5. Если null — отзыв без оценки. */
  rating: number | null
}

export interface Category {
  id: string
  name: string
  slug: string
  emoji: string
  count: number
  color: string
  iconBg: string
}

export interface PromoSlide {
  id: number
  heading: string
  subheading: string
  cta: string
  ctaHref: string
  bgFrom: string
  bgTo: string
  emoji: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface WishlistItem {
  id: string
  slug: string
  name: string
  price: number
  oldPrice?: number
  brand: string
  image?: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface HeroContent {
  badge: string
  heading: string
  headingHighlight: string
  subheading: string
  primaryCta: { label: string; url: string }
  secondaryCta: { label: string; url: string }
  stats: Array<{ value: string; label: string }>
}

export interface ContactsContent {
  address: string
  email: string
  hoursOperators: string
  hoursOffice: string
  phones: Array<{ number: string; label: string }>
  messengers: Array<{ name: string; href: string; emoji: string }>
  socials: Array<{ name: string; href: string; emoji: string }>
}