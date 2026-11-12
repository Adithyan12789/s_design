import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ADMIN_SESSION_COOKIE,
  getAdminAccessCodeConfig,
  verifyAdminSessionToken,
} from '@/lib/auth/session'
import { getPublicSiteData } from '@/lib/cms/queries'
import { LoginForm } from '@/components/admin/login-form'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  const config = getAdminAccessCodeConfig()

  if (config.isConfigured) {
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
    const session = await verifyAdminSessionToken(token)
    if (session) {
      redirect('/admin')
    }
  }

  const siteData = await getPublicSiteData()

  return (
    <LoginForm
      isConfigured={config.isConfigured}
      configError={config.error}
      studioName={siteData.settings.studioName}
      studioSubtitle={siteData.settings.studioSubtitle}
      lightLogoUrl={siteData.settings.lightLogoUrl}
    />
  )
}
