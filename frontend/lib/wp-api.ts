import type {
  Category,
  ContactsContent,
  FAQ,
  HeroContent,
  Product,
  PromoSlide,
  Review,
} from './types'
import {
  CATEGORIES,
  FAQ_ITEMS,
  PRODUCTS,
  PROMO_SLIDES,
} from './mock-data'

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? ''

const REVALIDATE_SECONDS = 60

/* ─── Core GraphQL fetcher ───────────────────────────────────────── */

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

async function wpQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
  if (!WP_API_URL) return null
  try {
    const res = await fetch(WP_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: REVALIDATE_SECONDS, tags: ['wp'] },
    })
    if (!res.ok) return null
    const json = (await res.json()) as GraphQLResponse<T>
    if (json.errors?.length) {
      console.warn('[wp-api] GraphQL errors:', json.errors.map(e => e.message).join('; '))
      return null
    }
    return json.data ?? null
  } catch (err) {
    console.warn('[wp-api] fetch failed:', (err as Error).message)
    return null
  }
}

/* ─── Raw WooGraphQL / WPGraphQL shapes ──────────────────────────── */

interface WPMedia {
  sourceUrl?: string | null
  altText?: string | null
}

interface WPProductCategory {
  id: string
  databaseId: number
  slug: string
  name: string
  count?: number | null
  productCategoryFields?: {
    emoji?: string | null
    color?: string | null
    iconBg?: string | null
  } | null
}

/**
 * WooGraphQL exposes products as a union of `SimpleProduct`, `VariableProduct`,
 * `ExternalProduct`, `GroupProduct`. Common fields live on the `Product` interface;
 * pricing + stock fields are queried via inline fragments. ACF group `productFields`
 * holds non-Woo extras (brand, badges, paper density, custom spec rows).
 */
interface WooProductNode {
  __typename?: string | null
  id: string
  databaseId: number
  slug: string
  name: string
  sku?: string | null
  description?: string | null
  shortDescription?: string | null
  onSale?: boolean | null
  averageRating?: number | null
  reviewCount?: number | null
  image?: WPMedia | null
  galleryImages?: { nodes: WPMedia[] } | null
  productCategories?: { nodes: WPProductCategory[] } | null
  // Pricing/stock — present on SimpleProduct/VariableProduct/ExternalProduct
  price?: string | null
  regularPrice?: string | null
  salePrice?: string | null
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER' | string | null
  stockQuantity?: number | null
  // ACF (free — repeaters need ACF Pro and are commented out)
  productFields?: {
    brand?: string | null
    badges?: string[] | null
    paperDensity?: string | null
    // specs?: Array<{ key?: string | null; value?: string | null }> | null  // ACF Pro repeater
  } | null
  // WooGraphQL отдаёт отзывы как connection: rating живёт на edge, остальное — на node.
  reviews?: {
    edges?: Array<{
      rating?: number | null
      node?: {
        id?: string | null
        databaseId?: number | null
        date?: string | null
        content?: string | null
        author?: { node?: { name?: string | null } | null } | null
      } | null
    }> | null
  } | null
}

/* ─── Site-wide settings (FREE, через WP General Settings) ─────── */

export interface SiteSettings {
  /** Site Title из WP-админки → Settings → General. */
  title: string
  /** Tagline (Description). */
  description: string
  url: string
  language: string
}

const SITE_FALLBACK: SiteSettings = {
  title: 'КанцМир',
  description: 'Канцелярские товары с доставкой по Беларуси',
  url: 'https://kantsmir.by',
  language: 'ru',
}

const SITE_SETTINGS_QUERY = /* GraphQL */ `
  query SiteSettings {
    generalSettings {
      title
      description
      url
      language
    }
  }
`

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const data = await wpQuery<{ generalSettings: Partial<SiteSettings> | null }>(
    SITE_SETTINGS_QUERY,
  )
  const s = data?.generalSettings
  if (!s) return SITE_FALLBACK
  return {
    title: s.title || SITE_FALLBACK.title,
    description: s.description || SITE_FALLBACK.description,
    url: s.url || SITE_FALLBACK.url,
    language: s.language || SITE_FALLBACK.language,
  }
}

/* ─── Generic WP page fetcher (FREE) ────────────────────────────── */

export interface WPPageContent {
  title: string
  content: string
}

const PAGE_QUERY = /* GraphQL */ `
  query GetPage($slug: ID!) {
    page(id: $slug, idType: URI) {
      title
      content
    }
  }
`

/**
 * Тянет WP-страницу по slug. Возвращает `null`, если страницы нет —
 * вызывающий код может показать fallback / placeholder.
 */
export async function fetchPage(slug: string): Promise<WPPageContent | null> {
  const data = await wpQuery<{ page: { title?: string | null; content?: string | null } | null }>(
    PAGE_QUERY,
    { slug },
  )
  const p = data?.page
  if (!p?.content) return null
  return {
    title: p.title ?? '',
    content: p.content,
  }
}

/* ─── Theme Settings (ACF Pro Options Page — закомментировано) ─────────────
 *
 * Когда установите ACF Pro, в WP-админке создайте Options Page «Настройки темы»
 * (через `acf_add_options_page()` в functions.php) с группой полей `themeSettings`,
 * и Show in GraphQL = on, GraphQL Field Name = `themeSettings`. Поля:
 *   - logo (image, return type: array — нам нужен sourceUrl)
 *   - heroBackgroundImage (image)
 *   - heroBadge (text)
 *   - heroHeading (text)
 *   - heroHeadingHighlight (text)
 *   - heroSubheading (textarea)
 *   - heroPrimaryCtaLabel / heroPrimaryCtaUrl (text)
 *   - heroSecondaryCtaLabel / heroSecondaryCtaUrl (text)
 *   - heroStats (Repeater: value, label)
 *   - promoSlides (Repeater: heading, subheading, cta, ctaHref, bgFrom, bgTo, emoji)
 *   - footerColumns (Repeater: title + nested Repeater of links)
 *   - footerNote (textarea)
 *   - phones (Repeater: number, label)
 *   - messengers (Repeater: name, href, emoji)
 *   - socials (Repeater: name, href, emoji)
 *   - address (textarea)
 *
 * После того как ACF Pro установлен — раскомментируйте блок ниже:
 */
// const THEME_SETTINGS_QUERY = /* GraphQL */ `
//   query ThemeSettings {
//     themeSettings {
//       logo { sourceUrl altText }
//       heroBackgroundImage { sourceUrl altText }
//       heroBadge
//       heroHeading
//       heroHeadingHighlight
//       heroSubheading
//       heroPrimaryCtaLabel
//       heroPrimaryCtaUrl
//       heroSecondaryCtaLabel
//       heroSecondaryCtaUrl
//       heroStats { value label }
//       promoSlides { heading subheading cta ctaHref bgFrom bgTo emoji }
//       footerColumns { title links { label href } }
//       footerNote
//       phones { number label }
//       messengers { name href emoji }
//       socials { name href emoji }
//       address
//     }
//   }
// `
//
// export interface ThemeSettings {
//   logoUrl: string | null
//   heroBackgroundUrl: string | null
//   hero: HeroContent
//   promoSlides: PromoSlide[]
//   footerColumns: Array<{ title: string; links: Array<{ label: string; href: string }> }>
//   footerNote: string
//   phones: Array<{ number: string; label: string }>
//   messengers: Array<{ name: string; href: string; emoji: string }>
//   socials: Array<{ name: string; href: string; emoji: string }>
//   address: string
// }
//
// export async function fetchThemeSettings(): Promise<ThemeSettings | null> {
//   const data = await wpQuery<{ themeSettings: ThemeSettings | null }>(THEME_SETTINGS_QUERY)
//   return data?.themeSettings ?? null
// }

/* ─── End ACF Pro skeleton ─────────────────────────────────────── */

// Контент таба «Доставка и оплата» — обычная WP-страница со слагом `delivery`.
// Редактор заходит в WP-админку → Pages → "Delivery" и правит как обычный пост.
const DELIVERY_PAGE_QUERY = /* GraphQL */ `
  query DeliveryPage {
    page(id: "delivery", idType: URI) {
      content
    }
  }
`

const DELIVERY_FALLBACK_HTML = `
<p><strong>Доставка по Минску</strong> — в течение 24 часов с момента подтверждения заказа.</p>
<p><strong>Доставка по Беларуси</strong> — 1–3 рабочих дня курьером или в пункт выдачи СДЭК / Европочта.</p>
<p><strong>Бесплатная доставка</strong> при заказе от 50 руб.</p>
<p><strong>Самовывоз</strong> — бесплатно, г. Минск, ул. Примерная, 12, офис 305 (пн–пт 8:30–17:00).</p>
<p><strong>Способы оплаты:</strong> банковская карта онлайн, наличные курьеру, по счёту для юрлиц, рассрочка (Халва, Магнит).</p>
`.trim()

export async function fetchDeliveryContent(): Promise<string> {
  const data = await wpQuery<{ page: { content?: string | null } | null }>(
    DELIVERY_PAGE_QUERY,
  )
  const html = data?.page?.content?.trim()
  return html && html.length > 0 ? html : DELIVERY_FALLBACK_HTML
}

// FAQ items are an ACF Pro Repeater — disabled until ACF Pro is installed.
// interface WPPageFaq {
//   faqFields?: {
//     items?: Array<{ question?: string | null; answer?: string | null }> | null
//   } | null
// }

interface WPPageContacts {
  contactFields?: {
    address?: string | null
    email?: string | null
    workingHoursOperators?: string | null
    workingHoursOffice?: string | null
    // ACF Pro Repeaters — disabled until ACF Pro is installed:
    // phones?: Array<{ number?: string | null; label?: string | null }> | null
    // messengers?: Array<{ name?: string | null; href?: string | null; emoji?: string | null }> | null
    // socials?: Array<{ name?: string | null; href?: string | null; emoji?: string | null }> | null
  } | null
}

interface WPThemeOptions {
  themeOptions?: {
    hero?: {
      badge?: string | null
      heading?: string | null
      headingHighlight?: string | null
      subheading?: string | null
      primaryCta?: { label?: string | null; url?: string | null } | null
      secondaryCta?: { label?: string | null; url?: string | null } | null
      stats?: Array<{ value?: string | null; label?: string | null }> | null
    } | null
    promoSlides?: Array<{
      heading?: string | null
      subheading?: string | null
      cta?: string | null
      ctaHref?: string | null
      bgFrom?: string | null
      bgTo?: string | null
      emoji?: string | null
    }> | null
  } | null
}

/* ─── Mappers ────────────────────────────────────────────────────── */

type SpecRow = { key?: string | null; value?: string | null }

// function specsToRecord(specs: SpecRow[] | null | undefined): Record<string, string> | undefined {
//   if (!specs || !Array.isArray(specs)) return undefined
//   const out: Record<string, string> = {}
//   for (const row of specs) {
//     if (row?.key && row.value != null) out[row.key] = String(row.value)
//   }
//   return Object.keys(out).length ? out : undefined
// }

type ProductBadge = NonNullable<Product['badges']>[number]

const VALID_BADGES: ReadonlySet<ProductBadge> = new Set(['hit', 'new', 'sale', 'bestseller'])

/**
 * WooGraphQL returns formatted price strings such as "1,22&nbsp;руб." or
 * "$10.00 - $20.00" (variable products). Strip currency markup and pull the
 * first numeric token; for ranges this yields the lower bound.
 */
function parsePrice(s: string | null | undefined): number {
  if (!s) return 0
  const cleaned = String(s).replace(/&nbsp;/g, ' ').replace(/&#?\w+;/g, ' ')
  const match = cleaned.match(/-?\d+(?:[.,]\d+)?/)
  return match ? Number(match[0].replace(',', '.')) : 0
}

function deriveStock(
  stockStatus: WooProductNode['stockStatus'],
  stockQuantity: WooProductNode['stockQuantity'],
): number {
  if (typeof stockQuantity === 'number') return Math.max(0, stockQuantity)
  if (stockStatus === 'IN_STOCK') return 1
  return 0
}

function htmlToText(html: string | null | undefined): string | undefined {
  if (!html) return undefined
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  return text || undefined
}

/**
 * WordPress часто хранит загруженные файлы с не-ASCII именами (кириллица и т.д.).
 * `next/image` пробрасывает URL через свой оптимизатор и роняет такие пути,
 * поэтому прогоняем URL через WHATWG URL parser — он percent-encode'ит pathname.
 */
function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).toString()
  } catch {
    return url
  }
}

function mapReview(edge: NonNullable<NonNullable<WooProductNode['reviews']>['edges']>[number]): Review | null {
  const n = edge?.node
  if (!n?.id) return null
  return {
    id: n.id,
    databaseId: n.databaseId ?? 0,
    date: n.date ?? '',
    author: n.author?.node?.name ?? 'Покупатель',
    content: n.content ?? '',
    rating: typeof edge.rating === 'number' ? edge.rating : null,
  }
}

function mapProduct(node: WooProductNode): Product {
  const allCats = node.productCategories?.nodes ?? []
  const cat = allCats[0]
  const categoryIds = allCats.map(c => String(c.databaseId))
  const f = node.productFields ?? {}
  const reviews = (node.reviews?.edges ?? [])
    .map(mapReview)
    .filter((r): r is Review => r !== null)

  // Images: feature image + gallery, deduped, normalized for next/image.
  const images: string[] = []
  const featured = normalizeImageUrl(node.image?.sourceUrl)
  if (featured) images.push(featured)
  for (const g of node.galleryImages?.nodes ?? []) {
    const u = normalizeImageUrl(g.sourceUrl)
    if (u && !images.includes(u)) images.push(u)
  }
  if (images.length === 0) images.push('/images/placeholder-product.svg')

  // Pricing — price = current display price, regularPrice = pre-sale.
  const price = parsePrice(node.price ?? node.regularPrice)
  const regular = parsePrice(node.regularPrice)
  const onSale = Boolean(node.onSale) && regular > price
  const oldPrice = onSale ? regular : undefined

  // Badges: derive `sale` from Woo's onSale, merge with ACF-supplied badges.
  const acfBadges = (f.badges ?? []).filter((b): b is ProductBadge =>
    typeof b === 'string' && VALID_BADGES.has(b as ProductBadge),
  )
  const badges: ProductBadge[] = [...acfBadges]
  if (onSale && !badges.includes('sale')) badges.push('sale')

  // Specs: ACF repeater + surface paper_density if it isn't already a row.
  // let specs = specsToRecord(f.specs)
  // if (f.paperDensity && !specs?.['Плотность']) {
  //   specs = { ...(specs ?? {}), 'Плотность': f.paperDensity }
  // }

  return {
    id: String(node.databaseId),
    slug: node.slug,
    name: node.name,
    price,
    oldPrice,
    brand: f.brand ?? '',
    sku: node.sku ?? '',
    categoryId: cat ? String(cat.databaseId) : '',
    categoryName: cat?.name ?? '',
    categoryIds,
    images,
    rating: typeof node.averageRating === 'number' ? node.averageRating : 0,
    reviewCount: typeof node.reviewCount === 'number' ? node.reviewCount : 0,
    stock: deriveStock(node.stockStatus, node.stockQuantity),
    badges,
    description: htmlToText(node.shortDescription) ?? htmlToText(node.description),
    // specs,
    reviews,
  }
}

function mapCategory(node: WPProductCategory): Category {
  const fields = node.productCategoryFields ?? {}
  return {
    id: String(node.databaseId),
    slug: node.slug,
    name: node.name,
    count: node.count ?? 0,
    emoji: fields.emoji ?? '📦',
    color: fields.color ?? '#2B4DD6',
    iconBg: fields.iconBg ?? '#EEF2FF',
  }
}

/* ─── GraphQL queries ────────────────────────────────────────────── */

/**
 * Common Woo product fields. Pricing & stock live on concrete types, so we
 * inline-fragment SimpleProduct / VariableProduct / ExternalProduct.
 */
const PRODUCT_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    __typename
    id
    databaseId
    slug
    name
    sku
    description
    shortDescription
    onSale
    averageRating
    reviewCount
    image { sourceUrl altText }
    galleryImages { nodes { sourceUrl altText } }
    productCategories {
      nodes {
        id
        databaseId
        slug
        name
        count
        productCategoryFields { emoji color iconBg }
      }
    }
    productFields {
      brand
      badges
      paperDensity
      # specs { key value }   # ACF Pro Repeater — re-enable when ACF Pro is installed
    }
    reviews(first: 50) {
      edges {
        rating
        node {
          id
          databaseId
          date
          content
          author { node { name } }
        }
      }
    }
    ... on SimpleProduct {
      price
      regularPrice
      salePrice
      stockStatus
      stockQuantity
    }
    ... on VariableProduct {
      price
      regularPrice
      salePrice
      stockStatus
      stockQuantity
    }
    ... on ExternalProduct {
      price
      regularPrice
      salePrice
    }
  }
`

const PRODUCTS_LIST_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS_FRAGMENT}
  query ProductsList($first: Int) {
    products(first: $first) {
      nodes { ...ProductFields }
    }
  }
`

const PRODUCTS_BY_CATEGORY_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS_FRAGMENT}
  query ProductsByCategory($first: Int, $slug: String) {
    products(first: $first, where: { category: $slug }) {
      nodes { ...ProductFields }
    }
  }
`

// Курсорная пагинация (Relay-style) — для каталога с «Показать ещё».
const PRODUCTS_PAGE_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS_FRAGMENT}
  query ProductsPage($first: Int, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { ...ProductFields }
    }
  }
`

const PRODUCTS_PAGE_BY_CATEGORY_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS_FRAGMENT}
  query ProductsPageByCategory($first: Int, $after: String, $slug: String) {
    products(first: $first, after: $after, where: { category: $slug }) {
      pageInfo { hasNextPage endCursor }
      nodes { ...ProductFields }
    }
  }
`

const PRODUCTS_ON_SALE_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS_FRAGMENT}
  query ProductsOnSale($first: Int) {
    products(first: $first, where: { onSale: true }) {
      nodes { ...ProductFields }
    }
  }
`

const PRODUCTS_FEATURED_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS_FRAGMENT}
  query ProductsFeatured($first: Int) {
    products(first: $first, where: { featured: true }) {
      nodes { ...ProductFields }
    }
  }
`

// Fallback for "popular" — when no products are flagged as Featured in Woo admin,
// fall back to top sellers by total_sales.
const PRODUCTS_POPULAR_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS_FRAGMENT}
  query ProductsPopular($first: Int) {
    products(first: $first, where: { orderby: { field: TOTAL_SALES, order: DESC } }) {
      nodes { ...ProductFields }
    }
  }
`

const PRODUCT_BY_SLUG_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS_FRAGMENT}
  query ProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) { ...ProductFields }
  }
`

const ALL_PRODUCT_SLUGS_QUERY = /* GraphQL */ `
  query AllProductSlugs {
    products(first: 1000) { nodes { slug } }
  }
`

const CATEGORIES_QUERY = /* GraphQL */ `
  query ProductCategories {
    productCategories(first: 100) {
      nodes {
        id
        databaseId
        slug
        name
        count
        productCategoryFields { emoji color iconBg }
      }
    }
  }
`

// FAQ items live in an ACF Pro Repeater. Re-enable when ACF Pro is installed.
// const FAQ_PAGE_QUERY = /* GraphQL */ `
//   query FaqPage {
//     page(id: "faq", idType: URI) {
//       faqFields { items { question answer } }
//     }
//   }
// `

const CONTACTS_PAGE_QUERY = /* GraphQL */ `
  query ContactsPage {
    page(id: "contacts", idType: URI) {
      contactFields {
        address
        email
        workingHoursOperators
        workingHoursOffice
        # phones / messengers / socials live in ACF Pro Repeaters — disabled for now
        # phones { number label }
        # messengers { name href emoji }
        # socials { name href emoji }
      }
    }
  }
`

// Hero/promo slides live on an ACF Options Page (ACF Pro). Disabled for now.
// const THEME_OPTIONS_QUERY = /* GraphQL */ `
//   query ThemeOptions {
//     themeOptions {
//       hero {
//         badge
//         heading
//         headingHighlight
//         subheading
//         primaryCta { label url }
//         secondaryCta { label url }
//         stats { value label }
//       }
//       promoSlides {
//         heading
//         subheading
//         cta
//         ctaHref
//         bgFrom
//         bgTo
//         emoji
//       }
//     }
//   }
// `

/* ─── Public API ─────────────────────────────────────────────────── */

export async function fetchProducts(params?: {
  categorySlug?: string
  limit?: number
  offset?: number
}): Promise<Product[]> {
  const limit = params?.limit ?? 100
  const data = params?.categorySlug
    ? await wpQuery<{ products: { nodes: WooProductNode[] } }>(
        PRODUCTS_BY_CATEGORY_QUERY,
        { first: limit, slug: params.categorySlug },
      )
    : await wpQuery<{ products: { nodes: WooProductNode[] } }>(
        PRODUCTS_LIST_QUERY,
        { first: limit },
      )

  if (data?.products?.nodes) {
    let products = data.products.nodes.map(mapProduct)
    if (params?.offset) products = products.slice(params.offset)
    if (params?.limit) products = products.slice(0, params.limit)
    return products
  }

  // Fallback to mock data when the Woo/WPGraphQL backend is unreachable.
  let products = [...PRODUCTS]
  if (params?.categorySlug) {
    const cat = CATEGORIES.find(c => c.slug === params.categorySlug)
    if (cat) products = products.filter(p => p.categoryId === cat.id)
  }
  const start = params?.offset ?? 0
  const end = start + (params?.limit ?? products.length)
  return products.slice(start, end)
}

/* ─── Курсорная пагинация для каталога ─────────────────────────── */

export interface ProductsPage {
  products: Product[]
  endCursor: string | null
  hasNextPage: boolean
}

interface WooProductsConnection {
  pageInfo?: { hasNextPage?: boolean | null; endCursor?: string | null } | null
  nodes: WooProductNode[]
}

/**
 * Подгружает «страницу» товаров (по умолчанию 20). Используется на /catalog,
 * /catalog/[category] и в роуте `/api/products-page` для дозагрузки кнопкой
 * «Показать ещё».
 *
 * Курсор `after` — opaque string, который вернулся в `pageInfo.endCursor`
 * предыдущего запроса. Передаём `undefined` для первой страницы.
 */
export async function fetchProductsPage(params?: {
  first?: number
  after?: string | null
  categorySlug?: string
}): Promise<ProductsPage> {
  const first = params?.first ?? 20
  const after = params?.after ?? null

  const data = params?.categorySlug
    ? await wpQuery<{ products: WooProductsConnection }>(
        PRODUCTS_PAGE_BY_CATEGORY_QUERY,
        { first, after, slug: params.categorySlug },
      )
    : await wpQuery<{ products: WooProductsConnection }>(
        PRODUCTS_PAGE_QUERY,
        { first, after },
      )

  if (data?.products) {
    return {
      products: data.products.nodes.map(mapProduct),
      endCursor: data.products.pageInfo?.endCursor ?? null,
      hasNextPage: Boolean(data.products.pageInfo?.hasNextPage),
    }
  }

  // Fallback на mock-data: курсор тут — просто числовой offset.
  let mock = [...PRODUCTS]
  if (params?.categorySlug) {
    const cat = CATEGORIES.find(c => c.slug === params.categorySlug)
    if (cat) mock = mock.filter(p => p.categoryId === cat.id)
  }
  const offset = after ? Number(after) || 0 : 0
  const slice = mock.slice(offset, offset + first)
  const nextOffset = offset + first
  return {
    products: slice,
    endCursor: nextOffset < mock.length ? String(nextOffset) : null,
    hasNextPage: nextOffset < mock.length,
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const data = await wpQuery<{ productCategories: { nodes: WPProductCategory[] } }>(
    CATEGORIES_QUERY,
  )
  if (data?.productCategories?.nodes?.length) {
    return data.productCategories.nodes.map(mapCategory)
  }
  return CATEGORIES
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await fetchCategories()
  return all.find(c => c.slug === slug) ?? null
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const data = await wpQuery<{ product: WooProductNode | null }>(
    PRODUCT_BY_SLUG_QUERY,
    { slug },
  )
  if (data?.product) return mapProduct(data.product)
  return PRODUCTS.find(p => p.slug === slug) ?? null
}

export async function fetchAllProductSlugs(): Promise<string[]> {
  const data = await wpQuery<{ products: { nodes: Array<{ slug: string }> } }>(
    ALL_PRODUCT_SLUGS_QUERY,
  )
  if (data?.products?.nodes?.length) {
    return data.products.nodes.map(n => n.slug)
  }
  return PRODUCTS.map(p => p.slug)
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  // 1) Featured флаг в Woo-админке.
  const featured = await wpQuery<{ products: { nodes: WooProductNode[] } }>(
    PRODUCTS_FEATURED_QUERY,
    { first: limit },
  )
  if (featured?.products?.nodes?.length) {
    return featured.products.nodes.map(mapProduct).slice(0, limit)
  }

  // 2) Если ничего не помечено Featured — берём топ по продажам.
  const popular = await wpQuery<{ products: { nodes: WooProductNode[] } }>(
    PRODUCTS_POPULAR_QUERY,
    { first: limit },
  )
  if (popular?.products?.nodes?.length) {
    return popular.products.nodes.map(mapProduct).slice(0, limit)
  }

  // 3) Если Woo недоступен — моки по бейджам.
  return PRODUCTS
    .filter(p => p.badges?.includes('hit') || p.badges?.includes('bestseller'))
    .slice(0, limit)
}

export async function fetchSaleProducts(limit = 8): Promise<Product[]> {
  const data = await wpQuery<{ products: { nodes: WooProductNode[] } }>(
    PRODUCTS_ON_SALE_QUERY,
    { first: limit },
  )
  if (data?.products?.nodes?.length) {
    return data.products.nodes.map(mapProduct).slice(0, limit)
  }
  return PRODUCTS
    .filter(p => p.oldPrice && p.oldPrice > p.price)
    .slice(0, limit)
}

/* ─── Pages: FAQ, Contacts, Hero ─────────────────────────────────── */

export async function fetchFaqItems(): Promise<FAQ[]> {
  // FAQ items live in an ACF Pro Repeater. Until ACF Pro is installed, serve mock items.
  return FAQ_ITEMS
}

const CONTACTS_FALLBACK: ContactsContent = {
  address: 'г. Минск, ул. Примерная, 12, офис 305',
  email: 'info@kantsmir.by',
  hoursOperators: 'Операторы: 9:00–22:00, ежедневно',
  hoursOffice: 'Офис: пн–пт, 8:30–17:00',
  phones: [
    { number: '+375 (29) 610-41-41', label: 'A1' },
    { number: '+375 (29) 710-41-41', label: 'МТС' },
    { number: '+375 (17) 271-41-41', label: 'Гор.' },
  ],
  messengers: [
    { name: 'Telegram', href: 'https://t.me/kantsmir', emoji: '✈️' },
    { name: 'Viber',    href: 'viber://chat?number=%2B375296104141', emoji: '📲' },
    { name: 'WhatsApp', href: 'https://wa.me/375296104141', emoji: '💬' },
  ],
  socials: [
    { name: 'Instagram', href: 'https://instagram.com/kantsmir', emoji: '📸' },
    { name: 'VK',        href: 'https://vk.com/kantsmir',        emoji: '🔵' },
    { name: 'TikTok',    href: 'https://tiktok.com/@kantsmir',   emoji: '🎵' },
    { name: 'YouTube',   href: 'https://youtube.com/@kantsmir',  emoji: '▶️' },
  ],
}

export async function fetchContacts(): Promise<ContactsContent> {
  const data = await wpQuery<{ page: WPPageContacts | null }>(CONTACTS_PAGE_QUERY)
  const f = data?.page?.contactFields
  if (!f) return CONTACTS_FALLBACK
  // Simple text fields come from ACF (free); phones/messengers/socials need
  // ACF Pro Repeaters and stay on the mock fallback for now.
  return {
    address: f.address ?? CONTACTS_FALLBACK.address,
    email: f.email ?? CONTACTS_FALLBACK.email,
    hoursOperators: f.workingHoursOperators ?? CONTACTS_FALLBACK.hoursOperators,
    hoursOffice: f.workingHoursOffice ?? CONTACTS_FALLBACK.hoursOffice,
    phones: CONTACTS_FALLBACK.phones,
    messengers: CONTACTS_FALLBACK.messengers,
    socials: CONTACTS_FALLBACK.socials,
  }
}

const HERO_FALLBACK: HeroContent = {
  badge: 'Более 12 000 товаров в наличии',
  heading: 'Канцелярия для тех, кто любит',
  headingHighlight: 'делать дело',
  subheading:
    '12 000+ товаров в наличии. Доставка по Беларуси за 24 часа. Опт от 1 единицы — выгодно школам, офисам, студиям.',
  primaryCta: { label: 'Перейти в каталог', url: '/catalog' },
  secondaryCta: { label: 'Оптом дешевле',   url: '/wholesale' },
  stats: [
    { value: '12 000+', label: 'товаров' },
    { value: '24 ч',    label: 'доставка' },
    { value: '8 лет',   label: 'на рынке' },
    { value: '15 000+', label: 'клиентов' },
  ],
}

export async function fetchHero(): Promise<HeroContent> {
  // Hero content lives on an ACF Options Page (ACF Pro). Use the local fallback for now.
  return HERO_FALLBACK
  // Re-enable when ACF Pro is installed:
  /*
  const data = await wpQuery<WPThemeOptions>(THEME_OPTIONS_QUERY)
  const h = data?.themeOptions?.hero
  if (!h) return HERO_FALLBACK
  return {
    badge: h.badge ?? HERO_FALLBACK.badge,
    heading: h.heading ?? HERO_FALLBACK.heading,
    headingHighlight: h.headingHighlight ?? HERO_FALLBACK.headingHighlight,
    subheading: h.subheading ?? HERO_FALLBACK.subheading,
    primaryCta: {
      label: h.primaryCta?.label ?? HERO_FALLBACK.primaryCta.label,
      url:   h.primaryCta?.url   ?? HERO_FALLBACK.primaryCta.url,
    },
    secondaryCta: {
      label: h.secondaryCta?.label ?? HERO_FALLBACK.secondaryCta.label,
      url:   h.secondaryCta?.url   ?? HERO_FALLBACK.secondaryCta.url,
    },
    stats: (h.stats ?? [])
      .map(s => ({ value: s.value ?? '', label: s.label ?? '' }))
      .filter(s => s.value && s.label).length
        ? (h.stats ?? []).map(s => ({ value: s.value ?? '', label: s.label ?? '' }))
        : HERO_FALLBACK.stats,
  }
  */
}

export async function fetchPromoSlides() {
  // Promo slides live on an ACF Options Page (ACF Pro). Use the local fallback for now.
  return PROMO_SLIDES
}
