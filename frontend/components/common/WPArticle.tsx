import Breadcrumb from '@/components/ui/Breadcrumb'

interface Props {
  /** WP-HTML контент. Уже прошёл через `wp_kses` на стороне Woo/WP. */
  html: string
  /** Заголовок H1 страницы. */
  title: string
  /** Короткое описание под заголовком (необязательно). */
  lead?: string
  /** Хлебные крошки до этой страницы. */
  breadcrumbLabel: string
}

/**
 * Базовый layout для страниц, чей контент редактируется в WP-админке.
 * Унифицированная типографика через `prose-kantsmir`, чтобы заголовки,
 * списки, ссылки выглядели в стиле сайта.
 */
export default function WPArticle({ html, title, lead, breadcrumbLabel }: Props) {
  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Главная', href: '/' },
            { label: breadcrumbLabel },
          ]}
          className="mb-6"
        />

        <article className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-10">
          <h1
            className="text-3xl sm:text-4xl font-extrabold text-[#1A1F36] mb-4"
            style={{ fontFamily: 'var(--font-manrope-var), Manrope, sans-serif' }}
          >
            {title}
          </h1>
          {lead && (
            <p className="text-[#1A1F36]/65 text-base mb-8 leading-relaxed">{lead}</p>
          )}
          <div
            className="prose prose-kantsmir max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
    </div>
  )
}
