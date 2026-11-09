import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'S_Designs — Architecture / Objects',
  description: 'S_Designs is an independent architecture studio creating quiet, considered spaces for living, working and gathering.',
  generator: 'v0.app',
  openGraph: { title: 'S_Designs — Architecture / Objects', description: 'Independent architecture studio · Portugal / Worldwide', type: 'website' },
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f1eee7', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
