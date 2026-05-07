import { NextResponse } from 'next/server'

// 10 MB — должно совпадать с лимитом плагина (KANTSMIR_MAX_FILE).
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

const wpHost = process.env.NEXT_PUBLIC_WORDPRESS_HOST ?? 'kantselariya.local'
// HTTP для локалки, HTTPS если хост точно публичный.
const wpProtocol = wpHost.endsWith('.local') ? 'http' : 'https'
const WP_ENDPOINT = `${wpProtocol}://${wpHost}/wp-json/kantsmir/v1/wholesale`

export async function POST(req: Request) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'bad_form', message: 'Не удалось прочитать форму' },
      { status: 400 },
    )
  }

  // Лёгкая проверка файла на стороне Next, чтобы не гонять 10 МБ-мусор до WP.
  const file = formData.get('attachment')
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: 'too_large', message: 'Файл больше 10 МБ' },
        { status: 413 },
      )
    }
    if (file.type && !ALLOWED_FILE_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'bad_type',
          message: 'Допустимы PDF, DOC, DOCX, XLS, XLSX',
        },
        { status: 415 },
      )
    }
  }

  let wpRes: Response
  try {
    wpRes = await fetch(WP_ENDPOINT, {
      method: 'POST',
      body: formData,
      // Никогда не кэшируем мутации.
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[api/wholesale] WP unreachable:', err)
    return NextResponse.json(
      { ok: false, error: 'wp_unreachable', message: 'Сервер временно недоступен. Попробуйте позже.' },
      { status: 502 },
    )
  }

  // Прокидываем тело и статус как есть — WP возвращает {ok, id} или {ok:false, error, message}.
  let payload: unknown
  try {
    payload = await wpRes.json()
  } catch {
    payload = { ok: false, error: 'bad_response', message: 'Некорректный ответ от сервера' }
  }
  return NextResponse.json(payload, { status: wpRes.status })
}
