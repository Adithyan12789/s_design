import { NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb/client'
import { DEFAULT_CONTACT_BOT_SETTINGS } from '@/lib/cms/defaults'
import type { ContactBotSettings } from '@/lib/cms/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = await getMongoDb()
  if (!db) {
    return NextResponse.json({ contactBot: DEFAULT_CONTACT_BOT_SETTINGS })
  }

  try {
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
  } catch (err) {
    console.error('[API] Failed to fetch contact bot settings:', err)
    return NextResponse.json({ contactBot: DEFAULT_CONTACT_BOT_SETTINGS })
  }
}
