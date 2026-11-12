import { requireAdminPage } from '@/lib/auth/require-admin'
import { getAdminOverviewData } from '@/lib/cms/queries'
import { AdminDashboardShell } from '@/components/admin/admin-dashboard-shell'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const actor = await requireAdminPage()
  const data = await getAdminOverviewData()

  return <AdminDashboardShell actor={actor} initialData={data} />
}

