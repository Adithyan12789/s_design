import { NextResponse } from 'next/server'
import { withAdminDb } from '@/lib/cms/api-helpers'
import { logAdminActivity, revalidatePublicSite } from '@/lib/cms/queries'
import { DEFAULT_CONTACT_BOT_SETTINGS } from '@/lib/cms/defaults'
import type { ContactBotSettings } from '@/lib/cms/types'

function isValidUrl(val: string): boolean {
  if (!val) return true
  try {
    const toTest = val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`
    const url = new URL(toTest)
    return Boolean(url.hostname && url.hostname.includes('.'))
  } catch {
    return false
  }
}

function isValidEmail(val: string): boolean {
  if (!val) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
}

function isValidWhatsApp(val: string): boolean {
  if (!val) return true
  if (val.startsWith('http://') || val.startsWith('https://')) {
    return isValidUrl(val)
  }
  // Phone number format: optional leading +, digits, spaces, dashes, parentheses (at least 6 digits)
  const digits = val.replace(/[^0-9]/g, '')
  return digits.length >= 6
}

function sanitizeUrl(val: string): string {
  const trimmed = val.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('#')) {
    return trimmed
  }
  return `https://${trimmed}`
}

export async function GET() {
  const { db, errorResponse } = await withAdminDb()
  if (errorResponse || !db) return errorResponse!

  const doc = await db.collection('websiteSettings').findOne({ _id: 'default' as unknown as never })
  const contactBot: ContactBotSettings = {
    instagram: {
      enabled: doc?.contactBot?.instagram?.enabled !== false,
      url: doc?.contactBot?.instagram?.url ?? doc?.instagramUrl ?? DEFAULT_CONTACT_BOT_SETTINGS.instagram.url,
    },
    whatsapp: {
      enabled: doc?.contactBot?.whatsapp?.enabled !== false,
      value: doc?.contactBot?.whatsapp?.value ?? doc?.whatsapp ?? doc?.phone ?? DEFAULT_CONTACT_BOT_SETTINGS.whatsapp.value,
    },
    email: {
      enabled: doc?.contactBot?.email?.enabled !== false,
      value: doc?.contactBot?.email?.value ?? doc?.email ?? DEFAULT_CONTACT_BOT_SETTINGS.email.value,
    },
    facebook: {
      enabled: doc?.contactBot?.facebook?.enabled !== false,
      url: doc?.contactBot?.facebook?.url ?? doc?.facebookUrl ?? DEFAULT_CONTACT_BOT_SETTINGS.facebook.url,
    },
    linkedin: {
      enabled: doc?.contactBot?.linkedin?.enabled !== false,
      url: doc?.contactBot?.linkedin?.url ?? doc?.linkedinUrl ?? DEFAULT_CONTACT_BOT_SETTINGS.linkedin.url,
    },
  }

  return NextResponse.json({ contactBot })
}

export async function PATCH(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()
  const rawBot = body.contactBot || body

  const instagramRaw = String(rawBot.instagram?.url ?? '').trim()
  const whatsappRaw = String(rawBot.whatsapp?.value ?? '').trim()
  const emailRaw = String(rawBot.email?.value ?? '').trim()
  const facebookRaw = String(rawBot.facebook?.url ?? '').trim()
  const linkedinRaw = String(rawBot.linkedin?.url ?? '').trim()

  const instagramEnabled = rawBot.instagram?.enabled !== false
  const whatsappEnabled = rawBot.whatsapp?.enabled !== false
  const emailEnabled = rawBot.email?.enabled !== false
  const facebookEnabled = rawBot.facebook?.enabled !== false
  const linkedinEnabled = rawBot.linkedin?.enabled !== false

  // Validation
  if (instagramRaw && !isValidUrl(instagramRaw)) {
    return NextResponse.json({ error: 'Please enter a valid Instagram URL.' }, { status: 400 })
  }
  if (whatsappRaw && !isValidWhatsApp(whatsappRaw)) {
    return NextResponse.json(
      { error: 'Please enter a valid WhatsApp phone number or wa.me link.' },
      { status: 400 }
    )
  }
  if (emailRaw && !isValidEmail(emailRaw)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (facebookRaw && !isValidUrl(facebookRaw)) {
    return NextResponse.json({ error: 'Please enter a valid Facebook URL.' }, { status: 400 })
  }
  if (linkedinRaw && !isValidUrl(linkedinRaw)) {
    return NextResponse.json({ error: 'Please enter a valid LinkedIn URL.' }, { status: 400 })
  }

  const sanitizedContactBot: ContactBotSettings = {
    instagram: {
      enabled: instagramEnabled,
      url: sanitizeUrl(instagramRaw),
    },
    whatsapp: {
      enabled: whatsappEnabled,
      value: whatsappRaw,
    },
    email: {
      enabled: emailEnabled,
      value: emailRaw,
    },
    facebook: {
      enabled: facebookEnabled,
      url: sanitizeUrl(facebookRaw),
    },
    linkedin: {
      enabled: linkedinEnabled,
      url: sanitizeUrl(linkedinRaw),
    },
  }

  const now = new Date().toISOString()

  await db.collection('websiteSettings').findOneAndUpdate(
    { _id: 'default' as unknown as never },
    {
      $set: {
        contactBot: sanitizedContactBot,
        // Keep top-level mirrors in sync for site footer and overlays
        instagramUrl: sanitizedContactBot.instagram.url,
        whatsapp: sanitizedContactBot.whatsapp.value,
        email: sanitizedContactBot.email.value,
        facebookUrl: sanitizedContactBot.facebook.url,
        linkedinUrl: sanitizedContactBot.linkedin.url,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: 'after' }
  )

  await logAdminActivity(actor.email, 'updated', 'settings', 'Contact Bot / Social Links')
  revalidatePublicSite()

  return NextResponse.json({
    success: true,
    contactBot: sanitizedContactBot,
  })
}
