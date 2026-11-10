'use client'

import Link from 'next/link'
import Image from 'next/image'

type BrandLogoProps = {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark' | 'glass'
  showSubtitle?: boolean
  className?: string
}

export function BrandLogo({
  href = '/#top',
  size = 'md',
  variant = 'glass',
  showSubtitle = true,
  className = '',
}: BrandLogoProps) {
  const sizeClasses = {
    sm: 'brand-logo--sm',
    md: 'brand-logo--md',
    lg: 'brand-logo--lg',
  }

  const emblemSrc =
    variant === 'dark'
      ? '/s-design-emblem-transparent.png'
      : '/s-design-emblem-white.png'

  const content = (
    <div className={`brand-logo-lockup ${sizeClasses[size]} brand-logo--${variant} ${className}`}>
      <div className="brand-logo-emblem" aria-hidden="true">
        <Image
          src={emblemSrc}
          alt="S_Designs Architectural Logo"
          width={36}
          height={36}
          className="brand-logo-image"
          priority
        />
        <span className="brand-logo-emblem-glow" />
      </div>
      <div className="brand-logo-text">
        <span className="brand-logo-name">S_DE_SIGN</span>
        {showSubtitle && <span className="brand-logo-sub">— STUDIO —</span>}
      </div>
    </div>
  )

  if (!href) return content

  return (
    <Link href={href} className="brand-logo-link" aria-label="S_Designs home">
      {content}
    </Link>
  )
}

