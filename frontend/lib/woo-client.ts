/**
 * Тонкий клиент для WooGraphQL mutations через Next-прокси `/api/woo-graphql`.
 * Прокси сам управляет Woo-сессией через HTTP-only cookie — клиенту знать
 * о сессии не нужно.
 */

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

export async function wooMutate<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch('/api/woo-graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    })
    const json = (await res.json()) as GraphQLResponse<T>
    if (json.errors?.length) {
      return { data: null, error: json.errors.map(e => e.message).join('; ') }
    }
    return { data: json.data ?? null, error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}
