'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { ArrowDownRight, Compass } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArchitecturalBlueprintSVG } from './architectural-blueprint-svg'

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
  const pinContainerRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const imageRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const blueprintRef = useRef<HTMLDivElement | null>(null)
  const scrollHintRef = useRef<HTMLDivElement | null>(null)

  // Studio branding & typography elements
  const contentRef = useRef<HTMLDivElement | null>(null)
  const brandingRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const indexRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const pinEl = pinContainerRef.current
    const heroEl = heroRef.current
    const imageEl = imageRef.current
    const overlayEl = overlayRef.current
    const blueprintEl = blueprintRef.current

    if (!pinEl || !heroEl || !imageEl || !blueprintEl) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const headerEl = document.querySelector('.site-header')
    const words = titleRef.current?.querySelectorAll('.hero-word-inner') || []

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Accessibility fallback: Render settled final composition immediately
        gsap.set(imageEl, { scale: 1.0, opacity: 1 })
        gsap.set(overlayEl, { opacity: 0.65 })
        gsap.set(blueprintEl, { opacity: 0.24 })
        gsap.set([brandingRef.current, bottomRef.current, indexRef.current], { opacity: 1, y: 0 })
        gsap.set(words, { y: '0%', opacity: 1 })
        if (scrollHintRef.current) gsap.set(scrollHintRef.current, { display: 'none' })
        if (headerEl) gsap.set(headerEl, { opacity: 1 })
        return
      }

      // =========================================================================
      // 1. INITIAL STATE: Full architectural image — NO text or branding initially
      // =========================================================================
      gsap.set(imageEl, {
        scale: 1.0,
        filter: 'brightness(0.96) contrast(1.02) saturate(1.0)',
        opacity: 1,
      })
      gsap.set(overlayEl, { opacity: 0.28 })

      // Blueprint SVG: invisible at start, line dashes reset
      gsap.set(blueprintEl, { opacity: 0 })
      gsap.set(
        '.bp-line-framing, .bp-line-border, .bp-line-grid, .bp-line-crosshair, .bp-line-level, .bp-line-structure, .bp-line-mullion, .bp-line-dim, .bp-line-dim-ticks, .bp-line-callout, .bp-line-arch, .bp-line-circle, .bp-line-sunpath, .bp-line-foundation-ticks',
        {
          strokeDasharray: '1',
          strokeDashoffset: 1,
        }
      )
      gsap.set('.bp-tag', { opacity: 0, y: 8 })
      gsap.set('.bp-grid-pattern', { opacity: 0 })
      gsap.set('.bp-scanner-wrap', { opacity: 0, x: -140 })

      // Studio Branding & Typography: hidden initially
      gsap.set(brandingRef.current, { opacity: 0, y: -22 })
      gsap.set(words, { y: '120%', opacity: 0 })
      gsap.set(bottomRef.current, { opacity: 0, y: 28 })
      gsap.set(indexRef.current, { opacity: 0, y: 16 })

      // Site Header: starts minimal, fades to full clarity as scroll begins
      if (headerEl) gsap.set(headerEl, { opacity: 0.25 })

      // Initial Scroll Cue: visible
      if (scrollHintRef.current) gsap.set(scrollHintRef.current, { opacity: 1, y: 0 })

      // =========================================================================
      // 2. COORDINATED GSAP TIMELINE: Blueprint-to-Reality Scroll Reveal
      // =========================================================================
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 0.85,
          anticipatePin: 1,
        },
      })

      // STAGE 1: Full Photograph & Subtle Cinematic Movement (0.0 -> 1.5)
      // Fade out the initial scroll indicator as user scrolls
      if (scrollHintRef.current) {
        masterTl.to(
          scrollHintRef.current,
          { opacity: 0, y: -16, duration: 1.0, ease: 'power1.out' },
          0
        )
      }
      // Subtle continuous cinematic zoom and shift of the architectural image
      masterTl.to(imageEl, { scale: 1.05, yPercent: -2, duration: 10, ease: 'none' }, 0)

      if (headerEl) {
        masterTl.to(headerEl, { opacity: 1, duration: 2.0, ease: 'power2.out' }, 1.2)
      }

      // -----------------------------------------------------------------------
      // STAGE 2: Architectural Drawing Reveal (1.5 -> 4.8)
      // Fine blueprint lines progressively draw themselves across the photograph
      // -----------------------------------------------------------------------
      masterTl.to(blueprintEl, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 1.5)
      masterTl.to('.bp-grid-pattern', { opacity: 0.55, duration: 1.8, ease: 'power2.out' }, 1.5)

      // A. Outer Framing, Boundary Rulers & Technical Coordinate Metadata
      masterTl.to(
        '.bp-line-framing, .bp-line-border',
        { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' },
        1.6
      )
      masterTl.to(
        '.bp-meta-top-left, .bp-meta-top-right, .bp-meta-bottom-left, .bp-meta-bottom-right',
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: 'power2.out' },
        2.0
      )

      // B. Structural Column Grid Lines (Axes A, B, C, D) & Bubble Identifiers
      masterTl.to(
        '.bp-line-grid, .bp-line-crosshair',
        { strokeDashoffset: 0, duration: 2.2, stagger: 0.08, ease: 'power2.inOut' },
        2.0
      )
      masterTl.to(
        '.bp-bubble-a, .bp-bubble-b, .bp-bubble-c, .bp-bubble-d',
        { opacity: 1, y: 0, duration: 1.0, stagger: 0.1, ease: 'back.out(1.4)' },
        2.5
      )

      // C. Horizontal Structural Datum Levels (+7.2m, +3.85m, 0.0m, -1.8m)
      masterTl.to(
        '.bp-line-level',
        { strokeDashoffset: 0, duration: 2.0, stagger: 0.1, ease: 'power2.inOut' },
        2.3
      )
      masterTl.to(
        '.bp-level-roof, .bp-level-slab, .bp-level-ground, .bp-level-footing',
        { opacity: 1, y: 0, duration: 1.0, stagger: 0.08, ease: 'power2.out' },
        2.8
      )

      // D. Building Wireframe Elevation (Cantilever Volume, Podia, Mullions, Terraces)
      masterTl.to(
        '.bp-line-structure',
        { strokeDashoffset: 0, duration: 2.6, stagger: 0.12, ease: 'power2.inOut' },
        2.6
      )
      masterTl.to(
        '.bp-line-mullion, .bp-line-foundation-ticks',
        { strokeDashoffset: 0, duration: 1.8, stagger: 0.04, ease: 'power2.inOut' },
        3.2
      )

      // E. Geometric Construction Guides (S_Designs Catenary Arch, Circles & Solar Rays)
      masterTl.to(
        '.bp-line-arch, .bp-line-circle, .bp-line-sunpath',
        { strokeDashoffset: 0, duration: 2.4, stagger: 0.12, ease: 'power2.inOut' },
        3.0
      )
      masterTl.to('.bp-sun-tag', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 3.8)

      // F. Dimension Strings & Engineering Specification Callouts
      masterTl.to(
        '.bp-line-dim, .bp-line-dim-ticks, .bp-line-callout',
        { strokeDashoffset: 0, duration: 1.8, stagger: 0.06, ease: 'power2.inOut' },
        3.4
      )
      masterTl.to(
        '.bp-dim-labels, .bp-callout-1',
        { opacity: 1, y: 0, duration: 1.0, stagger: 0.12, ease: 'power2.out' },
        3.8
      )

      // -----------------------------------------------------------------------
      // STAGE 3: Blueprint-to-Building Transformation (4.8 -> 7.0)
      // The drawings transform into the physical building's structural details
      // -----------------------------------------------------------------------
      // Luminous architectural datum beam sweeps across the structure
      masterTl.to('.bp-scanner-wrap', { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }, 4.7)
      masterTl.to('.bp-scanner-wrap', { x: 1250, duration: 2.8, ease: 'power1.inOut' }, 4.9)
      masterTl.to('.bp-scanner-wrap', { opacity: 0, duration: 0.6, ease: 'power2.in' }, 7.2)

      // Real photography blooms into full contrast, richness, and depth
      masterTl.to(
        imageEl,
        {
          filter: 'brightness(1.02) contrast(1.1) saturate(1.05)',
          duration: 2.4,
          ease: 'power2.out',
        },
        5.2
      )
      masterTl.to(overlayEl, { opacity: 0.62, duration: 2.4, ease: 'power2.out' }, 5.2)

      // The blueprint lines soften into a refined golden structural ghost layer
      masterTl.to(blueprintEl, { opacity: 0.28, duration: 2.2, ease: 'power2.out' }, 5.4)

      // -----------------------------------------------------------------------
      // STAGE 4: Studio Branding & Typography Reveal (7.0 -> 9.4)
      // -----------------------------------------------------------------------
      // A. Studio Architectural Mark & Kicker Badge
      masterTl.to(brandingRef.current, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, 6.9)

      // B. Oversized Editorial Headline ("Spaces with quiet presence.")
      masterTl.to(
        words,
        {
          y: '0%',
          opacity: 1,
          duration: 1.4,
          stagger: 0.09,
          ease: 'power4.out',
        },
        7.3
      )

      // C. Supporting Description Paragraph & Circular Exploratory CTA
      masterTl.to(bottomRef.current, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, 8.0)

      // D. Corner Index Badge
      masterTl.to(indexRef.current, { opacity: 0.75, y: 0, duration: 1.0, ease: 'power2.out' }, 8.4)
    }, pinEl)

    return () => ctx.revert()
  }, [])

  const line1Words = titleLine1.split(' ')
  const line2Words = titleLine2.split(' ')

  return (
    <div ref={pinContainerRef} className="hero-scroll-container">
      <section ref={heroRef} className="hero cinematic-hero blueprint-hero" id="top">
        {/* Layer 1: High-Resolution Architectural Photography */}
        <div
          ref={imageRef}
          className="hero-image cinematic-hero-image blueprint-hero-image"
          style={{ backgroundImage: `url(${imageUrl})` }}
          role="img"
          aria-label="Contemporary concrete villa surrounded by coastal trees"
        />

        {/* Layer 2: Architectural Vignette & Contrast Depth Overlay */}
        <div ref={overlayRef} className="hero-overlay cinematic-hero-overlay blueprint-hero-overlay" />

        {/* Layer 3: Architectural Blueprint SVG Technical Drawing Layer */}
        <div ref={blueprintRef} className="blueprint-svg-wrap">
          <ArchitecturalBlueprintSVG />
        </div>

        {/* Initial Viewport Scroll Cue (Prompts exploration without showing brand/text) */}
        <div ref={scrollHintRef} className="blueprint-scroll-hint" aria-hidden="true">
          <div className="scroll-hint-icon">
            <Compass size={14} />
          </div>
          <span>SCROLL TO CONSTRUCT</span>
          <div className="scroll-hint-line" />
        </div>

        {/* Layer 4: Studio Branding & Typography Content */}
        <div ref={contentRef} className="hero-content cinematic-hero-content blueprint-hero-content">
          {/* Studio Brand Lockup & Kicker */}
          <div ref={brandingRef} className="hero-eyebrow-wrap blueprint-branding-lockup">
            <div className="blueprint-brand-mark" aria-hidden="true">
              <Image
                src="/s-design-emblem-white.png"
                alt="S_Designs Arch Emblem"
                width={28}
                height={28}
                className="blueprint-brand-img"
              />
            </div>
            <div className="blueprint-brand-meta">
              <span className="blueprint-brand-title">S_DE_SIGN</span>
              <span className="blueprint-brand-sub">{eyebrow}</span>
            </div>
          </div>

          {/* Oversized Headline */}
          <h1 ref={titleRef} className="cinematic-hero-title blueprint-hero-title">
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

          {/* Bottom Supporting Description & Exploratory Circle CTA */}
          <div ref={bottomRef} className="hero-bottom cinematic-hero-bottom blueprint-hero-bottom">
            <p>{description}</p>
            <a
              className="circle-link"
              href={targetSectionId}
              aria-label="Explore selected work"
            >
              <ArrowDownRight size={23} />
            </a>
          </div>
        </div>

        {/* Corner Index Indicator */}
        <div ref={indexRef} className="hero-index cinematic-hero-index blueprint-hero-index">
          {indexText}
        </div>
      </section>
    </div>
  )
}
