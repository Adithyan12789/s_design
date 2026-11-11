'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { HamburgerButton } from '@/components/motion/hamburger-button'
import { FullNavOverlay } from '@/components/motion/full-nav-overlay'

type SiteHeaderNavProps = {
  backHref?: string
  backLabel?: string
  showBackLink?: boolean
  className?: string
  theme?: 'light' | 'charcoal'
}

export function SiteHeaderNav({
  backHref = '/#selected-work',
  backLabel = 'Back to home',
  showBackLink = false,
  className = '',
  theme = 'charcoal',
}: SiteHeaderNavProps) {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const isCharcoal = theme === 'charcoal'

  return (
    <>
      <FullNavOverlay
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        activeSection="selected-work"
      />

      <header className={`detail-header ${isCharcoal ? 'detail-header--charcoal' : ''} ${className}`}>
        <BrandLogo href="/#top" variant={isCharcoal ? 'glass' : 'dark'} />

        <div className="flex items-center gap-6">
          {showBackLink && (
            <Link className="back-link" href={backHref}>
              <ArrowLeft size={15} /> {backLabel}
            </Link>
          )}

          <Link className="nav-cta" href="/#contact">
            Start a project <ArrowUpRight size={14} />
          </Link>

          <HamburgerButton
            isOpen={isNavOpen}
            onClick={() => setIsNavOpen(!isNavOpen)}
          />
        </div>
      </header>
    </>
  )
}

