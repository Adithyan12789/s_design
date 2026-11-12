import { NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminAccessCodeConfig,
  getAdminCookieOptions,
  isHttpsRequest,
  verifyAdminAccessCode,
} from '@/lib/auth/session'
import {
  checkLoginRateLimit,
  clearLoginAttempts,
  getClientIdentifier,
  recordFailedLoginAttempt,
} from '@/lib/auth/rate-limit'
import { isSameOriginRequest } from '@/lib/auth/require-admin'
import { logAdminActivity } from '@/lib/cms/queries'
import { getMongoDb } from '@/lib/mongodb/client'

export async function POST(request: Request) {
  const sameOrigin = await isSameOriginRequest()
  if (!sameOrigin) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const config = getAdminAccessCodeConfig()
  if (!config.isConfigured) {
    return NextResponse.json(
      { error: config.error || 'ADMIN_ACCESS_CODE is not configured on the server.' },
      { status: 503 }
    )
  }

  const clientId = getClientIdentifier(request)
  const limit = checkLoginRateLimit(clientId)
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Too many failed attempts. Please try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).`,
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      }
    )
  }

  let submittedCode = ''
  try {
    const body = await request.json()
    submittedCode = typeof body?.code === 'string' ? body.code.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 })
  }

  if (!/^\d{6}$/.test(submittedCode)) {
    return NextResponse.json(
      { error: 'Please enter a valid 6-digit security code.' },
      { status: 400 }
    )
  }

  const isValid = await verifyAdminAccessCode(submittedCode)
  if (!isValid) {
    const result = recordFailedLoginAttempt(clientId)
    if (result.locked) {
      return NextResponse.json(
        {
          error: `Too many incorrect attempts. Access temporarily locked for ${Math.ceil(result.retryAfterSeconds / 60)} minute(s).`,
          retryAfterSeconds: result.retryAfterSeconds,
          remainingAttempts: 0,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(result.retryAfterSeconds) },
        }
      )
    }

    return NextResponse.json(
      {
        error: `Invalid security code. ${result.remainingAttempts} attempt${result.remainingAttempts === 1 ? '' : 's'} remaining.`,
        remainingAttempts: result.remainingAttempts,
      },
      { status: 401 }
    )
  }

  clearLoginAttempts(clientId)
  const token = await createAdminSessionToken()
  const db = await getMongoDb()
  if (db) {
    const now = new Date().toISOString()
    await db.collection('admins').updateOne(
      { _id: 'studio-admin' as unknown as never },
      {
        $set: {
          role: 'admin',
          status: 'active',
          authMode: 'six-digit-access-code',
          lastLoginAt: now,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    )
  }
  await logAdminActivity('Studio Administrator', 'signed in', 'session', 'Admin Access')

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, token, getAdminCookieOptions(isHttpsRequest(request)))
  return response
}

