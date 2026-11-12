import { NextResponse } from 'next/server'
import { withAdminDb } from '@/lib/cms/api-helpers'
import { logAdminActivity, revalidatePublicSite } from '@/lib/cms/queries'

export async function GET() {
  const { db, errorResponse } = await withAdminDb()
  if (errorResponse || !db) return errorResponse!

  const docs = await db.collection('seo').find({}).sort({ pageKey: 1 }).toArray()
  const seo = docs.map(({ _id, ...rest }) => {
    void _id
    return rest
  })
  return NextResponse.json({ seo })
}

export async function PATCH(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()
  const pageKey = String(body.pageKey || '').trim()
  if (!pageKey) {
    return NextResponse.json({ error: 'pageKey is required.' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const payload = {
    pageKey,
    seoTitle: String(body.seoTitle ?? ''),
    metaDescription: String(body.metaDescription ?? ''),
    ogImage: String(body.ogImage ?? ''),
    ogTitle: String(body.ogTitle ?? ''),
    ogDescription: String(body.ogDescription ?? ''),
    canonicalUrl: String(body.canonicalUrl ?? ''),
    updatedAt: now,
  }

  const result = await db.collection('seo').findOneAndUpdate(
    { pageKey },
    { $set: payload, $setOnInsert: { createdAt: now } },
    { upsert: true, returnDocument: 'after' }
  )

  await logAdminActivity(actor.email, 'updated', 'seo', pageKey)
  revalidatePublicSite()

  return NextResponse.json({ seo: payload })
}
