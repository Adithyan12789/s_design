import { NextResponse } from 'next/server'
import { withAdminDb } from '@/lib/cms/api-helpers'
import { logAdminActivity, revalidatePublicSite } from '@/lib/cms/queries'

export async function GET() {
  const { db, errorResponse } = await withAdminDb()
  if (errorResponse || !db) return errorResponse!

  const doc = await db.collection('studio').findOne({ _id: 'default' as unknown as never })
  if (!doc) return NextResponse.json({ studio: null })
  const { _id, ...studio } = doc
  void _id
  return NextResponse.json({ studio })
}

export async function PATCH(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()
  const now = new Date().toISOString()

  const payload = {
    kicker: String(body.kicker ?? 'Studio note'),
    heading: String(body.heading ?? ''),
    accentHeading: String(body.accentHeading ?? ''),
    introText: String(body.introText ?? ''),
    description: String(body.description ?? ''),
    philosophy: String(body.philosophy ?? ''),
    vision: String(body.vision ?? ''),
    mission: String(body.mission ?? ''),
    history: String(body.history ?? ''),
    studioImages: Array.isArray(body.studioImages) ? body.studioImages.map(String) : [],
    studioImage: String(
      body.studioImage || (Array.isArray(body.studioImages) && body.studioImages[0]) || ''
    ),
    teamMembers: Array.isArray(body.teamMembers) ? body.teamMembers : [],
    extraSections: Array.isArray(body.extraSections) ? body.extraSections : [],
    updatedAt: now,
  }

  const result = await db.collection('studio').findOneAndUpdate(
    { _id: 'default' as unknown as never },
    { $set: payload, $setOnInsert: { createdAt: now } },
    { upsert: true, returnDocument: 'after' }
  )

  await logAdminActivity(actor.email, 'updated', 'studio', 'About Studio')
  revalidatePublicSite()

  return NextResponse.json({ studio: payload })
}
