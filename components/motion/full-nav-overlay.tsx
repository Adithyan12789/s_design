'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ArrowUpRight, X } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'

type FullNavOverlayProps = {
  isOpen: boolean
  onClose: () => void
}

const NAV_ITEMS = [
  {
    index: '01',
    title: 'Work',
    href: '/work',
    subtitle: 'Selected Architectural Commissions',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    index: '02',
    title: 'Studio',
    href: '/#studio',
    subtitle: 'Philosophy, Materiality & Craft',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    index: '03',
    title: 'Services',
    href: '/#services',
    subtitle: 'Architecture, Interiors & Objects',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    index: '04',
    title: 'Contact',
    href: '/#contact',
    subtitle: 'Initiate a Conversation',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
  },
]

export function FullNavOverlay({ isOpen, onClose }: FullNavOverlayProps) {
  const [mounted, setMounted] = useState(false)
  const [activeItem, setActiveItem] = useState(0)
  const [timeString, setTimeString] = useState('')
  const overlayRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Real-time Lisbon Studio clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const time = now.toLocaleTimeString('en-GB', {
        timeZone: 'Europe/Lisbon',
        hour: '2-digit',
        minute: '2-digit',
      })
      setTimeString(time)
    }
    updateTime()
    const timer = setInterval(updateTime, 30000)
    return () => clearInterval(timer)
  }, [])

  // Control Lenis and keyboard ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      window.dispatchEvent(new CustomEvent('lenis:stop'))
      document.documentElement.classList.add('nav-locked')
      window.addEventListener('keydown', handleKeyDown)
    } else {
      window.dispatchEvent(new CustomEvent('lenis:start'))
      document.documentElement.classList.remove('nav-locked')
    }

    return () => {
      window.dispatchEvent(new CustomEvent('lenis:start'))
      document.documentElement.classList.remove('nav-locked')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  const overlayJSX = (
    <div
      ref={overlayRef}
      className={`full-nav-overlay ${isOpen ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
    >
      <div className="nav-overlay-backdrop" onClick={onClose} />

      <div className="nav-overlay-container">
        {/* Top Header Bar */}
        <div className="nav-overlay-header">
          <BrandLogo href="/#top" variant="dark" />
          <button
            className="nav-overlay-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
            suppressHydrationWarning
          >
            <span className="close-text">CLOSE</span>
            <div className="close-icon-box">
              <X size={18} />
            </div>
          </button>
        </div>

        {/* Center Grid: Navigation Links & Architectural Preview */}
        <div className="nav-overlay-body">
          <nav className="nav-overlay-links">
            {NAV_ITEMS.map((item, idx) => {
              const isHovered = activeItem === idx
              return (
                <div
                  key={item.title}
                  className={`nav-link-row group ${isHovered ? 'is-active-row' : ''}`}
                  onMouseEnter={() => setActiveItem(idx)}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="nav-item-anchor"
                  >
                    <span className="nav-item-index">{item.index}</span>
                    <span className="nav-item-title-wrap">
                      <span className="nav-item-title">{item.title}</span>
                      <span className="nav-item-sub">{item.subtitle}</span>
                    </span>
                    <ArrowUpRight className="nav-item-arrow" size={28} />
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* Right Preview Side */}
          <div className="nav-overlay-preview" aria-hidden="true">
            <div className="preview-image-frame">
              <div
                className="preview-image-bg"
                style={{ backgroundImage: `url(${NAV_ITEMS[activeItem]?.image})` }}
              />
              <div className="preview-image-overlay" />
              <div className="preview-caption">
                <span className="preview-kicker">FEATURED COMMISSION</span>
                <h4>{NAV_ITEMS[activeItem]?.subtitle}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="nav-overlay-footer">
          <div className="footer-meta-col">
            <span className="meta-label">INQUIRIES</span>
            <a href="mailto:hello@sdesigns.studio" className="meta-value">
              hello@sdesigns.studio
            </a>
          </div>
          <div className="footer-meta-col">
            <span className="meta-label">STUDIO LOCATION</span>
            <span className="meta-value">Lisbon, Portugal — Worldwide</span>
          </div>
          <div className="footer-meta-col">
            <span className="meta-label">LOCAL TIME</span>
            <span className="meta-value">
              {timeString ? `${timeString} WET (GMT+0)` : 'Lisbon, PT'}
            </span>
          </div>
          <div className="footer-meta-col socials">
            <span className="meta-label">DISPATCHES</span>
            <div className="social-links">
              <a href="#top" aria-label="Instagram">Instagram</a>
              <span className="dot">/</span>
              <a href="#top" aria-label="LinkedIn">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(overlayJSX, document.body)
}
