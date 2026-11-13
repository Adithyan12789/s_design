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
      ? {
          display: String(body.typography.display ?? "Georgia, 'Times New Roman', serif"),
          body: String(body.typography.body ?? 'Arial, Helvetica, sans-serif'),
          heroTitleSize: String(body.typography.heroTitleSize ?? 'clamp(62px, 9.5vw, 145px)'),
          heroSubtitleSize: String(body.typography.heroSubtitleSize ?? '14px'),
          studioHeadingSize: String(body.typography.studioHeadingSize ?? 'clamp(42px, 5.3vw, 78px)'),
          studioBodySize: String(body.typography.studioBodySize ?? '14px'),
          workTitleSize: String(body.typography.workTitleSize ?? 'clamp(25px, 2.4vw, 36px)'),
          workDescSize: String(body.typography.workDescSize ?? 'clamp(13px, 1.05vw, 15px)'),
          workDescGap: String(body.typography.workDescGap ?? 'clamp(32px, 4vw, 56px)'),
          workSlideGap: String(body.typography.workSlideGap ?? 'calc(50vw - 380px)'),
          workImageScale: String(body.typography.workImageScale ?? '1'),
          approachHeadingSize: String(body.typography.approachHeadingSize ?? 'clamp(54px, 6.2vw, 96px)'),
          approachBodySize: String(body.typography.approachBodySize ?? '14px'),
          servicesTitleSize: String(body.typography.servicesTitleSize ?? 'clamp(25px, 3.3vw, 46px)'),
          reviewsHeadingSize: String(body.typography.reviewsHeadingSize ?? 'clamp(36px, 4.8vw, 68px)'),
          reviewsClientHeadingSize: String(body.typography.reviewsClientHeadingSize ?? 'clamp(28px, 3.8vw, 54px)'),
          reviewsDescSize: String(body.typography.reviewsDescSize ?? '14.5px'),
          reviewsCenterCardScale: String(body.typography.reviewsCenterCardScale ?? '1'),
          contactHeadingSize: String(body.typography.contactHeadingSize ?? 'clamp(62px, 8vw, 118px)'),
          contactBodySize: String(body.typography.contactBodySize ?? '14px'),
          kickerSize: String(body.typography.kickerSize ?? '10px'),
        }
      : {
          display: "Georgia, 'Times New Roman', serif",
          body: 'Arial, Helvetica, sans-serif',
          heroTitleSize: 'clamp(62px, 9.5vw, 145px)',
          heroSubtitleSize: '14px',
          studioHeadingSize: 'clamp(42px, 5.3vw, 78px)',
          studioBodySize: '14px',
          workTitleSize: 'clamp(25px, 2.4vw, 36px)',
          workDescSize: 'clamp(13px, 1.05vw, 15px)',
          workDescGap: 'clamp(32px, 4vw, 56px)',
          workSlideGap: 'calc(50vw - 380px)',
          workImageScale: '1',
          approachHeadingSize: 'clamp(54px, 6.2vw, 96px)',
          approachBodySize: '14px',
          servicesTitleSize: 'clamp(25px, 3.3vw, 46px)',
          reviewsHeadingSize: 'clamp(36px, 4.8vw, 68px)',
          reviewsClientHeadingSize: 'clamp(28px, 3.8vw, 54px)',
          reviewsDescSize: '14.5px',
          reviewsCenterCardScale: '1',
          contactHeadingSize: 'clamp(62px, 8vw, 118px)',
          contactBodySize: '14px',
          kickerSize: '10px',
        },
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
