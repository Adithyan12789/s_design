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
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const bottomCopyRef = useRef<HTMLParagraphElement | null>(null)
  const circleLinkRef = useRef<HTMLAnchorElement | null>(null)
  const indexRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const heroEl = heroRef.current
    const imageEl = imageRef.current
    if (!heroEl || !imageEl) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const words = titleRef.current?.querySelectorAll('.hero-word-inner') || []

    const ctx = gsap.context(() => {
      // 1. Initial State
      gsap.set(imageEl, { scale: 1.16, opacity: 0.85 })
      gsap.set(eyebrowRef.current, { y: 22, opacity: 0 })
      gsap.set(words, { y: '120%', opacity: 0 })
      gsap.set(bottomCopyRef.current, { y: 25, opacity: 0 })
      gsap.set(circleLinkRef.current, { scale: 0.6, opacity: 0 })
      gsap.set(indexRef.current, { y: 16, opacity: 0 })

      // 2. Cinematic Page Entrance Master Timeline
      const tl = gsap.timeline({ delay: 0.25 })

      tl.to(imageEl, {
        scale: 1.02,
        opacity: 1,
        duration: 2.0,
        ease: 'power3.out',
      })
        .to(
          eyebrowRef.current,
          {
            y: 0,
            opacity: 0.95,
            duration: 0.9,
            ease: 'power2.out',
          },
          0.3
        )
        .to(
          words,
          {
            y: '0%',
            opacity: 1,
            duration: 1.15,
            stagger: 0.09,
            ease: 'power3.out',
          },
          0.45
        )
        .to(
          bottomCopyRef.current,
          {
            y: 0,
            opacity: 0.94,
            duration: 0.9,
            ease: 'power2.out',
          },
          0.85
        )
        .to(
          circleLinkRef.current,
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'back.out(1.6)',
          },
          0.95
        )
        .to(
          indexRef.current,
          {
            y: 0,
            opacity: 0.65,
            duration: 0.7,
            ease: 'power2.out',
          },
          1.05
        )

      // 3. Subtle Parallax Scrub on Scroll
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

      <div className="hero-content cinematic-hero-content">
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
                {i < line1Words.length - 1 && '\u00A0'}
              </span>
            ))}
          </span>
          <span className="hero-title-line accent-line">
            {line2Words.map((word, i) => (
              <span key={i} className="hero-word-wrapper">
                <span className="hero-word-inner is-accent">
                  <em>{word}</em>
                </span>
                {i < line2Words.length - 1 && '\u00A0'}
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

