import { NextResponse } from 'next/server'
import { withAdminDb } from '@/lib/cms/api-helpers'
import { logAdminActivity, revalidatePublicSite } from '@/lib/cms/queries'

export async function GET() {
  const { db, errorResponse } = await withAdminDb()
  if (errorResponse || !db) return errorResponse!

  const doc = await db.collection('homepage').findOne({ _id: 'default' as unknown as never })
  if (!doc) return NextResponse.json({ homepage: null })
  const { _id, ...homepage } = doc
  void _id
  return NextResponse.json({ homepage })
}

export async function PATCH(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()
  const now = new Date().toISOString()

  const payload = {
    heroEyebrow: String(body.heroEyebrow ?? ''),
    heroTitleLine1: String(body.heroTitleLine1 ?? ''),
    heroTitleLine2: String(body.heroTitleLine2 ?? ''),
    heroDescription: String(body.heroDescription ?? ''),
    heroImageUrl: String(body.heroImageUrl ?? ''),
    heroIndexText: String(body.heroIndexText ?? '01 / 04'),
    heroStudioName: String(body.heroStudioName ?? 'S_DE_SIGN'),
    heroStudioSubtitle: String(body.heroStudioSubtitle ?? ''),
    selectedWorkKicker: String(body.selectedWorkKicker ?? ''),
    selectedWorkHeading: String(body.selectedWorkHeading ?? ''),
    approachKicker: String(body.approachKicker ?? ''),
    approachHeading1: String(body.approachHeading1 ?? ''),
    approachHeading2: String(body.approachHeading2 ?? ''),
    approachDescription: String(body.approachDescription ?? ''),
    approachImageUrl: String(body.approachImageUrl ?? ''),
    initiateKicker: String(body.initiateKicker ?? ''),
    initiateHeading: String(body.initiateHeading ?? ''),
    initiateSubtitle: String(body.initiateSubtitle ?? ''),
    initiateDescription: String(body.initiateDescription ?? ''),
    initiateCtaLabel: String(body.initiateCtaLabel ?? ''),
    initiateCtaHref: String(body.initiateCtaHref ?? '#contact'),
    servicesKicker: String(body.servicesKicker ?? ''),
    servicesNote: String(body.servicesNote ?? ''),
    reviewsKicker: String(body.reviewsKicker ?? ''),
    reviewsHeading1: String(body.reviewsHeading1 ?? ''),
    reviewsHeading2: String(body.reviewsHeading2 ?? ''),
    contactKicker: String(body.contactKicker ?? ''),
    contactHeading1: String(body.contactHeading1 ?? ''),
    contactHeading2: String(body.contactHeading2 ?? ''),
    contactDescription: String(body.contactDescription ?? ''),
    updatedAt: now,
  }

  const result = await db.collection('homepage').findOneAndUpdate(
    { _id: 'default' as unknown as never },
    { $set: payload, $setOnInsert: { createdAt: now } },
    { upsert: true, returnDocument: 'after' }
  )

  await logAdminActivity(actor.email, 'updated', 'homepage', 'Homepage Content')
  revalidatePublicSite()

  return NextResponse.json({ homepage: payload })
}
