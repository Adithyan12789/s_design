import { getPublicSiteData } from '@/lib/cms/queries'
import { HomeClient } from '@/components/home-client'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const siteData = await getPublicSiteData()
  return <HomeClient siteData={siteData} />
}
