import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { SmoothScrollProvider } from '@/components/motion/smooth-scroll'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://sdesigns.studio'),
  title: 'S_Designs — Architecture / Objects',
  description: 'S_Designs is an independent architecture studio creating quiet, considered spaces for living, working and gathering.',
  generator: 'v0.app',
  icons: {
    icon: '/s-design-logo.jpg',
    apple: '/s-design-logo.jpg',
  },
  openGraph: {
    title: 'S_Designs — Architecture / Objects',
    description: 'Independent architecture studio · Portugal / Worldwide',
    type: 'website',
    images: ['/s-design-logo.jpg'],
  },
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f1eee7', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
