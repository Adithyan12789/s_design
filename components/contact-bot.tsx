'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Mail, ArrowUpRight, MessageSquare, X } from 'lucide-react'

type ContactBotProps = {
  email?: string
  phone?: string
  whatsapp?: string
  instagramUrl?: string
}

const PREFILLED_WHATSAPP_MESSAGE = "Hello S_Designs, I'm interested in discussing a project."

export function ContactBot({
  email = 'hello@sdesigns.studio',
  phone = '',
  whatsapp = '',
  instagramUrl = '',
}: ContactBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const botRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

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

  // 1. Resolve Instagram URL
  const resolvedInstagram =
    instagramUrl && instagramUrl !== '#top' && instagramUrl.trim() !== ''
      ? instagramUrl
      : 'https://www.instagram.com/sdesigns.studio'

  // 2. Resolve WhatsApp URL with prefilled message
  const rawNumber = (whatsapp || phone || '').replace(/[^0-9]/g, '')
  const encodedMsg = encodeURIComponent(PREFILLED_WHATSAPP_MESSAGE)
  const resolvedWhatsApp = rawNumber
    ? `https://wa.me/${rawNumber}?text=${encodedMsg}`
    : `https://wa.me/?text=${encodedMsg}`

  // 3. Resolve Mailto link
  const resolvedEmail = email?.trim() || 'hello@sdesigns.studio'
  const resolvedMailto = `mailto:${resolvedEmail}?subject=${encodeURIComponent(
    'Project Inquiry — S_Designs'
  )}&body=${encodeURIComponent(
    "Hello S_Designs,\n\nI'm interested in discussing a project."
  )}`

  return (
    <div
      ref={botRef}
      className={`contact-bot-root ${isOpen ? 'is-open' : ''}`}
      aria-label="Contact Assistant"
    >
      {/* Expandable Contact Menu */}
      <div
        id="contact-bot-menu"
        className={`contact-bot-menu ${isOpen ? 'menu-visible' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-label="Contact Options"
        aria-hidden={!isOpen}
      >
        <div className="contact-bot-header">
          <div className="contact-bot-title-group">
            <span className="contact-bot-kicker">DIRECT INQUIRIES</span>
            <h3 className="contact-bot-heading">Let&apos;s Connect</h3>
            <p className="contact-bot-sub">Choose how you&apos;d like to reach us.</p>
          </div>
        </div>

        <div className="contact-bot-divider" aria-hidden="true" />

        <div className="contact-bot-options">
          {/* Instagram Option */}
          <a
            href={resolvedInstagram}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-bot-item cursor-target"
            data-crosshair-target
            data-cursor-label="Instagram"
            tabIndex={isOpen ? 0 : -1}
          >
            <div className="contact-bot-icon-wrap" aria-hidden="true">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="contact-bot-svg"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </div>
            <div className="contact-bot-item-text">
              <span className="contact-bot-item-label">Instagram</span>
              <span className="contact-bot-item-meta">Follow &amp; Direct Message</span>
            </div>
            <ArrowUpRight size={15} className="contact-bot-arrow" aria-hidden="true" />
          </a>

          {/* WhatsApp Option */}
          <a
            href={resolvedWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-bot-item cursor-target"
            data-crosshair-target
            data-cursor-label="WhatsApp"
            tabIndex={isOpen ? 0 : -1}
          >
            <div className="contact-bot-icon-wrap" aria-hidden="true">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="contact-bot-svg"
              >
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.33C9.33 7.33 9 7.41 8.73 7.71C8.46 8.01 7.69 8.73 7.69 10.2C7.69 11.67 8.76 13.08 8.91 13.28C9.06 13.49 11 16.48 13.94 17.75C14.64 18.05 15.18 18.23 15.61 18.37C16.31 18.59 16.95 18.56 17.45 18.48C18.01 18.4 19.18 17.77 19.42 17.09C19.67 16.41 19.67 15.82 19.59 15.7C19.52 15.58 19.32 15.51 19.02 15.36C18.72 15.21 17.24 14.48 16.97 14.38C16.69 14.28 16.5 14.23 16.3 14.53C16.1 14.83 15.53 15.51 15.36 15.71C15.18 15.91 15.01 15.93 14.71 15.78C14.41 15.63 13.45 15.32 12.31 14.3C11.43 13.51 10.83 12.54 10.66 12.24C10.49 11.94 10.64 11.78 10.79 11.63C10.93 11.5 11.09 11.28 11.24 11.11C11.39 10.93 11.44 10.81 11.54 10.61C11.64 10.41 11.59 10.23 11.52 10.08C11.44 9.93 10.84 8.46 10.59 7.86C10.35 7.28 10.1 7.36 9.92 7.35C9.75 7.34 9.55 7.33 9.53 7.33Z" />
              </svg>
            </div>
            <div className="contact-bot-item-text">
              <span className="contact-bot-item-label">WhatsApp</span>
              <span className="contact-bot-item-meta">Start Instant Conversation</span>
            </div>
            <ArrowUpRight size={15} className="contact-bot-arrow" aria-hidden="true" />
          </a>

          {/* Email Option */}
          <a
            href={resolvedMailto}
            className="contact-bot-item cursor-target"
            data-crosshair-target
            data-cursor-label="Email"
            tabIndex={isOpen ? 0 : -1}
          >
            <div className="contact-bot-icon-wrap" aria-hidden="true">
              <Mail size={17} strokeWidth={1.8} className="contact-bot-svg" />
            </div>
            <div className="contact-bot-item-text">
              <span className="contact-bot-item-label">Email Us</span>
              <span className="contact-bot-item-meta">{resolvedEmail}</span>
            </div>
            <ArrowUpRight size={15} className="contact-bot-arrow" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Main Floating Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        className="contact-bot-trigger cursor-target"
        data-crosshair-target
        data-cursor-label={isOpen ? 'Close' : 'Connect'}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="contact-bot-menu"
        aria-label={isOpen ? 'Close Contact Menu' : 'Open Contact Menu'}
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
