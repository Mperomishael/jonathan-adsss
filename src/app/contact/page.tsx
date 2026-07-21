import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact – Jonathan Roumie',
  description: 'Business enquiries for Jonathan Roumie. This form is for business use only.',
}

export default function ContactPage() {
  return <ContactClient />
}
