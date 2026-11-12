import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { SmoothScrollProvider } from '@/components/motion/smooth-scroll'
import { getPublicSiteData } from '@/lib/cms/queries'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPublicSiteData()
  const homeSeo = data.seo.home
  const title = homeSeo?.seoTitle || `${data.settings.studioName} — ${data.settings.tagline}`
  const description =
    homeSeo?.metaDescription ||
    'S_Designs is an independent architecture studio creating quiet, considered spaces for living, working and gathering.'
  const favicon = data.settings.faviconUrl || '/s-design-logo.jpg'
  const ogImage = homeSeo?.ogImage || favicon

  return {
    metadataBase: new URL('https://sdesigns.studio'),
    title,
    description,
    generator: 'v0.app',
    icons: {
      icon: favicon,
      apple: favicon,
    },
    openGraph: {
      title: homeSeo?.ogTitle || title,
      description: homeSeo?.ogDescription || description,
      type: 'website',
      images: [ogImage],
    },
  }
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
