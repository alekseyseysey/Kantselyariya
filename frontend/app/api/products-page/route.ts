import { NextResponse } from 'next/server'
import { fetchProductsPage } from '@/lib/wp-api'

/**
 * Дозагрузка следующей страницы товаров для каталога.
 * GET /api/products-page?first=20&after=<cursor>&category=<slug>
 *
 * Возвращает `{ products, endCursor, hasNextPage }` в том же формате,
 * что и серверный `fetchProductsPage`.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const firstRaw = Number(searchParams.get('first') ?? '20')
  const first = Number.isFinite(firstRaw) ? Math.min(Math.max(firstRaw, 1), 50) : 20
  const after = searchParams.get('after') || undefined
  const category = searchParams.get('category') || undefined

  const page = await fetchProductsPage({ first, after, categorySlug: category })
  return NextResponse.json(page)
}
