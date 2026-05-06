export interface Product {
  id: string
  name: string
  slug: string
  price: number
  oldPrice?: number
  brand: string
  sku: string
  categoryId: string
  categoryName: string
  images: string[]
  rating: number
  reviewCount: number
  stock: number
  badges?: Array<'hit' | 'new' | 'sale' | 'bestseller'>
  description?: string
  specs?: Record<string, string>
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

export interface FAQ {
  question: string
  answer: string
}