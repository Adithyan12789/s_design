'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface SmoothScrollContextType {
  lenis: Lenis | null
  scrollTo: (
    target: string | number | HTMLElement,
    options?: {
      offset?: number
      duration?: number
      immediate?: boolean
      lock?: boolean
      onComplete?: () => void
    }
  ) => void
  stop: () => void
  start: () => void
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
})

export function useLenis() {
  return useContext(SmoothScrollContext)
}

function scrollToHashTarget(
  targetHash: string,
  lenis: Lenis | null,
  immediate = false
): boolean {
  if (!targetHash || targetHash === '#') return false
  const id = targetHash.replace(/^#/, '')
  const element = document.getElementById(id)
  if (!element) return false

  if (lenis) {
    lenis.start()
    lenis.scrollTo(element, {
      offset: 0,
      duration: immediate ? 0 : 1.2,
      immediate,
    })
  } else {
    element.scrollIntoView({
      behavior: immediate ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return true
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null)
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  // Initialize Lenis once for public pages
  useEffect(() => {
    // Keep admin area completely on standard native browser scrolling
    if (isAdmin) {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
        setLenisInstance(null)
      }
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      return
    }

    // Configure Lenis with balanced cinematic momentum
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
      infinite: false,
      autoResize: true,
    })

    lenisRef.current = lenis
    setLenisInstance(lenis)

    // Synchronize Lenis scrolling with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Unified animation loop using GSAP's requestAnimationFrame ticker
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tickerCallback)
    // Disable lag smoothing in GSAP to prevent desync or jumpiness
    gsap.ticker.lagSmoothing(0)

    // Event listeners for external controls (e.g. full-nav-overlay)
    const onLenisStop = () => lenis.stop()
    const onLenisStart = () => lenis.start()
    const onLenisScrollTo = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          target?: string | number | HTMLElement
          offset?: number
          duration?: number
          immediate?: boolean
        }>
      ).detail

      if (detail?.target !== undefined) {
        if (typeof detail.target === 'string' && detail.target.startsWith('#')) {
          scrollToHashTarget(detail.target, lenis, detail.immediate)
        } else {
          lenis.scrollTo(detail.target, {
            offset: detail.offset ?? 0,
            duration: detail.duration ?? 1.2,
            immediate: detail.immediate ?? false,
          })
        }
      }
    }
    const onLenisResize = () => {
      lenis.resize()
      ScrollTrigger.refresh()
    }

    // Intercept same-page hash links (e.g. #contact, #top, /#services on /)
    const handleHashLinkClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const anchor = (event.target as HTMLElement | null)?.closest('a')
      if (!anchor) return

      const rawHref = anchor.getAttribute('href')
      if (!rawHref || !rawHref.includes('#')) return

      try {
        const url = new URL(anchor.href, window.location.href)
        if (url.pathname === window.location.pathname && url.hash) {
          if (url.hash === '#top' || url.hash === '#') {
            event.preventDefault()
            window.history.replaceState(null, '', url.hash)
            lenis.scrollTo(0, { offset: 0, duration: 1.2 })
            window.dispatchEvent(
              new CustomEvent('site:hashchange', { detail: { hash: url.hash } })
            )
            return
          }

          const targetExists = document.getElementById(url.hash.slice(1))
          if (targetExists) {
            event.preventDefault()
            window.history.replaceState(null, '', url.hash)
            window.dispatchEvent(
              new CustomEvent('site:hashchange', { detail: { hash: url.hash } })
            )
            scrollToHashTarget(url.hash, lenis)
          }
        }
      } catch {
        // Ignore invalid URL
      }
    }

    window.addEventListener('lenis:stop', onLenisStop)
    window.addEventListener('lenis:start', onLenisStart)
    window.addEventListener('lenis:scrollTo', onLenisScrollTo)
    window.addEventListener('lenis:resize', onLenisResize)
    document.addEventListener('click', handleHashLinkClick)

    const handleResize = () => {
      lenis.resize()
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('lenis:stop', onLenisStop)
      window.removeEventListener('lenis:start', onLenisStart)
      window.removeEventListener('lenis:scrollTo', onLenisScrollTo)
      window.removeEventListener('lenis:resize', onLenisResize)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('click', handleHashLinkClick)

      gsap.ticker.remove(tickerCallback)
      lenis.destroy()
      lenisRef.current = null
      setLenisInstance(null)
    }
  }, [isAdmin])

  // Handle route changes and cross-page navigation
  const prevPathnameRef = useRef<string>(pathname)
  useEffect(() => {
    if (isAdmin) return

    const lenis = lenisRef.current
    const isNewPage = prevPathnameRef.current !== pathname
    prevPathnameRef.current = pathname

    if (isNewPage) {
      const hash = window.location.hash
      if (!hash) {
        // Reset scroll to top immediately on new page to prevent lingering scroll momentum
        if (lenis) {
          lenis.scrollTo(0, { immediate: true })
        } else {
          window.scrollTo(0, 0)
        }
        requestAnimationFrame(() => {
          ScrollTrigger.refresh()
        })
      } else {
        // If navigating to a new page with a hash, wait for DOM render and scroll to it
        const timer = setTimeout(() => {
          scrollToHashTarget(hash, lenisRef.current)
          ScrollTrigger.refresh()
        }, 120)
        return () => clearTimeout(timer)
      }
    }
  }, [pathname, isAdmin])

  const scrollTo = useCallback(
    (
      target: string | number | HTMLElement,
      options?: {
        offset?: number
        duration?: number
        immediate?: boolean
        lock?: boolean
        onComplete?: () => void
      }
    ) => {
      const lenis = lenisRef.current
      if (lenis) {
        lenis.scrollTo(target, options)
      } else if (typeof target === 'number') {
        window.scrollTo({
          top: target,
          behavior: options?.immediate ? 'auto' : 'smooth',
        })
      } else if (typeof target === 'string') {
        scrollToHashTarget(target, null, options?.immediate)
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({
          behavior: options?.immediate ? 'auto' : 'smooth',
          block: 'start',
        })
      }
    },
    []
  )

  const stop = useCallback(() => {
    lenisRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    lenisRef.current?.start()
  }, [])

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisInstance,
        scrollTo,
        stop,
        start,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  )
}

