import type { Metadata } from 'next'
import { fetchContacts } from '@/lib/wp-api'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ContactsSection from '@/components/features/ContactsSection'

export const metadata: Metadata = {
  title: 'Контакты — КанцМир',
  description: 'Контакты интернет-магазина КанцМир: адрес, телефоны, e-mail, график работы.',
}

export default async function ContactsPage() {
  const contacts = await fetchContacts()

  return (
    <div className="bg-[#F7F8FB] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Контакты' },
          ]}
          className="mb-8"
        />
        <ContactsSection content={contacts} />
      </div>
    </div>
  )
}
