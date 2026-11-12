import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin'
import { getMongoDb } from '@/lib/mongodb/client'

export async function withAdminDb() {
  const auth = await requireAdminApi()
  if (auth.errorResponse) {
    return { actor: null, db: null, errorResponse: auth.errorResponse }
  }
  const db = await getMongoDb()
  if (!db) {
    return {
      actor: null,
      db: null,
      errorResponse: NextResponse.json(
        { error: 'MongoDB Atlas is not configured or unreachable (check MONGODB_URI).' },
        { status: 503 }
      ),
    }
  }
  return { actor: auth.actor, db, errorResponse: null }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
