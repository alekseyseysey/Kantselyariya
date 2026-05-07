/**
 * Клиентские мутации для WooGraphQL Cart / Checkout.
 * Используют общий `wooMutate` helper (см. `lib/woo-client.ts`).
 */

import { wooMutate } from './woo-client'

/* ─── Mutations ──────────────────────────────────────────────── */

const ADD_TO_CART = /* GraphQL */ `
  mutation AddToCart($productId: Int!, $quantity: Int!) {
    addToCart(input: { productId: $productId, quantity: $quantity }) {
      cartItem { key }
    }
  }
`

const EMPTY_CART = /* GraphQL */ `
  mutation EmptyCart {
    emptyCart(input: { clearPersistentCart: true }) {
      deletedCart { contents { itemCount } }
    }
  }
`

const CHECKOUT = /* GraphQL */ `
  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      order {
        id
        databaseId
        orderNumber
        status
        total
      }
      redirect
      result
    }
  }
`

/* ─── Public API ─────────────────────────────────────────────── */

export interface CheckoutAddress {
  firstName: string
  lastName?: string
  address1: string
  address2?: string
  city: string
  postcode?: string
  country: string // ISO 3166 code, для РБ — "BY"
  email?: string
  phone?: string
}

export interface CheckoutPayload {
  paymentMethod: string // например 'cod'
  billing: CheckoutAddress
  shipping?: CheckoutAddress // если не указан — Woo использует billing
  customerNote?: string
}

export interface CheckoutOrder {
  id: string
  databaseId: number
  orderNumber: string
  status: string
  total: string
}

export interface CheckoutResult {
  order: CheckoutOrder | null
  redirect: string | null
  result: string | null
}

/** Добавить товар в серверную корзину Woo. */
export async function wooAddToCart(productId: number, quantity = 1) {
  return wooMutate(ADD_TO_CART, { productId, quantity })
}

/** Очистить серверную корзину Woo (на случай старой сессии). */
export async function wooEmptyCart() {
  return wooMutate(EMPTY_CART)
}

/** Завершить оформление: создаёт ордер в WooCommerce. */
export async function wooCheckout(payload: CheckoutPayload) {
  return wooMutate<{ checkout: CheckoutResult }>(CHECKOUT, { input: payload })
}

/**
 * Полный flow: чистим серверную корзину → добавляем все позиции из локальной →
 * вызываем checkout. На входе — наш локальный CartItem[]. Возвращает Order или ошибку.
 */
export async function placeOrder(
  items: Array<{ id: string; quantity: number }>,
  payload: CheckoutPayload,
): Promise<{ order: CheckoutOrder | null; redirect: string | null; error: string | null }> {
  // 1. На всякий случай чистим прошлую сессию.
  await wooEmptyCart()

  // 2. Добавляем все позиции.
  for (const item of items) {
    const productId = Number(item.id)
    if (!Number.isFinite(productId)) {
      return { order: null, redirect: null, error: `Некорректный ID товара: ${item.id}` }
    }
    const { error } = await wooAddToCart(productId, item.quantity)
    if (error) {
      return { order: null, redirect: null, error: `Не удалось добавить товар #${item.id}: ${error}` }
    }
  }

  // 3. Финальный checkout.
  const { data, error } = await wooCheckout(payload)
  if (error || !data?.checkout) {
    return { order: null, redirect: null, error: error ?? 'Не удалось оформить заказ' }
  }
  return {
    order: data.checkout.order,
    redirect: data.checkout.redirect,
    error: null,
  }
}
