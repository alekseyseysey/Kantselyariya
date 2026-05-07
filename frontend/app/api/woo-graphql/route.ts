import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Прокси к WooGraphQL для cart/checkout-мутаций.
 *
 * Зачем: WooGraphQL держит корзину гостя на сервере, привязывая её к
 * session-токену. Токен возвращается в HTTP-заголовке `woocommerce-session`
 * и должен присылаться обратно как `woocommerce-session: Session <token>`
 * в каждом следующем запросе.
 *
 * Здесь мы храним токен в HTTP-only cookie (недоступен JS, защита от XSS),
 * автоматически прокидываем его в upstream и обновляем при ротации.
 */

const WP_HOST = process.env.NEXT_PUBLIC_WORDPRESS_HOST ?? 'kantselariya.local'
const WP_PROTOCOL = WP_HOST.endsWith('.local') ? 'http' : 'https'
const WP_GRAPHQL_URL = `${WP_PROTOCOL}://${WP_HOST}/graphql`

const COOKIE_NAME = 'kantsmir_woo_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 дней — типичный TTL Woo-сессии

export async function POST(req: Request) {
  const body = await req.text() // Прокидываем тело GraphQL без изменений.
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAME)?.value

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (session) {
    headers['woocommerce-session'] = `Session ${session}`
  }

  let wpRes: Response
  try {
    wpRes = await fetch(WP_GRAPHQL_URL, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[api/woo-graphql] WP unreachable:', err)
    return NextResponse.json(
      { errors: [{ message: 'WordPress backend unreachable' }] },
      { status: 502 },
    )
  }

  // Reading body is destructive — read once and forward.
  let payload: unknown
  try {
    payload = await wpRes.json()
  } catch {
    payload = { errors: [{ message: 'Invalid GraphQL response' }] }
  }

  const response = NextResponse.json(payload, { status: wpRes.status })

  // WooGraphQL может вернуть новый session-token — сохраняем в cookie.
  // Заголовок прилетает в формате `Session eyJ...` — отрезаем префикс.
  const newSessionRaw = wpRes.headers.get('woocommerce-session')
  if (newSessionRaw) {
    const token = newSessionRaw.startsWith('Session ')
      ? newSessionRaw.slice('Session '.length)
      : newSessionRaw
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    })
  }

  return response
}
