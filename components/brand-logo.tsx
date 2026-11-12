'use client'

import Link from 'next/link'
import Image from 'next/image'

type BrandLogoProps = {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark' | 'glass'
  showSubtitle?: boolean
  className?: string
  studioName?: string
  studioSubtitle?: string
  lightLogoUrl?: string
  darkLogoUrl?: string
}

export function BrandLogo({
  href = '/#top',
  size = 'md',
  variant = 'glass',
  showSubtitle = true,
  className = '',
  studioName = 'S_DE_SIGN',
  studioSubtitle = 'ARCHITECTURE / STUDIO',
  lightLogoUrl = '/s-design-emblem-white.png',
  darkLogoUrl = '/s-design-emblem-clean.png',
}: BrandLogoProps) {
  const sizeClasses = {
    sm: 'brand-logo--sm',
    md: 'brand-logo--md',
    lg: 'brand-logo--lg',
  }

  const emblemSrc =
    variant === 'dark'
      ? darkLogoUrl || '/s-design-emblem-clean.png'
      : lightLogoUrl || '/s-design-emblem-white.png'

  const content = (
    <div className={`brand-logo-lockup ${sizeClasses[size]} brand-logo--${variant} ${className}`}>
      <div className="brand-logo-emblem" aria-hidden="true">
        <Image
          src={emblemSrc}
          alt={`${studioName} Architectural Logo`}
          width={32}
          height={32}
          className="brand-logo-image"
          priority
        />
        <span className="brand-logo-emblem-glow" />
      </div>
      <div className="brand-logo-text">
        <span className="brand-logo-name">{studioName}</span>
        {showSubtitle && <span className="brand-logo-sub">{studioSubtitle}</span>}
      </div>
    </div>
  )

  if (!href) return content

  return (
    <Link href={href} className="brand-logo-link" aria-label={`${studioName} home`}>
      {content}
    </Link>
  )
}

