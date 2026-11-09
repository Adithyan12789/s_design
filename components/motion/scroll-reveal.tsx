'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type ScrollRevealProps = {
  children: React.ReactNode
  variant?: 'fade-up' | 'fade-in' | 'stagger-children' | 'scale-up'
  delay?: number
  duration?: number
  stagger?: number
  className?: string
  start?: string
  once?: boolean
}

export function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 1.0,
  stagger = 0.08,
  className = '',
  start = 'top 86%',
  once = true,
}: ScrollRevealProps) {
  const elRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      if (variant === 'fade-up') {
        gsap.fromTo(
          el,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration,
            delay,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start,
              once,
            },
          }
        )
      } else if (variant === 'scale-up') {
        gsap.fromTo(
          el,
          { scale: 0.94, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration,
            delay,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start,
              once,
            },
          }
        )
      } else if (variant === 'stagger-children') {
        const targets = el.children
        gsap.fromTo(
          targets,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration,
            delay,
            stagger,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start,
              once,
            },
          }
        )
      } else {
        gsap.fromTo(
          el,
          { opacity: 0 },
          {
            opacity: 1,
            duration,
            delay,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start,
              once,
            },
          }
        )
      }
    }, el)

    return () => ctx.revert()
  }, [variant, delay, duration, stagger, start, once])

  return (
    <div ref={elRef} className={`scroll-reveal-box ${className}`}>
      {children}
    </div>
  )
}

