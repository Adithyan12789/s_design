'use client'

type HamburgerButtonProps = {
  isOpen: boolean
  onClick: () => void
  className?: string
}

export function HamburgerButton({ isOpen, onClick, className = '' }: HamburgerButtonProps) {
  return (
    <button
      className={`hamburger-architectural-btn ${isOpen ? 'is-active' : ''} ${className}`}
      onClick={onClick}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      suppressHydrationWarning
    >
      <span className="hamburger-text-label">{isOpen ? 'CLOSE' : 'MENU'}</span>
      <div className="hamburger-icon-wrapper" aria-hidden="true">
        <span className="line line-1" />
        <span className="line line-2" />
      </div>
    </button>
  )
}

