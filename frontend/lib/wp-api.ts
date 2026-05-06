import type { Product, Category } from './types'
import { PRODUCTS, CATEGORIES } from './mock-data'

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL ?? ''

async function wpFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!WP_API_URL) return null
  try {
    const res = await fetch(`${WP_API_URL}${path}`, {
      next: { revalidate: 60 },
      ...init,
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function fetchProducts(params?: {
  categorySlug?: string
  limit?: number
  offset?: number
}): Promise<Product[]> {
  const remote = await wpFetch<Product[]>(
    `/wp-json/wc/v3/products?per_page=${params?.limit ?? 20}&offset=${params?.offset ?? 0}${params?.categorySlug ? `&category=${params.categorySlug}` : ''}`
  )
  if (remote) return remote

  let products = [...PRODUCTS]
  if (params?.categorySlug) {
    const cat = CATEGORIES.find(c => c.slug === params.categorySlug)
    if (cat) products = products.filter(p => p.categoryId === cat.id)
  }
  const start = params?.offset ?? 0
  const end = start + (params?.limit ?? products.length)
  return products.slice(start, end)
}

export async function fetchCategories(): Promise<Category[]> {
  const remote = await wpFetch<Category[]>('/wp-json/wc/v3/products/categories')
  return remote ?? CATEGORIES
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const remote = await wpFetch<Product>(`/wp-json/wc/v3/products?slug=${slug}`)
  return remote ?? PRODUCTS.find(p => p.slug === slug) ?? null
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  const remote = await wpFetch<Product[]>(`/wp-json/wc/v3/products?featured=true&per_page=${limit}`)
  if (remote) return remote
  return PRODUCTS.filter(p => p.badges?.includes('hit') || p.badges?.includes('bestseller')).slice(0, limit)
}

export async function fetchSaleProducts(limit = 8): Promise<Product[]> {
  const remote = await wpFetch<Product[]>(`/wp-json/wc/v3/products?on_sale=true&per_page=${limit}`)
  if (remote) return remote
  return PRODUCTS.filter(p => p.oldPrice && p.oldPrice > p.price).slice(0, limit)
}