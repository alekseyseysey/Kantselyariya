/**
 * Клиентская мутация для отправки отзыва на товар через WooGraphQL.
 * Идёт через тот же Next-прокси `/api/woo-graphql` (см. `lib/woo-client.ts`).
 */

import { wooMutate } from './woo-client'

const WRITE_REVIEW = /* GraphQL */ `
  mutation WriteReview($input: WriteReviewInput!) {
    writeReview(input: $input) {
      rating
      review {
        id
        databaseId
        date
        content
        author { node { name } }
        status   # "approve" | "hold" — зависит от настроек модерации Woo
      }
    }
  }
`

export interface WriteReviewInput {
  /** databaseId товара (Product.id у нас — строка, преобразуйте Number(p.id)). */
  commentOn: number
  /** 1–5. */
  rating: number
  /** Текст отзыва (plain text — Woo обработает). */
  content: string
  /** Имя гостя. Для авторизованных пользователей не нужно. */
  author: string
  /** Email гостя. Для авторизованных не нужно. */
  authorEmail: string
}

export interface WriteReviewResult {
  rating: number | null
  review: {
    id: string
    databaseId: number
    date: string
    content: string
    author: string
    /** "approve" — опубликован сразу, "hold" — ждёт модерации. */
    status: string
  } | null
}

export async function wooWriteReview(
  input: WriteReviewInput,
): Promise<{ data: WriteReviewResult | null; error: string | null }> {
  const { data, error } = await wooMutate<{
    writeReview: {
      rating: number | null
      review: {
        id: string
        databaseId: number
        date: string
        content: string
        status: string
        author: { node?: { name?: string | null } | null } | null
      } | null
    } | null
  }>(WRITE_REVIEW, { input })

  if (error || !data?.writeReview) {
    return { data: null, error: error ?? 'Не удалось отправить отзыв' }
  }

  const r = data.writeReview.review
  return {
    data: {
      rating: data.writeReview.rating,
      review: r
        ? {
            id: r.id,
            databaseId: r.databaseId,
            date: r.date,
            content: r.content,
            author: r.author?.node?.name ?? input.author,
            status: r.status,
          }
        : null,
    },
    error: null,
  }
}
