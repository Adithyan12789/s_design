import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, isHttpsRequest } from '@/lib/auth/session'
import { isSameOriginRequest } from '@/lib/auth/require-admin'

export async function POST(request: Request) {
  const sameOrigin = await isSameOriginRequest()
  if (!sameOrigin) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttpsRequest(request),
    path: '/',
    maxAge: 0,
  })
  return response
}

