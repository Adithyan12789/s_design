'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Mail, MessageSquare, X } from 'lucide-react'
import type { ContactBotSettings } from '@/lib/cms/types'
import { DEFAULT_CONTACT_BOT_SETTINGS } from '@/lib/cms/defaults'

type ContactBotProps = {
  contactBotSettings?: ContactBotSettings
  email?: string
  phone?: string
  whatsapp?: string
  instagramUrl?: string
  facebookUrl?: string
  linkedinUrl?: string
}

const PREFILLED_WHATSAPP_MESSAGE = "Hello S_Designs, I'm interested in discussing a project."

function sanitizeHttpUrl(val: string): string {
  const trimmed = val.trim()
  if (!trimmed || trimmed === '#top' || trimmed === '#contact') return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  return `https://${trimmed}`
}

export function ContactBot({
  contactBotSettings,
  email = 'adithiruthiparambil12@gmail.com',
  phone = '',
  whatsapp = '',
  instagramUrl = '',
  facebookUrl = '',
  linkedinUrl = '',
}: ContactBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const botRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  // Dynamic Contact Bot state
  const [botSettings, setBotSettings] = useState<ContactBotSettings>(() => {
    return (
      contactBotSettings || {
        instagram: {
          enabled: true,
          url: instagramUrl || DEFAULT_CONTACT_BOT_SETTINGS.instagram.url,
        },
        whatsapp: {
          enabled: true,
          value: whatsapp || phone || DEFAULT_CONTACT_BOT_SETTINGS.whatsapp.value,
        },
        email: {
          enabled: true,
          value: email || DEFAULT_CONTACT_BOT_SETTINGS.email.value,
        },
        facebook: {
          enabled: true,
          url: facebookUrl || DEFAULT_CONTACT_BOT_SETTINGS.facebook.url,
        },
        linkedin: {
          enabled: true,
          url: linkedinUrl || DEFAULT_CONTACT_BOT_SETTINGS.linkedin.url,
        },
      }
    )
  })

  // Synchronize when SSR props change
  useEffect(() => {
    if (contactBotSettings) {
      setBotSettings(contactBotSettings)
    }
  }, [contactBotSettings])

  // Fetch freshest dynamic settings from backend API
  const refreshSettings = useCallback(() => {
    fetch('/api/contact-bot')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.contactBot) {
          setBotSettings(data.contactBot)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    refreshSettings()
  }, [refreshSettings, pathname])

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (botRef.current && !botRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isOpen])

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Toggle button handler
  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) {
        // Refresh settings on open to ensure real-time accuracy
        refreshSettings()
      }
      return next
    })
  }

  // 1. Resolve Instagram
  const instagramRaw = (botSettings.instagram?.url ?? instagramUrl ?? '').trim()
  const isInstagramEnabled = botSettings.instagram?.enabled !== false
  const resolvedInstagram = isInstagramEnabled && instagramRaw ? sanitizeHttpUrl(instagramRaw) : ''

  // 2. Resolve WhatsApp
  const whatsappRaw = (botSettings.whatsapp?.value ?? whatsapp ?? phone ?? '').trim()
  const isWhatsAppEnabled = botSettings.whatsapp?.enabled !== false
  let resolvedWhatsApp = ''
  if (isWhatsAppEnabled && whatsappRaw) {
    if (whatsappRaw.startsWith('http://') || whatsappRaw.startsWith('https://')) {
      resolvedWhatsApp = whatsappRaw
    } else {
      const digits = whatsappRaw.replace(/[^0-9]/g, '')
      if (digits) {
        const encodedMsg = encodeURIComponent(PREFILLED_WHATSAPP_MESSAGE)
        resolvedWhatsApp = `https://wa.me/${digits}?text=${encodedMsg}`
      }
    }
  }

  // 3. Resolve Email
  const emailRaw = (botSettings.email?.value ?? email ?? '').trim()
  const isEmailEnabled = botSettings.email?.enabled !== false
  const resolvedMailto =
    isEmailEnabled && emailRaw
      ? `mailto:${emailRaw}?subject=${encodeURIComponent(
          'Project Inquiry — S_Designs'
        )}&body=${encodeURIComponent("Hello S_Designs,\n\nI'm interested in discussing a project.")}`
      : ''

  // 4. Resolve Facebook
  const facebookRaw = (botSettings.facebook?.url ?? facebookUrl ?? '').trim()
  const isFacebookEnabled = botSettings.facebook?.enabled !== false
  const resolvedFacebook = isFacebookEnabled && facebookRaw ? sanitizeHttpUrl(facebookRaw) : ''

  // 5. Resolve LinkedIn
  const linkedinRaw = (botSettings.linkedin?.url ?? linkedinUrl ?? '').trim()
  const isLinkedInEnabled = botSettings.linkedin?.enabled !== false
  const resolvedLinkedIn = isLinkedInEnabled && linkedinRaw ? sanitizeHttpUrl(linkedinRaw) : ''

  // Build candidate items list in priority order
  const allCandidates = [
    {
      id: 'instagram',
      label: 'Instagram',
      href: resolvedInstagram,
      enabled: isInstagramEnabled && Boolean(resolvedInstagram),
      isExternal: true,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="contact-bot-icon-svg"
          aria-hidden="true"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      href: resolvedWhatsApp,
      enabled: isWhatsAppEnabled && Boolean(resolvedWhatsApp),
      isExternal: true,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="contact-bot-icon-svg"
          aria-hidden="true"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.33C9.33 7.33 9 7.41 8.73 7.71C8.46 8.01 7.69 8.73 7.69 10.2C7.69 11.67 8.76 13.08 8.91 13.28C9.06 13.49 11 16.48 13.94 17.75C14.64 18.05 15.18 18.23 15.61 18.37C16.31 18.59 16.95 18.56 17.45 18.48C18.01 18.4 19.18 17.77 19.42 17.09C19.67 16.41 19.67 15.82 19.59 15.7C19.52 15.58 19.32 15.51 19.02 15.36C18.72 15.21 17.24 14.48 16.97 14.38C16.69 14.28 16.5 14.23 16.3 14.53C16.1 14.83 15.53 15.51 15.36 15.71C15.18 15.91 15.01 15.93 14.71 15.78C14.41 15.63 13.45 15.32 12.31 14.3C11.43 13.51 10.83 12.54 10.66 12.24C10.49 11.94 10.64 11.78 10.79 11.63C10.93 11.5 11.09 11.28 11.24 11.11C11.39 10.93 11.44 10.81 11.54 10.61C11.64 10.41 11.59 10.23 11.52 10.08C11.44 9.93 10.84 8.46 10.59 7.86C10.35 7.28 10.1 7.36 9.92 7.35C9.75 7.34 9.55 7.33 9.53 7.33Z" />
        </svg>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      href: resolvedMailto,
      enabled: isEmailEnabled && Boolean(resolvedMailto),
      isExternal: false,
      icon: (
        <Mail
          size={18}
          strokeWidth={1.8}
          className="contact-bot-icon-svg"
          aria-hidden="true"
        />
      ),
    },
    {
      id: 'facebook',
      label: 'Facebook',
      href: resolvedFacebook,
      enabled: isFacebookEnabled && Boolean(resolvedFacebook),
      isExternal: true,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="contact-bot-icon-svg"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: resolvedLinkedIn,
      enabled: isLinkedInEnabled && Boolean(resolvedLinkedIn),
      isExternal: true,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="contact-bot-icon-svg"
          aria-hidden="true"
        >
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
        </svg>
      ),
    },
  ]

  // Filter to show ONLY items that are enabled AND have valid configured links
  const activeItems = allCandidates.filter((item) => item.enabled && Boolean(item.href))

  return (
    <div
      ref={botRef}
      className={`contact-bot-root ${isOpen ? 'is-open' : ''}`}
      aria-label="Contact Assistant"
    >
      {/* Horizontal Social/Contact Icons Row expanding to the left */}
      <div
        id="contact-bot-row"
        className={`contact-bot-row ${isOpen ? 'row-visible' : ''}`}
        role="group"
        aria-label="Social and Contact Options"
        aria-hidden={!isOpen}
      >
        {activeItems.map((item, index) => (
          <a
            key={item.id}
            href={item.href}
            target={item.isExternal ? '_blank' : undefined}
            rel={item.isExternal ? 'noopener noreferrer' : undefined}
            className="contact-bot-icon-btn cursor-target"
            data-crosshair-target
            data-cursor-label={item.label}
            aria-label={item.label}
            tabIndex={isOpen ? 0 : -1}
            suppressHydrationWarning
            style={
              {
                '--item-index': index,
              } as React.CSSProperties
            }
          >
            <span className="contact-bot-icon-inner">{item.icon}</span>
            <span className="contact-bot-tooltip" role="tooltip">
              {item.label}
            </span>
          </a>
        ))}
      </div>

      {/* Main Floating Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        className="contact-bot-trigger cursor-target"
        data-crosshair-target
        data-cursor-label={isOpen ? 'Close' : 'Connect'}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls="contact-bot-row"
        aria-label={isOpen ? 'Close Contact Menu' : 'Open Contact Menu'}
        suppressHydrationWarning
      >
        <span className="contact-bot-trigger-bg" aria-hidden="true" />
        <span className="contact-bot-trigger-icon" aria-hidden="true">
          {isOpen ? (
            <X size={20} strokeWidth={1.8} className="contact-bot-icon-x" />
          ) : (
            <MessageSquare size={20} strokeWidth={1.8} className="contact-bot-icon-chat" />
          )}
        </span>
        <span className="contact-bot-pulse" aria-hidden="true" />
      </button>
    </div>
  )
}
