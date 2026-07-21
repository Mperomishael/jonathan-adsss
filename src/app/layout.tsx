import type { Metadata, Viewport } from 'next'
import './globals.css'
import { UserAuthProvider } from '@/components/user/UserAuthProvider'
import FloatingChat from '@/components/FloatingChat'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: 'Jonathan Roumie World – Official Website',
  description:
    'The official website of Jonathan Roumie. News, shop, gallery, clips and more.',
  openGraph: {
    title: 'Jonathan Roumie World',
    description: 'Official Jonathan Roumie Website',
    type: 'website',
    url: 'https://jonathan-roumie.com',
    images: [
      {
        url: '/images/hero/18d4b710-e20d-4e9a-b966-9e792a5523df.jpeg',
        width: 1200,
        height: 630,
        alt: 'Jonathan Roumie Official',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <UserAuthProvider>
          {children}
          <FloatingChat />
        </UserAuthProvider>
      </body>
    </html>
  )
}
