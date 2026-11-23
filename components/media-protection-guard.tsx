'use client'

import { useEffect } from 'react'

export function MediaProtectionGuard() {
  useEffect(() => {
    // Never apply protections within the admin area
    if (typeof window === 'undefined') return
    if (window.location.pathname.startsWith('/admin')) return

    const handleContextMenu = (e: MouseEvent) => {
      if (window.location.pathname.startsWith('/admin')) return

      const target = e.target as HTMLElement | null
      if (!target) return

      // Protect all images, videos, or elements within project media containers
      const isMedia =
        target.tagName === 'IMG' ||
        target.tagName === 'VIDEO' ||
        Boolean(
          target.closest(
            '.project-image-3d, .gallery-item-wrapper, .gallery-video-card-container, .lightbox-image-stage, .detail-hero-media, .reviews-video-stage, .story-hero-wrapper, .intro-parallax-stage, .parallax-image-container'
          )
        )

      if (isMedia) {
        e.preventDefault()
      }
    }

    const handleDragStart = (e: DragEvent) => {
      if (window.location.pathname.startsWith('/admin')) return

      const target = e.target as HTMLElement | null
      if (!target) return

      const isMedia =
        target.tagName === 'IMG' ||
        target.tagName === 'VIDEO' ||
        Boolean(
          target.closest(
            '.project-image-3d, .gallery-item-wrapper, .gallery-video-card-container, .lightbox-image-stage, .detail-hero-media, .reviews-video-stage, .story-hero-wrapper, .intro-parallax-stage, .parallax-image-container'
          )
        )

      if (isMedia) {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu, { capture: true })
    document.addEventListener('dragstart', handleDragStart, { capture: true })

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true })
      document.removeEventListener('dragstart', handleDragStart, { capture: true })
    }
  }, [])

  return null
}
