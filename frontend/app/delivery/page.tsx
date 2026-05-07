import type { Metadata } from 'next'
import { fetchDeliveryContent, fetchPage } from '@/lib/wp-api'
import WPArticle from '@/components/common/WPArticle'

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage('delivery')
  return {
    title: page?.title || 'Доставка и оплата',
    description: 'Условия доставки по Минску и всей Беларуси, способы оплаты.',
  }
}

export default async function DeliveryPage() {
  // Тот же источник, что в табе «Доставка и оплата» на странице товара.
  // Если WP-страницы со слагом `delivery` нет — fetchDeliveryContent отдаст
  // встроенный fallback.
  const [page, content] = await Promise.all([
    fetchPage('delivery'),
    fetchDeliveryContent(),
  ])

  return (
    <WPArticle
      title={page?.title || 'Доставка и оплата'}
      breadcrumbLabel="Доставка и оплата"
      html={content}
    />
  )
}
