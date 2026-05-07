import type { Metadata } from 'next'
import { fetchPage } from '@/lib/wp-api'
import WPArticle from '@/components/common/WPArticle'

const FALLBACK = `
<p>Содержимое пользовательского соглашения появится после того, как администратор создаст
WP-страницу со слагом <strong>terms</strong> в WordPress-админке.</p>
<p>В админке: <em>Pages → Add New</em> → заголовок «Пользовательское соглашение» →
в блоке Permalink укажите slug <code>terms</code> → опубликовать.</p>
`

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage('terms')
  return {
    title: page?.title || 'Пользовательское соглашение',
    description: 'Условия использования сайта и публичная оферта.',
  }
}

export default async function TermsPage() {
  const page = await fetchPage('terms')
  return (
    <WPArticle
      title={page?.title || 'Пользовательское соглашение'}
      breadcrumbLabel="Пользовательское соглашение"
      html={page?.content || FALLBACK}
    />
  )
}
