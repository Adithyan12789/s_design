import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  getAdminAccessCodeConfig,
  verifyAdminSessionToken,
} from '@/lib/auth/session'

export type AdminActor = {
  id: string
  email: string
  fullName: string
  role: string
}

const DEFAULT_ADMIN_ACTOR: AdminActor = {
  id: 'studio-admin',
  email: 'Studio Administrator',
  fullName: 'Studio Administrator',
  role: 'admin',
}

async function resolveAdminSession(): Promise<{
  actor: AdminActor | null
  reason: 'unconfigured' | 'unauthenticated' | null
}> {
  const config = getAdminAccessCodeConfig()
  if (!config.isConfigured) {
    return { actor: null, reason: 'unconfigured' }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  const payload = await verifyAdminSessionToken(token)

  if (!payload) {
    return { actor: null, reason: 'unauthenticated' }
  }

  return { actor: DEFAULT_ADMIN_ACTOR, reason: null }
}

export async function isSameOriginRequest(): Promise<boolean> {
  const hdrs = await headers()
  const origin = hdrs.get('origin')
  if (!origin) return true

  const host = hdrs.get('x-forwarded-host') || hdrs.get('host')
  if (!host) return true

  try {
    const originHost = new URL(origin).host
    return originHost === host
  } catch {
    return false
  }
}

export async function requireAdminPage(): Promise<AdminActor> {
  const { actor } = await resolveAdminSession()
  if (!actor) {
    redirect('/admin/login')
  }
  return actor
}

export async function requireAdminApi(): Promise<{
  actor: AdminActor | null
  errorResponse: NextResponse | null
}> {
  const sameOrigin = await isSameOriginRequest()
  if (!sameOrigin) {
    return {
      actor: null,
      errorResponse: NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 }),
    }
  }

  const { actor, reason } = await resolveAdminSession()
  if (!actor) {
    if (reason === 'unconfigured') {
      return {
        actor: null,
        errorResponse: NextResponse.json(
          { error: 'ADMIN_ACCESS_CODE is not configured on the server.' },
          { status: 503 }
        ),
      }
    }
    return {
      actor: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { actor, errorResponse: null }
}
