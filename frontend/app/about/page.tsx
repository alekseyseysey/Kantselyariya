import type { Metadata } from 'next'
import { fetchPage } from '@/lib/wp-api'
import WPArticle from '@/components/common/WPArticle'

const FALLBACK = `
<h2>О компании КанцМир</h2>
<p>Мы — интернет-магазин канцелярских товаров в Беларуси. Более 10 лет помогаем
школьникам, студентам, художникам и офисам находить всё необходимое по доступным ценам.</p>
<p><em>Полный текст «О компании» редактируется в WP-админке: создайте страницу
со слагом <strong>about</strong>.</em></p>
`

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage('about')
  return {
    title: page?.title || 'О компании',
    description: 'История, принципы и команда интернет-магазина КанцМир.',
  }
}

export default async function AboutPage() {
  const page = await fetchPage('about')
  return (
    <WPArticle
      title={page?.title || 'О компании'}
      breadcrumbLabel="О компании"
      html={page?.content || FALLBACK}
    />
  )
}
