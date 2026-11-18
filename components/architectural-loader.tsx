'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'

interface ArchitecturalLoaderContextType {
  startProjectLoading: (slug: string, title?: string) => void
  isLoading: boolean
}

const ArchitecturalLoaderContext = createContext<ArchitecturalLoaderContextType>({
  startProjectLoading: () => {},
  isLoading: false,
})

export const useArchitecturalLoader = () => useContext(ArchitecturalLoaderContext)

// Target duration: exactly 7 seconds (7,000ms)
const LOADER_DURATION_MS = 7000

export function ArchitecturalLoaderProvider({
  children,
  studioName = 'S_Designs',
}: {
  children: React.ReactNode
  studioName?: string
  studioSubtitle?: string
}) {
  const pathname = usePathname()

  // Initial site entry loading state (7s duration)
  const [initialLoading, setInitialLoading] = useState(true)
  const [initialExiting, setInitialExiting] = useState(false)
  const [initialProgress, setInitialProgress] = useState(0)

  // Project navigation loading state (7s duration)
  const [projectLoading, setProjectLoading] = useState(false)
  const [projectExiting, setProjectExiting] = useState(false)
  const [projectProgress, setProjectProgress] = useState(0)

  const navStartTimeRef = useRef<number>(0)
  const hasDestinationMountedRef = useRef<boolean>(false)
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const navAnimFrameRef = useRef<number | null>(null)
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // =========================================================================
  // 1. Initial Website Entry: 10-Second Loading Experience
  // =========================================================================
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const targetDuration = prefersReducedMotion ? 1200 : LOADER_DURATION_MS
    const startTime = performance.now()
    let animFrame: number

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progressRatio = Math.min(1, elapsed / targetDuration)
      const percent = Math.floor(progressRatio * 100)
      setInitialProgress(percent)

      if (elapsed < targetDuration) {
        animFrame = requestAnimationFrame(tick)
      } else {
        setInitialProgress(100)
        // Brief pause at 100% then smooth fade exit
        setTimeout(() => {
          setInitialExiting(true)
          setTimeout(() => {
            setInitialLoading(false)
          }, 700)
        }, 160)
      }
    }

    animFrame = requestAnimationFrame(tick)

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame)
    }
  }, [])

  // Helper to trigger project loader exit
  const triggerProjectExit = useCallback(() => {
    if (exitTimeoutRef.current) return
    setProjectProgress(100)
    setProjectExiting(true)
    exitTimeoutRef.current = setTimeout(() => {
      setProjectLoading(false)
      setProjectExiting(false)
      exitTimeoutRef.current = null
    }, 700)
  }, [])

  // =========================================================================
  // 2. Project Navigation Loading: 10-Second Experience
  // =========================================================================
  const startProjectLoading = useCallback(
    (slug: string) => {
      const targetUrl = `/work/${slug}`
      if (window.location.pathname === targetUrl) return

      navStartTimeRef.current = performance.now()
      hasDestinationMountedRef.current = false
      setProjectExiting(false)
      setProjectLoading(true)
      setProjectProgress(0)

      if (navAnimFrameRef.current) cancelAnimationFrame(navAnimFrameRef.current)
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current)
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current)
      exitTimeoutRef.current = null

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const targetDuration = prefersReducedMotion ? 1200 : LOADER_DURATION_MS

      const tickNav = (now: number) => {
        const elapsed = now - navStartTimeRef.current
        const progressRatio = Math.min(1, elapsed / targetDuration)
        const percent = Math.floor(progressRatio * 100)
        setProjectProgress(percent)

        if (elapsed < targetDuration) {
          navAnimFrameRef.current = requestAnimationFrame(tickNav)
        } else {
          setProjectProgress(100)
          // Minimum 7 seconds elapsed:
          // Check if destination page is ready
          if (
            hasDestinationMountedRef.current ||
            window.location.pathname.startsWith('/work/')
          ) {
            triggerProjectExit()
          }
        }
      }

      navAnimFrameRef.current = requestAnimationFrame(tickNav)

      // Safety fallback timeout: prevent permanently stuck loader (max 14s)
      safetyTimeoutRef.current = setTimeout(() => {
        triggerProjectExit()
      }, 14000)
    },
    [triggerProjectExit]
  )

  // Listen to document clicks for any project navigation links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const target = e.target as HTMLElement | null
      if (!target) return

      const anchor = target.closest('a') as HTMLAnchorElement | null
      if (!anchor || !anchor.href) return

      try {
        const url = new URL(anchor.href, window.location.origin)
        if (url.origin === window.location.origin && url.pathname.startsWith('/work/')) {
          const pathSegments = url.pathname.split('/').filter(Boolean)
          if (pathSegments.length >= 2 && pathSegments[0] === 'work') {
            const slug = pathSegments[1]
            startProjectLoading(slug)
          }
        }
      } catch {
        // Ignore invalid URLs
      }
    }

    document.addEventListener('click', handleDocumentClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true })
    }
  }, [startProjectLoading])

  // Track route arrival
  useEffect(() => {
    if (!projectLoading) return

    if (pathname.startsWith('/work/')) {
      hasDestinationMountedRef.current = true
      const elapsed = performance.now() - navStartTimeRef.current
      // If 10 seconds have ALREADY elapsed when the page finishes loading, exit now
      if (elapsed >= LOADER_DURATION_MS) {
        triggerProjectExit()
      }
      // Otherwise, tickNav will trigger exit as soon as it reaches 10s!
    }
  }, [pathname, projectLoading, triggerProjectExit])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (projectLoading) {
        triggerProjectExit()
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [projectLoading, triggerProjectExit])

  const isLoading = initialLoading || projectLoading

  return (
    <ArchitecturalLoaderContext.Provider value={{ startProjectLoading, isLoading }}>
      {children}

      {/* 1. INITIAL ENTRY LOADER (7s) */}
      {initialLoading && (
        <div
          className={`minimal-loader-screen ${
            initialExiting ? 'minimal-loader-exiting' : ''
          }`}
          aria-live="polite"
          aria-busy="true"
        >
          <div className="minimal-loader-content">
            <h1 className="minimal-loader-brand">{studioName || 'S_Designs'}</h1>

            <div className="minimal-loader-track" aria-hidden="true">
              <div
                className="minimal-loader-fill"
                style={{ width: `${initialProgress}%` }}
              />
            </div>

            <div
              className="minimal-loader-counter"
              aria-label={`Loading ${initialProgress}%`}
            >
              {String(initialProgress).padStart(2, '0')}%
            </div>
          </div>
        </div>
      )}

      {/* 2. PROJECT NAVIGATION LOADER (7s) */}
      {projectLoading && (
        <div
          className={`minimal-loader-screen ${
            projectExiting ? 'minimal-loader-exiting' : ''
          }`}
          aria-live="polite"
          aria-busy="true"
        >
          <div className="minimal-loader-content">
            <h2 className="minimal-loader-brand">{studioName || 'S_Designs'}</h2>

            <div className="minimal-loader-track" aria-hidden="true">
              <div
                className="minimal-loader-fill"
                style={{ width: `${projectProgress}%` }}
              />
            </div>

            <div
              className="minimal-loader-counter"
              aria-label={`Loading ${projectProgress}%`}
            >
              {String(projectProgress).padStart(2, '0')}%
            </div>
          </div>
        </div>
      )}
    </ArchitecturalLoaderContext.Provider>
  )
}
