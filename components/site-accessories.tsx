'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import type { CmsContactBotSettings } from '@/lib/cms/types'

const CrosshairCursor = dynamic(() => import('@/components/crosshair-cursor'), { ssr: false })
const ContactBot = dynamic(() => import('@/components/contact-bot').then((mod) => mod.ContactBot), { ssr: false })

interface SiteAccessoriesProps {
  contactBotSettings?: CmsContactBotSettings
  email?: string
  phone?: string
  whatsapp?: string
  instagramUrl?: string
  facebookUrl?: string
  linkedinUrl?: string
}

export function SiteAccessories({
  contactBotSettings,
  email,
  phone,
  whatsapp,
  instagramUrl,
  facebookUrl,
  linkedinUrl,
}: SiteAccessoriesProps) {
  return (
    <>
      <ContactBot
        contactBotSettings={contactBotSettings}
        email={email}
        phone={phone}
        whatsapp={whatsapp}
        instagramUrl={instagramUrl}
        facebookUrl={facebookUrl}
        linkedinUrl={linkedinUrl}
      />
      <CrosshairCursor />
    </>
  )
}
