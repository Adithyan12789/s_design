import { NextResponse, type NextRequest } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  getAdminAccessCodeConfig,
  verifyAdminSessionToken,
} from '@/lib/auth/session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname === '/admin/login' ||
    pathname === '/api/admin/auth/login' ||
    pathname === '/api/admin/auth/logout'
  ) {
    return NextResponse.next()
  }

  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')

  if (!isAdminRoute && !isAdminApi) {
    return NextResponse.next()
  }

  const config = getAdminAccessCodeConfig()
  if (!config.isConfigured) {
    if (isAdminApi) {
      return NextResponse.json(
        { error: config.error || 'ADMIN_ACCESS_CODE is not configured.' },
        { status: 503 }
      )
    }
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    return NextResponse.redirect(loginUrl)
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const session = await verifyAdminSessionToken(token)

  if (!session) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
