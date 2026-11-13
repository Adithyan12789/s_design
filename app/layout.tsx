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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const data = await getPublicSiteData()
  const { brandColors, typography } = data.settings

  const bodyStyle: Record<string, string> = {}
  if (brandColors?.ivory) bodyStyle['--ivory'] = brandColors.ivory
  if (brandColors?.paper) bodyStyle['--paper'] = brandColors.paper
  if (brandColors?.ink) bodyStyle['--ink'] = brandColors.ink
  if (brandColors?.bronze) bodyStyle['--bronze'] = brandColors.bronze
  if (brandColors?.bronzeLight) bodyStyle['--bronze-light'] = brandColors.bronzeLight
  if (typography?.heroTitleSize) bodyStyle['--font-size-hero-title'] = typography.heroTitleSize
  if (typography?.heroSubtitleSize) bodyStyle['--font-size-hero-subtitle'] = typography.heroSubtitleSize
  if (typography?.studioHeadingSize) bodyStyle['--font-size-studio-heading'] = typography.studioHeadingSize
  if (typography?.studioBodySize) bodyStyle['--font-size-studio-body'] = typography.studioBodySize
  if (typography?.workTitleSize) bodyStyle['--font-size-work-title'] = typography.workTitleSize
  if (typography?.workDescSize) bodyStyle['--font-size-work-desc'] = typography.workDescSize
  if (typography?.workDescGap) bodyStyle['--gap-work-desc'] = typography.workDescGap
  if (typography?.workSlideGap) bodyStyle['--gap-work-slide'] = typography.workSlideGap
  if (typography?.workImageScale) bodyStyle['--scale-work-image'] = typography.workImageScale
  if (typography?.approachHeadingSize) bodyStyle['--font-size-approach-heading'] = typography.approachHeadingSize
  if (typography?.approachBodySize) bodyStyle['--font-size-approach-body'] = typography.approachBodySize
  if (typography?.servicesTitleSize) bodyStyle['--font-size-services-title'] = typography.servicesTitleSize
  if (typography?.reviewsHeadingSize) bodyStyle['--font-size-reviews-heading'] = typography.reviewsHeadingSize
  if (typography?.reviewsClientHeadingSize) bodyStyle['--font-size-reviews-client'] = typography.reviewsClientHeadingSize
  if (typography?.reviewsDescSize) bodyStyle['--font-size-reviews-desc'] = typography.reviewsDescSize
  if (typography?.reviewsCenterCardScale) bodyStyle['--scale-reviews-card'] = typography.reviewsCenterCardScale
  if (typography?.contactHeadingSize) bodyStyle['--font-size-contact-heading'] = typography.contactHeadingSize
  if (typography?.contactBodySize) bodyStyle['--font-size-contact-body'] = typography.contactBodySize
  if (typography?.kickerSize) bodyStyle['--font-size-kicker'] = typography.kickerSize

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={bodyStyle as React.CSSProperties}>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
