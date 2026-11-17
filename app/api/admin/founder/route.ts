import { NextResponse } from 'next/server'
import { withAdminDb } from '@/lib/cms/api-helpers'
import { logAdminActivity, revalidatePublicSite } from '@/lib/cms/queries'
import { DEFAULT_FOUNDER_INFO } from '@/lib/cms/defaults'
import type { CmsFounderInfo } from '@/lib/cms/types'

export async function GET() {
  const { db, errorResponse } = await withAdminDb()
  if (errorResponse || !db) return errorResponse!

  const doc = await db.collection('studio').findOne({ _id: 'default' as unknown as never })
  const founder: CmsFounderInfo = (doc as { founder?: CmsFounderInfo } | null)?.founder || DEFAULT_FOUNDER_INFO
  return NextResponse.json({ founder })
}

export async function PATCH(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()
  const now = new Date().toISOString()

  const stats = Array.isArray(body.stats)
    ? body.stats.map((s: { value?: string; label?: string; detail?: string }) => ({
        value: String(s.value || '').trim(),
        label: String(s.label || '').trim(),
        detail: String(s.detail || '').trim(),
      }))
    : DEFAULT_FOUNDER_INFO.stats

  const payload: CmsFounderInfo = {
    visible: body.visible !== false,
    displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : 6,
    kicker: String(body.kicker ?? '( 06 )').trim(),
    label: String(body.label ?? 'THE FOUNDER').trim(),
    heading: String(body.heading ?? 'Behind the Vision').trim(),
    founderName: String(body.founderName ?? '[Founder Name]').trim(),
    founderRole: String(body.founderRole ?? '[Principal Architect & Founder]').trim(),
    founderPhoto: String(body.founderPhoto ?? '').trim(),
    founderBio: String(body.founderBio ?? '').trim(),
    philosophy: String(body.philosophy ?? '').trim(),
    quote: String(body.quote ?? '').trim(),
    stats,
    showStats: Boolean(body.showStats),
    buttonText: String(body.buttonText ?? 'Our Philosophy').trim(),
    buttonHref: String(body.buttonHref ?? '#studio').trim(),
    showButton: Boolean(body.showButton),
    illustrationUrl: String(body.illustrationUrl ?? '').trim(),
    showIllustration: Boolean(body.showIllustration),
  }

  const primaryTeamMember = {
    id: 'founder-primary',
    name: payload.founderName,
    role: payload.founderRole,
    bio: payload.founderBio,
    photoUrl: payload.founderPhoto,
  }

  await db.collection('studio').updateOne(
    { _id: 'default' as unknown as never },
    {
      $set: {
        founder: payload,
        philosophy: payload.philosophy || payload.quote,
        'teamMembers.0': primaryTeamMember,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  )

  await logAdminActivity(actor.email, 'updated', 'founder', payload.founderName || 'The Founder')
  revalidatePublicSite()

  return NextResponse.json({ founder: payload })
}
