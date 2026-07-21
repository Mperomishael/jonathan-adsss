import type { Metadata } from 'next'
import ShopClient from './ShopClient'

export const metadata: Metadata = {
  title: 'Shop – Jonathan Roumie',
  description: 'Official Licensed Jonathan Roumie Merchandise. Collections and more.',
}

export default function ShopPage() {
  return <ShopClient />
}
