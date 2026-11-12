import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin'

export async function GET() {
  const { actor, errorResponse } = await requireAdminApi()
  if (errorResponse || !actor) return errorResponse!

  return NextResponse.json({ actor })
}
