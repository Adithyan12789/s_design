'use client'

import { useEffect, useRef } from 'react'
import { ArrowDownRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type HeroCinematicProps = {
  eyebrow: string
  titleLine1: string
  titleLine2: string
  description: string
  indexText: string
  imageUrl: string
  targetSectionId?: string
}

export function HeroCinematic({
  eyebrow,
  titleLine1,
  titleLine2,
  description,
  indexText,
  imageUrl,
  targetSectionId = '#work',
}: HeroCinematicProps) {
  const heroRef = useRef<HTMLElement | null>(null)
  const imageRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const bottomCopyRef = useRef<HTMLParagraphElement | null>(null)
  const circleLinkRef = useRef<HTMLAnchorElement | null>(null)
  const indexRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const heroEl = heroRef.current
    const imageEl = imageRef.current
    const contentEl = contentRef.current
    if (!heroEl || !imageEl) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const words = titleRef.current?.querySelectorAll('.hero-word-inner') || []
    const headerEl = document.querySelector('.site-header')

    const ctx = gsap.context(() => {
      // 1. Set Initial States (inspired by FIND Real Estate)
      gsap.set(imageEl, { scale: 1.25, opacity: 0 })
      if (headerEl) gsap.set(headerEl, { y: -35, opacity: 0 })
      gsap.set(eyebrowRef.current, { y: 22, opacity: 0 })
      gsap.set(words, { y: '125%', opacity: 0 })
      gsap.set(bottomCopyRef.current, { y: 26, opacity: 0 })
      gsap.set(circleLinkRef.current, { scale: 0.6, opacity: 0 })
      gsap.set(indexRef.current, { y: 16, opacity: 0 })

      // 2. FIND Real Estate Cinematic Entrance Timeline
      const tl = gsap.timeline({ delay: 0.12 })

      // A. Smooth scale-down of hero image with depth
      tl.to(imageEl, {
        scale: 1.0,
        opacity: 1,
        duration: 2.2,
        ease: 'power3.out',
      })

      // B. Top navigation drops in
      if (headerEl) {
        tl.to(
          headerEl,
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
          },
          0.2
        )
      }

      // C. Eyebrow badge reveals
      tl.to(
        eyebrowRef.current,
        {
          y: 0,
          opacity: 0.95,
          duration: 0.85,
          ease: 'power2.out',
        },
        0.35
      )

      // D. Staggered masked word slide-up for massive typography
      tl.to(
        words,
        {
          y: '0%',
          opacity: 1,
          duration: 1.2,
          stagger: 0.08,
          ease: 'power4.out',
        },
        0.45
      )

      // E. Bottom description slides & fades in
      tl.to(
        bottomCopyRef.current,
        {
          y: 0,
          opacity: 0.95,
          duration: 0.9,
          ease: 'power2.out',
        },
        0.88
      )

      // F. Circular exploratory CTA pops in
      tl.to(
        circleLinkRef.current,
        {
          scale: 1,
          opacity: 1,
          duration: 0.85,
          ease: 'back.out(1.5)',
        },
        0.98
      )

      // G. Corner index indicator
      tl.to(
        indexRef.current,
        {
          y: 0,
          opacity: 0.68,
          duration: 0.7,
          ease: 'power2.out',
        },
        1.08
      )

      // 3. Cinematic Scroll Scrub: Parallax Image + Fading Typography
      gsap.to(imageEl, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: heroEl,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      if (contentEl) {
        gsap.to(contentEl, {
          yPercent: -12,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: heroEl,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    }, heroEl)

    return () => ctx.revert()
  }, [])

  const line1Words = titleLine1.split(' ')
  const line2Words = titleLine2.split(' ')

  return (
    <section ref={heroRef} className="hero cinematic-hero" id="top">
      <div
        ref={imageRef}
        className="hero-image cinematic-hero-image"
        style={{ backgroundImage: `url(${imageUrl})` }}
        role="img"
        aria-label="Minimal concrete home surrounded by trees"
      />
      <div className="hero-overlay cinematic-hero-overlay" />

      <div ref={contentRef} className="hero-content cinematic-hero-content">
        <div className="hero-eyebrow-wrap">
          <p ref={eyebrowRef} className="eyebrow">
            {eyebrow}
          </p>
        </div>

        <h1 ref={titleRef} className="cinematic-hero-title">
          <span className="hero-title-line">
            {line1Words.map((word, i) => (
              <span key={i} className="hero-word-wrapper">
                <span className="hero-word-inner">{word}</span>
              </span>
            ))}
          </span>
          <span className="hero-title-line accent-line">
            {line2Words.map((word, i) => (
              <span key={i} className="hero-word-wrapper">
                <span className="hero-word-inner is-accent">
                  <em>{word}</em>
                </span>
              </span>
            ))}
          </span>
        </h1>

        <div className="hero-bottom cinematic-hero-bottom">
          <p ref={bottomCopyRef}>{description}</p>
          <a
            ref={circleLinkRef}
            className="circle-link"
            href={targetSectionId}
            aria-label="Explore selected work"
          >
            <ArrowDownRight size={23} />
          </a>
        </div>
      </div>

      <div ref={indexRef} className="hero-index cinematic-hero-index">
        {indexText}
      </div>
    </section>
  )
}


