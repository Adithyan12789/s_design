'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type HeroCinematicProps = {
  eyebrow?: string
  titleLine1?: string
  titleLine2?: string
  description?: string
  indexText?: string
  imageUrl?: string
  mediaType?: 'image' | 'video'
  videoUrl?: string
  posterUrl?: string
  targetSectionId?: string
  studioName?: string
  studioSubtitle?: string
}

export function HeroCinematic({
  eyebrow = 'Independent architecture studio · Portugal / Worldwide',
  titleLine1 = 'Spaces with',
  titleLine2 = 'quiet presence.',
  description = 'We shape considered places for living, working and gathering — grounded in material, light and context.',
  indexText = '01 / 04',
  imageUrl = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=90',
  mediaType = 'image',
  videoUrl,
  posterUrl,
  targetSectionId = '#studio',
  studioName = 'S_DE_SIGN',
  studioSubtitle = 'ARCHITECTURE & SPATIAL PRACTICE',
}: HeroCinematicProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const pinnedRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const lightSweepRef = useRef<HTMLDivElement | null>(null)
  const blueprintSvgRef = useRef<SVGSVGElement | null>(null)
  const brandRevealRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const bottomCopyRef = useRef<HTMLParagraphElement | null>(null)
  const circleLinkRef = useRef<HTMLAnchorElement | null>(null)
  const indexRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const pinned = pinnedRef.current
    const imageEl = imageRef.current
    const svgEl = blueprintSvgRef.current
    if (!wrapper || !pinned || !imageEl) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const headerEl = document.querySelector('.site-header') as HTMLElement | null

    // If prefers-reduced-motion, show content statically without pinned scrub
    if (prefersReducedMotion) {
      if (headerEl) gsap.set(headerEl, { y: 0, opacity: 1 })
      gsap.set(imageEl, { scale: 1.0, opacity: 1 })
      gsap.set(contentRef.current, { opacity: 1 })
      gsap.set(brandRevealRef.current, { opacity: 1 })
      return
    }

    const ctx = gsap.context(() => {
      // 1. Prepare SVG blueprint paths for progressive drafting
      const paths = svgEl?.querySelectorAll<SVGPathElement | SVGCircleElement | SVGLineElement>('.blueprint-draw') || []
      const texts = svgEl?.querySelectorAll<SVGTextElement>('.blueprint-text') || []

      paths.forEach((item) => {
        let length = 300
        if ('getTotalLength' in item && typeof item.getTotalLength === 'function') {
          try {
            length = item.getTotalLength() || 300
          } catch {
            length = 300
          }
        }
        gsap.set(item, {
          strokeDasharray: length + 2,
          strokeDashoffset: length + 2,
          opacity: 0,
        })
      })

      gsap.set(texts, { opacity: 0, y: 6 })

      // 2. Set Initial States (STAGE 1: 100% Clean Architectural Photograph)
      // ABSOLUTELY NO text, NO linework, NO overlays, NO branding on load.
      gsap.set(imageEl, { scale: 1.0, xPercent: 0, yPercent: 0, opacity: 1 })
      gsap.set(overlayRef.current, { opacity: 0 })
      gsap.set(lightSweepRef.current, { xPercent: -130, opacity: 0 })
      gsap.set(svgEl, { opacity: 0 })
      gsap.set(brandRevealRef.current, { opacity: 0, y: 35 })
      gsap.set(contentRef.current, { opacity: 0 })
      if (headerEl) {
        gsap.set(headerEl, { y: -30, opacity: 0 })
      }

      const headlineWords = titleRef.current?.querySelectorAll('.hero-word-inner') || []
      gsap.set(headlineWords, { y: '120%', opacity: 0 })
      gsap.set(eyebrowRef.current, { y: 20, opacity: 0 })
      gsap.set(bottomCopyRef.current, { y: 24, opacity: 0 })
      gsap.set(circleLinkRef.current, { scale: 0.6, opacity: 0 })
      gsap.set(indexRef.current, { y: 15, opacity: 0 })

      // 3. Pinned Scroll-Driven Architectural Master Timeline (Stages 1 through 8)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: '+=280%',
          pin: pinned,
          scrub: 1.15,
          anticipatePin: 1,
        },
      })

      // STAGE 2: Subtle Cinematic Camera Zoom & Perspective Drift (0.0 -> 1.5)
      // Header also glides in gently once scrolling commences
      tl.to(
        imageEl,
        {
          scale: 1.07,
          xPercent: -1.2,
          yPercent: -1.5,
          ease: 'power1.inOut',
          duration: 2.0,
        },
        0
      )

      if (headerEl) {
        tl.to(
          headerEl,
          {
            y: 0,
            opacity: 1,
            ease: 'power2.out',
            duration: 1.0,
          },
          0.3
        )
      }

      // STAGE 3 & 4: Fine Blueprint Drafting Lines & Structural Geometry (1.0 -> 4.5)
      // The architectural drawing unfolds across the building facade
      tl.to(
        svgEl,
        {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        },
        1.0
      )

      tl.to(
        paths,
        {
          strokeDashoffset: 0,
          opacity: 1,
          stagger: {
            each: 0.05,
            from: 'start',
          },
          duration: 2.8,
          ease: 'power2.out',
        },
        1.2
      )

      tl.to(
        texts,
        {
          opacity: 0.85,
          y: 0,
          stagger: 0.06,
          duration: 1.4,
          ease: 'power2.out',
        },
        2.2
      )

      // STAGE 5: Blueprint-to-Reality Transition & Light/Shadow Movement (4.2 -> 6.2)
      // Architectural sunlight sweep travels diagonally across the facade
      tl.to(
        lightSweepRef.current,
        {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.in',
        },
        4.0
      )
        .to(
          lightSweepRef.current,
          {
            xPercent: 140,
            duration: 2.4,
            ease: 'power1.inOut',
          },
          4.0
        )
        .to(
          lightSweepRef.current,
          {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          5.8
        )

      // Linework dissolves into a subtle watermark as physical architecture takes center stage
      tl.to(
        svgEl,
        {
          opacity: 0.22,
          duration: 1.5,
          ease: 'power2.out',
        },
        4.8
      )

      // Dark gradient overlay deepens to give contrast for typography
      tl.to(
        overlayRef.current,
        {
          opacity: 0.72,
          duration: 1.8,
          ease: 'power2.out',
        },
        4.8
      )

      // STAGE 6: Studio Typography Reveal (5.8 -> 7.8)
      // Grand oversized studio name S_DE_SIGN emerges with architectural datum line
      tl.to(
        brandRevealRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1.6,
          ease: 'power3.out',
        },
        5.8
      )

      // STAGE 7: Supporting Headline, Description & Exploratory CTA (7.4 -> 9.4)
      // Transition from oversized brand emblem to full editorial hero message
      tl.to(
        brandRevealRef.current,
        {
          scale: 0.94,
          opacity: 0.18,
          y: -25,
          duration: 1.6,
          ease: 'power2.out',
        },
        7.4
      )

      tl.to(
        contentRef.current,
        {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        },
        7.6
      )

      tl.to(
        eyebrowRef.current,
        {
          y: 0,
          opacity: 0.95,
          duration: 0.8,
          ease: 'power2.out',
        },
        7.7
      )

      tl.to(
        headlineWords,
        {
          y: '0%',
          opacity: 1,
          stagger: 0.08,
          duration: 1.2,
          ease: 'power4.out',
        },
        7.9
      )

      tl.to(
        bottomCopyRef.current,
        {
          y: 0,
          opacity: 0.95,
          duration: 0.8,
          ease: 'power2.out',
        },
        8.5
      )

      tl.to(
        circleLinkRef.current,
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'back.out(1.5)',
        },
        8.8
      )

      tl.to(
        indexRef.current,
        {
          y: 0,
          opacity: 0.7,
          duration: 0.6,
          ease: 'power2.out',
        },
        9.0
      )

      // STAGE 8: Complete reveal & settle ready for Section 01 (#studio)
      tl.to(
        pinned,
        {
          duration: 0.6,
          ease: 'none',
        },
        9.4
      )
    }, wrapper)

    return () => ctx.revert()
  }, [])

  const line1Words = titleLine1.split(' ')
  const line2Words = titleLine2.split(' ')

  const isVideoUrlPattern = (url?: string) =>
    Boolean(url && (/\.(mp4|webm|mov|ogg|m4v|mkv)($|\?)/i.test(url) || url.includes('/video/upload/')))

  const activeVideoUrl =
    (mediaType === 'video' && videoUrl) ||
    videoUrl ||
    (imageUrl && isVideoUrlPattern(imageUrl) ? imageUrl : undefined)

  const isVideo =
    Boolean(activeVideoUrl) &&
    (mediaType === 'video' || Boolean(videoUrl) || isVideoUrlPattern(activeVideoUrl))

  const posterImage =
    posterUrl ||
    (imageUrl && !isVideoUrlPattern(imageUrl) ? imageUrl : undefined)

  return (
    <div ref={wrapperRef} className="story-hero-wrapper" id="top">
      <section ref={pinnedRef} className="story-hero-pinned">
        {/* Full-bleed Architectural Photograph or Video (Clean on Stage 1) */}
        <div
          ref={imageRef}
          className="story-hero-bg overflow-hidden"
          style={!isVideo || !activeVideoUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
          role="img"
          aria-label="Contemporary minimalist architectural concrete residence"
        >
          {isVideo && activeVideoUrl && (
            <video
              key={activeVideoUrl}
              ref={(el) => {
                if (el) {
                  el.muted = true
                  el.play().catch(() => {})
                }
              }}
              src={activeVideoUrl}
              poster={posterImage}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover pointer-events-none"
            />
          )}
        </div>

        {/* Natural Architectural Sunlight Sweep Layer */}
        <div ref={lightSweepRef} className="story-light-sweep" aria-hidden="true" />

        {/* Atmospheric Contrast Overlay (Reveals only on scroll) */}
        <div ref={overlayRef} className="story-hero-overlay" aria-hidden="true" />

        {/* Architectural Blueprint & Structural Geometry SVG Layer */}
        <svg
          ref={blueprintSvgRef}
          className="story-blueprint-svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g className="blueprint-group" stroke="currentColor">
            {/* 1. Structural Column Axes */}
            <line className="blueprint-draw grid-line" x1="240" y1="60" x2="240" y2="820" />
            <line className="blueprint-draw grid-line" x1="560" y1="60" x2="560" y2="820" />
            <line className="blueprint-draw grid-line" x1="880" y1="60" x2="880" y2="820" />
            <line className="blueprint-draw grid-line" x1="1200" y1="60" x2="1200" y2="820" />

            {/* Axis Bubbles & Notations */}
            <circle className="blueprint-draw axis-bubble" cx="240" cy="80" r="14" />
            <circle className="blueprint-draw axis-bubble" cx="560" cy="80" r="14" />
            <circle className="blueprint-draw axis-bubble" cx="880" cy="80" r="14" />
            <circle className="blueprint-draw axis-bubble" cx="1200" cy="80" r="14" />

            <text className="blueprint-text axis-label" x="240" y="84">A</text>
            <text className="blueprint-text axis-label" x="560" y="84">B</text>
            <text className="blueprint-text axis-label" x="880" y="84">C</text>
            <text className="blueprint-text axis-label" x="1200" y="84">D</text>

            {/* 2. Elevation Datum Levels */}
            <line className="blueprint-draw datum-line" x1="140" y1="300" x2="1340" y2="300" />
            <line className="blueprint-draw datum-line" x1="140" y1="490" x2="1340" y2="490" />
            <line className="blueprint-draw datum-line" x1="60" y1="710" x2="1380" y2="710" />

            <text className="blueprint-text datum-label" x="1240" y="294">ROOF +6.800</text>
            <text className="blueprint-text datum-label" x="1240" y="484">LEVEL 02 +3.400</text>
            <text className="blueprint-text datum-label" x="1240" y="704">DATUM ±0.000</text>

            {/* 3. Building Structural Silhouettes (Concrete cantilevers & slabs) */}
            <path className="blueprint-draw structural-box" d="M 320 300 L 1140 300 L 1140 490 L 320 490 Z" />
            <path className="blueprint-draw structural-box" d="M 220 490 L 1260 490 L 1260 710 L 220 710 Z" />
            <line className="blueprint-draw overhang-projection" x1="320" y1="300" x2="220" y2="490" />
            <line className="blueprint-draw overhang-projection" x1="1140" y1="300" x2="1260" y2="490" />

            {/* Facade Vertical Slats / Mullions */}
            <line className="blueprint-draw mullion" x1="380" y1="300" x2="380" y2="490" />
            <line className="blueprint-draw mullion" x1="440" y1="300" x2="440" y2="490" />
            <line className="blueprint-draw mullion" x1="500" y1="300" x2="500" y2="490" />
            <line className="blueprint-draw mullion" x1="620" y1="300" x2="620" y2="490" />
            <line className="blueprint-draw mullion" x1="680" y1="300" x2="680" y2="490" />
            <line className="blueprint-draw mullion" x1="740" y1="300" x2="740" y2="490" />
            <line className="blueprint-draw mullion" x1="800" y1="300" x2="800" y2="490" />
            <line className="blueprint-draw mullion" x1="940" y1="300" x2="940" y2="490" />
            <line className="blueprint-draw mullion" x1="1000" y1="300" x2="1000" y2="490" />
            <line className="blueprint-draw mullion" x1="1060" y1="300" x2="1060" y2="490" />

            {/* 4. S_Design Architectural Arch Proportions & Compass Circles */}
            <circle className="blueprint-draw compass-circle" cx="720" cy="400" r="140" />
            <circle className="blueprint-draw compass-circle" cx="720" cy="400" r="230" />
            <circle className="blueprint-draw compass-circle" cx="720" cy="400" r="320" />

            <path className="blueprint-draw arch-path" d="M 620 540 C 620 420 670 320 720 240" />
            <path className="blueprint-draw arch-path" d="M 820 540 C 820 420 770 320 720 240" />
            <circle className="blueprint-draw arch-keystone" cx="720" cy="240" r="4" />
            <line className="blueprint-draw arch-baseline" x1="600" y1="540" x2="840" y2="540" />

            {/* 5. Architectural Dimension Notations & Coordinates */}
            <line className="blueprint-draw dimension-line" x1="320" y1="240" x2="1140" y2="240" />
            <line className="blueprint-draw dimension-tick" x1="320" y1="230" x2="320" y2="250" />
            <line className="blueprint-draw dimension-tick" x1="1140" y1="230" x2="1140" y2="250" />
            <text className="blueprint-text dimension-text" x="720" y="234">DIMENSION: 18 400 mm</text>

            <text className="blueprint-text spec-badge" x="140" y="850">
              SCALE 1:50 · CONCRETE RESIDENCE · LISBON
            </text>
            <text className="blueprint-text spec-badge text-right" x="1300" y="850">
              COORD: 38° 43&apos; 20&quot; N · 9° 08&apos; 21&quot; W
            </text>
          </g>
        </svg>

        {/* STAGE 6: Oversized Studio Branding Typography Reveal */}
        <div ref={brandRevealRef} className="story-brand-reveal" aria-hidden="true">
          <div className="brand-datum-ruler">
            <span className="ruler-line" />
            <span className="ruler-badge">DRAFTING SHEET 01 / FORM</span>
            <span className="ruler-line" />
          </div>
          <h2 className="story-brand-title">{studioName}</h2>
          <p className="story-brand-subtitle">{studioSubtitle}</p>
        </div>

        {/* STAGE 7: Supporting Headline, Description & CTA */}
        <div ref={contentRef} className="story-hero-content">
          <div className="story-eyebrow-wrap">
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

          <div className="cinematic-hero-bottom">
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

        {/* Corner Index Indicator */}
        <div ref={indexRef} className="cinematic-hero-index">
          {indexText}
        </div>
      </section>
    </div>
  )
}
