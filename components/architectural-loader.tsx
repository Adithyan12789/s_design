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
import { ArchitecturalLoaderView } from '@/components/architectural-loader-view'

interface ArchitecturalLoaderContextType {
  startProjectLoading: (slug: string, title?: string) => void
  isLoading: boolean
}

const ArchitecturalLoaderContext = createContext<ArchitecturalLoaderContextType>({
  startProjectLoading: () => {},
  isLoading: false,
})

export const useArchitecturalLoader = () => useContext(ArchitecturalLoaderContext)

// Target duration: exactly 5 seconds (5,000ms)
const LOADER_DURATION_MS = 5000

export function ArchitecturalLoaderProvider({
  children,
  studioName = 'S_Designs',
  studioSubtitle,
}: {
  children: React.ReactNode
  studioName?: string
  studioSubtitle?: string
}) {
  const pathname = usePathname()

  // Initial site entry loading state (5s duration)
  const [initialLoading, setInitialLoading] = useState(true)
  const [initialExiting, setInitialExiting] = useState(false)
  const [initialProgress, setInitialProgress] = useState(0)

  // Project navigation loading state (5s duration)
  const [projectLoading, setProjectLoading] = useState(false)
  const [projectExiting, setProjectExiting] = useState(false)
  const [projectProgress, setProjectProgress] = useState(0)

  const navStartTimeRef = useRef<number>(0)
  const originPathRef = useRef<string>('')
  const hasDestinationMountedRef = useRef<boolean>(false)
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const navAnimFrameRef = useRef<number | null>(null)
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // =========================================================================
  // 1. Initial Website Entry: 5-Second Architectural Loading Experience
  // =========================================================================
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const targetDuration = prefersReducedMotion ? 1200 : LOADER_DURATION_MS
    const startTime = performance.now()
    let animFrame: number
    let exitTimer1: NodeJS.Timeout
    let exitTimer2: NodeJS.Timeout

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progressRatio = Math.min(1, elapsed / targetDuration)
      const isDocumentReady =
        typeof document !== 'undefined' &&
        (document.readyState === 'complete' || document.readyState === 'interactive')

      if (elapsed < targetDuration) {
        // Continuous smooth progress up to 98%
        const percent = Math.floor(progressRatio * 98)
        setInitialProgress(percent)
        animFrame = requestAnimationFrame(tick)
      } else if (!isDocumentReady) {
        // 5 seconds elapsed but page is still completing hydration/loading
        setInitialProgress(99)
        animFrame = requestAnimationFrame(tick)
      } else {
        // Both 5s minimum AND page readiness are satisfied
        setInitialProgress(100)
        exitTimer1 = setTimeout(() => {
          setInitialExiting(true)
          exitTimer2 = setTimeout(() => {
            setInitialLoading(false)
          }, 750)
        }, 180)
      }
    }

    animFrame = requestAnimationFrame(tick)

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame)
      if (exitTimer1) clearTimeout(exitTimer1)
      if (exitTimer2) clearTimeout(exitTimer2)
    }
  }, [])

  // Helper to trigger project loader exit
  const triggerProjectExit = useCallback(() => {
    if (exitTimeoutRef.current) return
    setProjectProgress(100)
    exitTimeoutRef.current = setTimeout(() => {
      setProjectExiting(true)
      setTimeout(() => {
        setProjectLoading(false)
        setProjectExiting(false)
        exitTimeoutRef.current = null
      }, 750)
    }, 180)
  }, [])

  // =========================================================================
  // 2. Project Navigation Loading: 5-Second Architectural Experience
  // =========================================================================
  const startProjectLoading = useCallback(
    (slug: string) => {
      const targetUrl = `/work/${slug}`
      if (window.location.pathname === targetUrl) return

      originPathRef.current = window.location.pathname
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
        const isDestinationReady =
          hasDestinationMountedRef.current ||
          (window.location.pathname.startsWith('/work/') &&
            window.location.pathname !== originPathRef.current)

        if (elapsed < targetDuration) {
          // Progress scales continuously up to 98% until page is ready
          const percent = Math.floor(
            progressRatio * (isDestinationReady ? 100 : 98)
          )
          setProjectProgress(percent)
          navAnimFrameRef.current = requestAnimationFrame(tickNav)
        } else if (!isDestinationReady) {
          // 5s elapsed, but destination page is still loading:
          // Keep loader visible, show ongoing progress indicator at 99%, do NOT prematurely complete
          setProjectProgress(99)
          navAnimFrameRef.current = requestAnimationFrame(tickNav)
        } else {
          // Both 5s minimum AND destination readiness satisfied!
          triggerProjectExit()
        }
      }

      navAnimFrameRef.current = requestAnimationFrame(tickNav)

      // Safety fallback timeout: prevent permanently stuck loader (max 12s)
      safetyTimeoutRef.current = setTimeout(() => {
        triggerProjectExit()
      }, 12000)
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

    if (
      pathname.startsWith('/work/') &&
      pathname !== originPathRef.current
    ) {
      hasDestinationMountedRef.current = true
      const elapsed = performance.now() - navStartTimeRef.current
      // If 5 seconds have ALREADY elapsed when destination page finishes loading, exit now
      if (elapsed >= LOADER_DURATION_MS) {
        triggerProjectExit()
      }
      // Otherwise, tickNav will trigger exit smoothly as soon as it reaches 5s!
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

      {/* 1. INITIAL WEBSITE ENTRY LOADER (5s) */}
      {initialLoading && (
        <ArchitecturalLoaderView
          title={studioName || 'S_Designs'}
          subtitle={studioSubtitle}
          progress={initialProgress}
          isExiting={initialExiting}
        />
      )}

      {/* 2. PROJECT NAVIGATION LOADER (5s) */}
      {projectLoading && (
        <ArchitecturalLoaderView
          title={studioName || 'S_Designs'}
          subtitle={studioSubtitle}
          progress={projectProgress}
          isExiting={projectExiting}
          isProject
        />
      )}
    </ArchitecturalLoaderContext.Provider>
  )
}
