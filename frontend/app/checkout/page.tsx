'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Loader2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/CartProvider'
import { placeOrder, type CheckoutPayload } from '@/lib/woo-cart'
import { formatPrice } from '@/lib/utils'
import Breadcrumb from '@/components/ui/Breadcrumb'

const schema = z.object({
  firstName: z.string().min(2, 'Введите имя'),
  lastName:  z.string().optional(),
  phone:     z.string().min(9, 'Введите корректный телефон'),
  email:     z.string().email('Введите корректный e-mail'),
  city:      z.string().min(2, 'Введите город'),
  address:   z.string().min(3, 'Введите адрес'),
  comment:   z.string().optional(),
  paymentMethod: z.literal('cod'),
  consent:   z.literal(true, { message: 'Необходимо ваше согласие' }),
})

type FormData = z.infer<typeof schema>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalItems, totalPrice, hydrated, clearCart } = useCart()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'cod' },
  })

  const delivery = totalPrice >= 50 ? 0 : 5.0
  const orderTotal = totalPrice + delivery

  // Если гидрировалось и корзина пуста — отправляем на каталог.
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace('/cart')
    }
  }, [hydrated, items.length, router])

  async function onSubmit(data: FormData) {
    setSubmitError(null)

    const fullName = data.firstName + (data.lastName ? ' ' + data.lastName : '')
    const payload: CheckoutPayload = {
      paymentMethod: data.paymentMethod,
      billing: {
        firstName: data.firstName,
        lastName:  data.lastName ?? '',
        address1:  data.address,
        city:      data.city,
        country:   'BY',
        email:     data.email,
        phone:     data.phone,
      },
      customerNote: data.comment,
    }

    const { order, redirect, error } = await placeOrder(
      items.map(i => ({ id: i.id, quantity: i.quantity })),
      payload,
    )

    if (error || !order) {
      setSubmitError(error ?? 'Не удалось оформить заказ')
      return
    }

    // Чистим локальную корзину — серверная уже стала ордером.
    clearCart()

    // Если гейтвей вернул URL онлайн-оплаты — отправляем туда.
    if (redirect) {
      window.location.href = redirect
      return
    }

    // Иначе — страница успеха.
    router.push(`/order/${order.databaseId}?total=${encodeURIComponent(order.total)}&number=${encodeURIComponent(order.orderNumber)}`)
    void fullName
  }

  if (!hydrated) {
    return (
      <div className="bg-[#F7F8FB] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-96 rounded-2xl bg-white animate-pulse" aria-hidden="true" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return null // редирект уже запущен в useEffect
  }

  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Корзина', href: '/cart' },
            { label: 'Оформление' },
          ]}
          className="mb-6"
        />

        <h1
          className="text-2xl sm:text-3xl font-extrabold text-[#1A1F36] mb-6"
          style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
        >
          Оформление заказа
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forms */}
          <div className="lg:col-span-2 space-y-4">

            {/* Контакты */}
            <fieldset className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
              <legend
                className="px-2 text-sm font-bold text-[#1A1F36]"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
              >
                1. Ваши данные
              </legend>

              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field id="co-firstname" label="Имя" required error={errors.firstName?.message}>
                  <input
                    id="co-firstname"
                    type="text"
                    autoComplete="given-name"
                    {...register('firstName')}
                    placeholder="Иван"
                    className="input"
                  />
                </Field>
                <Field id="co-lastname" label="Фамилия" error={errors.lastName?.message}>
                  <input
                    id="co-lastname"
                    type="text"
                    autoComplete="family-name"
                    {...register('lastName')}
                    placeholder="Иванов"
                    className="input"
                  />
                </Field>
                <Field id="co-phone" label="Телефон" required error={errors.phone?.message}>
                  <input
                    id="co-phone"
                    type="tel"
                    autoComplete="tel"
                    {...register('phone')}
                    placeholder="+375 (29) 000-00-00"
                    className="input"
                  />
                </Field>
                <Field id="co-email" label="E-mail" required error={errors.email?.message}>
                  <input
                    id="co-email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    placeholder="ivan@example.com"
                    className="input"
                  />
                </Field>
              </div>
            </fieldset>

            {/* Доставка */}
            <fieldset className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
              <legend
                className="px-2 text-sm font-bold text-[#1A1F36]"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
              >
                2. Доставка
              </legend>

              <div className="space-y-4 mt-4">
                <Field id="co-city" label="Город" required error={errors.city?.message}>
                  <input
                    id="co-city"
                    type="text"
                    autoComplete="address-level2"
                    {...register('city')}
                    placeholder="Минск"
                    className="input"
                  />
                </Field>
                <Field id="co-address" label="Улица, дом, квартира" required error={errors.address?.message}>
                  <input
                    id="co-address"
                    type="text"
                    autoComplete="street-address"
                    {...register('address')}
                    placeholder="ул. Примерная, 12, кв. 3"
                    className="input"
                  />
                </Field>
                <Field id="co-comment" label="Комментарий курьеру" error={errors.comment?.message}>
                  <textarea
                    id="co-comment"
                    rows={2}
                    {...register('comment')}
                    placeholder="Код от подъезда, время доставки и т.п."
                    className="input resize-none"
                  />
                </Field>
                <p className="text-xs text-[#1A1F36]/55">
                  {delivery === 0
                    ? '✅ Доставка по Беларуси — бесплатно (заказ от 50 руб.)'
                    : `Доставка по Беларуси — ${formatPrice(delivery)} (бесплатно от 50 руб.)`}
                </p>
              </div>
            </fieldset>

            {/* Оплата */}
            <fieldset className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
              <legend
                className="px-2 text-sm font-bold text-[#1A1F36]"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
              >
                3. Оплата
              </legend>

              <label className="flex items-start gap-3 mt-4 cursor-pointer p-3 rounded-xl border-2 border-[#2B4DD6] bg-[#EEF2FF]">
                <input
                  type="radio"
                  value="cod"
                  defaultChecked
                  {...register('paymentMethod')}
                  className="mt-1 accent-[#2B4DD6]"
                />
                <span>
                  <span className="block font-semibold text-[#1A1F36]">Оплата при получении</span>
                  <span className="block text-xs text-[#1A1F36]/55 mt-0.5">
                    Наличными или картой курьеру при доставке
                  </span>
                </span>
              </label>
              {/* Когда подключите онлайн-гейтвей в Woo, добавьте сюда ещё один <label> с
                  value={'stripe' | 'bepaid' | 'webpay'} — фронт ничего больше менять не надо. */}
            </fieldset>

            {/* Согласие */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('consent')}
                  className="mt-1 w-4 h-4 accent-[#2B4DD6]"
                />
                <span className="text-sm text-[#1A1F36]/75 leading-relaxed">
                  Согласен с{' '}
                  <Link href="/privacy" className="text-[#2B4DD6] underline">
                    политикой конфиденциальности
                  </Link>{' '}
                  и{' '}
                  <Link href="/terms" className="text-[#2B4DD6] underline">
                    условиями оферты
                  </Link>
                </span>
              </label>
              {errors.consent && (
                <p role="alert" className="mt-2 text-xs text-[#ef4444]">
                  {errors.consent.message}
                </p>
              )}
            </div>
          </div>

          {/* Order summary */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sticky top-24">
              <h2
                className="font-extrabold text-[#1A1F36] text-lg mb-5 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
              >
                <ShoppingBag size={20} className="text-[#2B4DD6]" />
                Ваш заказ
              </h2>

              <ul className="space-y-3 mb-5 max-h-72 overflow-auto pr-1">
                {items.map(item => (
                  <li key={item.id} className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 flex-none rounded-lg overflow-hidden bg-[#F7F8FB] border border-[#e2e8f0]">
                      <Image
                        src={item.image ?? '/images/placeholder-product.svg'}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1A1F36] line-clamp-2 leading-snug">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#1A1F36]/55 mt-0.5">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[#1A1F36] flex-none">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 text-sm border-t border-[#e2e8f0] pt-4">
                <div className="flex justify-between">
                  <span className="text-[#1A1F36]/60">Товары ({totalItems} шт.)</span>
                  <span className="font-semibold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1A1F36]/60">Доставка</span>
                  <span className="font-semibold">
                    {delivery === 0 ? <span className="text-[#22c55e]">Бесплатно</span> : formatPrice(delivery)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-[#e2e8f0]">
                  <span>К оплате</span>
                  <span className="text-[#2B4DD6]">{formatPrice(orderTotal)}</span>
                </div>
              </div>

              {submitError && (
                <div role="alert" className="mt-4 rounded-xl px-4 py-3 text-sm bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444]">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-5 flex items-center justify-center gap-2 rounded-xl py-4 font-semibold text-white text-base transition-all hover:bg-[#1e3ab8] hover:shadow-lg hover:-translate-y-px disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-[#2B4DD6]"
                style={{ background: '#2B4DD6' }}
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                Подтвердить заказ
                {!isSubmitting && <ArrowRight size={18} />}
              </button>
            </div>
          </aside>
        </form>
      </div>

      {/* Локальный «утилитарный» style для инпутов — чтобы не дублировать className */}
      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #1A1F36;
          background: #fff;
          border: 1px solid #e2e8f0;
          transition: border-color 0.15s ease;
        }
        :global(.input::placeholder) {
          color: rgba(26, 31, 54, 0.4);
        }
        :global(.input:focus) {
          outline: none;
          border-color: #2B4DD6;
        }
      `}</style>
    </div>
  )
}

function Field({
  id, label, required, error, children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#1A1F36] mb-1.5">
        {label} {required && <span className="text-[#FF8A3D]" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <p role="alert" className="mt-1 text-xs text-[#ef4444]">{error}</p>}
    </div>
  )
}
