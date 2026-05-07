import type { Metadata } from 'next'
import { fetchPage } from '@/lib/wp-api'
import WPArticle from '@/components/common/WPArticle'

const FALLBACK = `
<p>Содержимое политики конфиденциальности появится после того, как администратор создаст
WP-страницу со слагом <strong>privacy</strong> в WordPress-админке.</p>
<p>В админке: <em>Pages → Add New</em> → заголовок «Политика конфиденциальности» →
в блоке Permalink укажите slug <code>privacy</code> → опубликовать.</p>
`

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage('privacy')
  return {
    title: page?.title || 'Политика конфиденциальности',
    description: 'Политика обработки персональных данных интернет-магазина КанцМир.',
  }
}

export default async function PrivacyPage() {
  const page = await fetchPage('privacy')
  return (
    <WPArticle
      title={page?.title || 'Политика конфиденциальности'}
      breadcrumbLabel="Политика конфиденциальности"
      html={page?.content || FALLBACK}
    />
  )
}
