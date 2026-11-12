import { NextResponse } from 'next/server'
import { withAdminDb } from '@/lib/cms/api-helpers'
import { logAdminActivity, revalidatePublicSite } from '@/lib/cms/queries'

export async function GET() {
  const { db, errorResponse } = await withAdminDb()
  if (errorResponse || !db) return errorResponse!

  const doc = await db.collection('websiteSettings').findOne({ _id: 'default' as unknown as never })
  if (!doc) return NextResponse.json({ settings: null })
  const { _id, ...settings } = doc
  void _id
  return NextResponse.json({ settings })
}

export async function PATCH(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()
  const now = new Date().toISOString()

  const payload = {
    studioName: String(body.studioName ?? 'S_DE_SIGN'),
    studioSubtitle: String(body.studioSubtitle ?? 'ARCHITECTURE / STUDIO'),
    tagline: String(body.tagline ?? 'Architecture / Objects'),
    mainLogoUrl: String(body.mainLogoUrl ?? '/s-design-emblem-white.png'),
    altLogoUrl: String(body.altLogoUrl ?? '/s-design-emblem-clean.png'),
    lightLogoUrl: String(body.lightLogoUrl ?? '/s-design-emblem-white.png'),
    darkLogoUrl: String(body.darkLogoUrl ?? '/s-design-emblem-clean.png'),
    faviconUrl: String(body.faviconUrl ?? '/s-design-logo.jpg'),
    footerLogoUrl: String(body.footerLogoUrl ?? '/s-design-emblem-white.png'),
    brandColors: body.brandColors && typeof body.brandColors === 'object'
      ? body.brandColors
      : {
          ivory: '#faf8f5',
          paper: '#f1eee7',
          ink: '#151412',
          bronze: '#b68d54',
          bronzeLight: '#d9b686',
        },
    typography: body.typography && typeof body.typography === 'object'
      ? body.typography
      : { display: 'Cormorant Garamond', body: 'Plus Jakarta Sans' },
    email: String(body.email ?? 'hello@sdesigns.studio'),
    phone: String(body.phone ?? ''),
    whatsapp: String(body.whatsapp ?? ''),
    officeAddress: String(body.officeAddress ?? 'Lisbon · Portugal'),
    mapsUrl: String(body.mapsUrl ?? ''),
    businessHours: String(body.businessHours ?? ''),
    instagramUrl: String(body.instagramUrl ?? ''),
    facebookUrl: String(body.facebookUrl ?? ''),
    pinterestUrl: String(body.pinterestUrl ?? ''),
    linkedinUrl: String(body.linkedinUrl ?? ''),
    otherSocials: Array.isArray(body.otherSocials) ? body.otherSocials : [],
    footerCopyright: String(body.footerCopyright ?? '© 2024 S_Designs'),
    updatedAt: now,
  }

  const result = await db.collection('websiteSettings').findOneAndUpdate(
    { _id: 'default' as unknown as never },
    { $set: payload, $setOnInsert: { createdAt: now } },
    { upsert: true, returnDocument: 'after' }
  )

  await logAdminActivity(actor.email, 'updated', 'settings', 'Website Branding & Contact')
  revalidatePublicSite()

  return NextResponse.json({ settings: payload })
}
