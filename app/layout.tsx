import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reading List',
  description: 'Save and manage your reading list offline',
  manifest: '/manifest.json',
  themeColor: '#4f46e5',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
