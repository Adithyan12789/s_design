'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type ParallaxImageProps = {
  src?: string
  alt?: string
  className?: string
  aspectRatio?: string
  parallaxSpeed?: number
  enableClipReveal?: boolean
  children?: React.ReactNode
}

export function ParallaxImage({
  src,
  alt = 'Architectural space',
  className = '',
  aspectRatio,
  parallaxSpeed = 15,
  enableClipReveal = true,
  children,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const image = imageRef.current
    if (!container || !image) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // 1. Clip-path reveal on scroll entry
      if (enableClipReveal) {
        gsap.fromTo(
          container,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.4,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: container,
              start: 'top 88%',
              once: true,
            },
          }
        )

        gsap.fromTo(
          image,
          { scale: 1.18 },
          {
            scale: 1,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: container,
              start: 'top 88%',
              once: true,
            },
          }
        )
      }

      // 2. Parallax vertical travel during scroll
      gsap.fromTo(
        image,
        { yPercent: -parallaxSpeed },
        {
          yPercent: parallaxSpeed,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      )
    }, container)

    return () => ctx.revert()
  }, [enableClipReveal, parallaxSpeed])

  return (
    <div
      ref={containerRef}
      className={`parallax-image-container ${className}`}
      style={{ aspectRatio }}
    >
      <div
        ref={imageRef}
        className="parallax-image-target"
        style={src ? { backgroundImage: `url(${src})` } : undefined}
        role={src ? 'img' : undefined}
        aria-label={src ? alt : undefined}
      >
        {children}
      </div>
    </div>
  )
}

