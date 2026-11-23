import { preload } from 'react-dom'
import { getPublicSiteData } from '@/lib/cms/queries'
import { HomeClient } from '@/components/home-client'
import { getOptimizedImageUrl } from '@/lib/storage/image-optimization'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Page() {
  const siteData = await getPublicSiteData()
  const isVideoHero = siteData.homepage.heroMediaType === 'video' && Boolean(siteData.homepage.heroVideoUrl?.trim())
  const rawLcpUrl = isVideoHero
    ? (siteData.homepage.heroPosterUrl || siteData.homepage.heroImageUrl)
    : siteData.homepage.heroImageUrl

  const heroPreloadUrl = rawLcpUrl ? getOptimizedImageUrl(rawLcpUrl, { width: 1920, quality: 'auto' }) : ''
  if (heroPreloadUrl) {
    preload(heroPreloadUrl, { as: 'image', fetchPriority: 'high' })
  }

  return <HomeClient siteData={siteData} />
}
