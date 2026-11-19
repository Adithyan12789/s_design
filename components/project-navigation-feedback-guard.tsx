'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectFeedbackModal } from '@/components/project-feedback-modal'

interface ProjectNavigationFeedbackGuardProps {
  project: {
    id: string
    title: string
    slug: string
    mainImage?: string
    category?: string
    location?: string
  }
}

export function ProjectNavigationFeedbackGuard({
  project,
}: ProjectNavigationFeedbackGuardProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const isAllowedToLeave = useRef(false)
  const hasPrompted = useRef(false)
  const pendingNav = useRef<string | 'BACK' | null>(null)
  const pushedGuardState = useRef(false)

  useEffect(() => {
    const storageKey = `s_designs_feedback_handled_${project.id}`
    try {
      if (sessionStorage.getItem(storageKey) === 'true') {
        hasPrompted.current = true
      }
    } catch {
      // sessionStorage unavailable
    }

    // Set up history guard state for browser back button interception
    if (!hasPrompted.current && typeof window !== 'undefined' && window.history) {
      try {
        window.history.pushState({ projectFeedbackGuard: project.id }, '', window.location.href)
        pushedGuardState.current = true
      } catch {
        // history pushState failed
      }
    }

    // 1. Intercept Browser Back Button (popstate)
    const handlePopState = () => {
      if (isAllowedToLeave.current || hasPrompted.current) {
        return
      }

      // User pressed back button: intercept and show review modal
      hasPrompted.current = true
      pendingNav.current = 'BACK'
      setModalOpen(true)
    }

    // 2. Intercept Internal Link Clicks (Header, Nav, Next Project, Footer, etc.)
    const handleCaptureClick = (e: MouseEvent) => {
      if (isAllowedToLeave.current || hasPrompted.current) {
        return
      }

      // Find closest anchor tag
      const anchor = (e.target as Element | null)?.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Ignore new tabs or key combinations
      if (anchor.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }

      // Ignore non-http links (mailto, tel, javascript) or downloads
      if (
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        anchor.hasAttribute('download')
      ) {
        return
      }

      try {
        const url = new URL(href, window.location.href)

        // Ignore external domains
        if (url.origin !== window.location.origin) {
          return
        }

        // Ignore navigation within the same project page (in-page anchors like #gallery, #details)
        if (url.pathname === window.location.pathname) {
          return
        }

        // Target is another page/project: intercept!
        e.preventDefault()
        e.stopPropagation()

        hasPrompted.current = true
        pendingNav.current = href
        setModalOpen(true)
      } catch {
        // malformed URL
      }
    }

    window.addEventListener('popstate', handlePopState)
    document.addEventListener('click', handleCaptureClick, true)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('click', handleCaptureClick, true)
    }
  }, [project.id])

  const handleModalClose = () => {
    setModalOpen(false)
    isAllowedToLeave.current = true

    const storageKey = `s_designs_feedback_handled_${project.id}`
    try {
      sessionStorage.setItem(storageKey, 'true')
    } catch {
      // sessionStorage unavailable
    }

    const destination = pendingNav.current
    pendingNav.current = null

    if (destination === 'BACK') {
      // Continue browser back navigation
      window.history.back()
    } else if (destination) {
      // Continue internal link navigation
      router.push(destination)
    }
  }

  return (
    <ProjectFeedbackModal
      open={modalOpen}
      project={project}
      onClose={handleModalClose}
    />
  )
}
