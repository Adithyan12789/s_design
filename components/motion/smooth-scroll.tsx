'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function scrollToHashTarget(targetHash: string, lenis: Lenis | null, immediate = false) {
  if (!targetHash || targetHash === '#') return false
  const id = targetHash.replace(/^#/, '')
  const element = document.getElementById(id)
  if (!element) return false

  ScrollTrigger.refresh()

  if (lenis) {
    lenis.start()
    lenis.scrollTo(element, {
      offset: 0,
      duration: immediate ? 0 : 1.15,
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
  const pathname = usePathname()

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let lenis: Lenis | null = null
    let tickerCallback: ((time: number) => void) | null = null

    if (!prefersReducedMotion) {
      lenis = new Lenis({
        duration: 1.25,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
      })

      lenisRef.current = lenis
      lenis.on('scroll', ScrollTrigger.update)

      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000)
      }

      gsap.ticker.add(tickerCallback)
      gsap.ticker.lagSmoothing(0)
    }

    const onLenisStop = () => lenis?.stop()
    const onLenisStart = () => lenis?.start()
    const onLenisScrollTo = (event: Event) => {
      const detail = (event as CustomEvent<{ target?: string }>).detail
      if (detail?.target) {
        requestAnimationFrame(() => {
          scrollToHashTarget(detail.target!, lenis, prefersReducedMotion)
        })
      }
    }

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

      const url = new URL(anchor.href, window.location.href)
      if (url.pathname === window.location.pathname && url.hash) {
        const targetExists = document.getElementById(url.hash.slice(1))
        if (targetExists) {
          event.preventDefault()
          window.history.replaceState(null, '', url.hash)
          window.dispatchEvent(new CustomEvent('site:hashchange', { detail: { hash: url.hash } }))
          scrollToHashTarget(url.hash, lenis, prefersReducedMotion)
        }
      }
    }

    window.addEventListener('lenis:stop', onLenisStop)
    window.addEventListener('lenis:start', onLenisStart)
    window.addEventListener('lenis:scrollTo', onLenisScrollTo)
    document.addEventListener('click', handleHashLinkClick)

    return () => {
      window.removeEventListener('lenis:stop', onLenisStop)
      window.removeEventListener('lenis:start', onLenisStart)
      window.removeEventListener('lenis:scrollTo', onLenisScrollTo)
      document.removeEventListener('click', handleHashLinkClick)
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback)
      }
      lenis?.destroy()
      lenisRef.current = null
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  // Handle cross-page hash navigation (e.g. from /work/[slug] -> /#selected-work)
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => {
      scrollToHashTarget(hash, lenisRef.current, prefersReducedMotion)
    }, 120)

    return () => window.clearTimeout(timer)
  }, [pathname])

  return <>{children}</>
}
