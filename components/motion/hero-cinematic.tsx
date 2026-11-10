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
  const pinWrapperRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLElement | null>(null)
  const portalMaskRef = useRef<HTMLDivElement | null>(null)
  const initialUiRef = useRef<HTMLDivElement | null>(null)
  const scrollCueRef = useRef<HTMLDivElement | null>(null)
  const maskStageRef = useRef<HTMLDivElement | null>(null)
  const revealedImgRef = useRef<HTMLDivElement | null>(null)
  const fogDeepRef = useRef<HTMLDivElement | null>(null)
  const fogMidRef = useRef<HTMLDivElement | null>(null)
  const fogForeRef = useRef<HTMLDivElement | null>(null)
  const editorialCardRef = useRef<HTMLDivElement | null>(null)
  const hudFillRef = useRef<HTMLDivElement | null>(null)
  const hudTextRef = useRef<HTMLSpanElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const pinWrapper = pinWrapperRef.current
    const stageEl = stageRef.current
    if (!pinWrapper || !stageEl) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // -------------------------------------------------------------
    // 1. Lightweight Volumetric Mist Canvas Simulation
    // -------------------------------------------------------------
    const canvas = canvasRef.current
    let animFrameId: number | null = null

    if (canvas && !prefersReducedMotion) {
      const ctx2d = canvas.getContext('2d')
      if (ctx2d) {
        let width = (canvas.width = window.innerWidth)
        let height = (canvas.height = window.innerHeight)

        const handleResize = () => {
          if (!canvas) return
          width = canvas.width = window.innerWidth
          height = canvas.height = window.innerHeight
        }
        window.addEventListener('resize', handleResize)

        const particles: Array<{
          x: number
          y: number
          radius: number
          vx: number
          vy: number
          baseAlpha: number
          phase: number
        }> = []

        for (let i = 0; i < 22; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 260 + 160,
            vx: Math.random() * 0.35 + 0.15,
            vy: (Math.random() - 0.5) * 0.1,
            baseAlpha: Math.random() * 0.08 + 0.04,
            phase: Math.random() * Math.PI * 2,
          })
        }

        let time = 0
        const renderMist = () => {
          time += 0.008
          ctx2d.clearRect(0, 0, width, height)

          for (let i = 0; i < particles.length; i++) {
            const p = particles[i]
            p.x += p.vx
            p.y += Math.sin(time + p.phase) * 0.35

            if (p.x - p.radius > width) {
              p.x = -p.radius
              p.y = Math.random() * height
            }

            const grad = ctx2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius)
            grad.addColorStop(0, `rgba(240, 236, 226, ${p.baseAlpha})`)
            grad.addColorStop(0.5, `rgba(235, 230, 218, ${p.baseAlpha * 0.5})`)
            grad.addColorStop(1, 'rgba(235, 230, 218, 0)')

            ctx2d.fillStyle = grad
            ctx2d.beginPath()
            ctx2d.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
            ctx2d.fill()
          }

          animFrameId = requestAnimationFrame(renderMist)
        }

        animFrameId = requestAnimationFrame(renderMist)
      }
    }

    // -------------------------------------------------------------
    // 2. GSAP ScrollTrigger Master Timeline
    // -------------------------------------------------------------
    const headerEl = document.querySelector('.site-header')

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Fallback for reduced motion
        gsap.set(portalMaskRef.current, { display: 'none' })
        gsap.set(revealedImgRef.current, { opacity: 0.9, scale: 1 })
        gsap.set(editorialCardRef.current, { opacity: 1, y: 0 })
        if (headerEl) gsap.set(headerEl, { y: 0, opacity: 1 })
        return
      }

      // Initial Entrance State (Scroll = 0):
      // Only the image mask is shown! Header, site name, and details are hidden.
      gsap.set(portalMaskRef.current, { scale: 0.92, opacity: 0 })
      gsap.set(maskStageRef.current, { opacity: 0, scale: 0.85, y: 30 })
      gsap.set(revealedImgRef.current, { opacity: 0, scale: 1.15 })
      gsap.set(editorialCardRef.current, { opacity: 0, y: 40 })
      gsap.set(initialUiRef.current, { opacity: 0, y: 15 })
      gsap.set(scrollCueRef.current, { opacity: 0, y: 15 })

      // Header is initially hidden so the user sees ONLY the pure image mask first
      if (headerEl) gsap.set(headerEl, { y: -40, opacity: 0 })

      // Baseline fog presence
      gsap.set(fogForeRef.current, { xPercent: 15, opacity: 0 })
      gsap.set(fogMidRef.current, { xPercent: -20, opacity: 0 })
      gsap.set(fogDeepRef.current, { xPercent: 5, opacity: 0 })

      const entranceTl = gsap.timeline({ delay: 0.15 })

      // 1. Reveal pure image mask portal smoothly
      entranceTl.to(portalMaskRef.current, {
        scale: 1.0,
        opacity: 1,
        duration: 1.5,
        ease: 'power3.out',
      })

      // 2. Introduce atmospheric fog gently
      entranceTl.to(
        [fogDeepRef.current, fogMidRef.current, fogForeRef.current],
        {
          opacity: (i) => (i === 0 ? 0.25 : i === 1 ? 0.35 : 0.45),
          duration: 1.6,
          ease: 'power2.out',
          stagger: 0.15,
        },
        0.35
      )

      // 3. Show subtle scroll cue at bottom
      entranceTl.to(
        scrollCueRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
        },
        0.8
      )

      // -----------------------------------------------------------
      // Master Scroll-Driven Pin Scrub Timeline
      // When user scrolls -> Details, Site Name, and Texts Reveal!
      // -----------------------------------------------------------
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: pinWrapper,
          start: 'top top',
          end: '+=250%',
          pin: stageEl,
          scrub: 1.1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress
            if (hudFillRef.current) {
              hudFillRef.current.style.width = `${Math.round(p * 100)}%`
            }
            if (hudTextRef.current) {
              if (p < 0.22) {
                hudTextRef.current.innerText = 'STAGE 01 // IMAGE MASK'
              } else if (p < 0.55) {
                hudTextRef.current.innerText = 'STAGE 02 // SITE NAME REVEAL'
              } else if (p < 0.82) {
                hudTextRef.current.innerText = 'STAGE 03 // IMAGE EXPANSION'
              } else {
                hudTextRef.current.innerText = 'STAGE 04 // EDITORIAL SETTLE'
              }
            }
          },
        },
      })

      masterTl
        // 1. Bottom cue fades out as soon as scroll begins
        .to(
          scrollCueRef.current,
          {
            opacity: 0,
            y: -15,
            duration: 0.15,
            ease: 'power2.in',
          },
          0.0
        )

        // 2. Portal mask scales and cross-fades into masked typography (Site Name)
        .to(
          portalMaskRef.current,
          {
            scale: 1.35,
            opacity: 0,
            duration: 0.35,
            ease: 'power2.inOut',
          },
          0.0
        )

        // 3. REVEAL SITE NAME & TEXTS ON SCROLL:
        // Masked typography with S_DE_SIGN and QUIET PRESENCE fades in and scales
        .to(
          maskStageRef.current,
          {
            opacity: 1,
            scale: 1.25,
            y: 0,
            duration: 0.38,
            ease: 'power3.out',
          },
          0.05
        )

      // Fixed site header (Brand logo, navigation) drops in from top as user scrolls
      if (headerEl) {
        masterTl.to(
          headerEl,
          {
            y: 0,
            opacity: 1,
            duration: 0.3,
            ease: 'power3.out',
          },
          0.08
        )
      }

      masterTl
        // Initial eyebrow & prompt details reveal
        .to(
          initialUiRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          },
          0.1
        )
        // Then fade out initial cues as zoom accelerates
        .to(
          initialUiRef.current,
          {
            opacity: 0,
            y: -25,
            duration: 0.2,
            ease: 'power2.in',
          },
          0.4
        )

        // 4. Atmospheric Volumetric Fog Layers Sweep Across
        .to(
          fogForeRef.current,
          {
            xPercent: -35,
            opacity: 0.88,
            duration: 0.45,
            ease: 'none',
          },
          0.0
        )
        .to(
          fogForeRef.current,
          {
            xPercent: -60,
            opacity: 0.2,
            duration: 0.45,
            ease: 'power2.out',
          },
          0.45
        )

        .to(
          fogMidRef.current,
          {
            xPercent: 20,
            scale: 1.35,
            opacity: 0.95,
            duration: 0.5,
            ease: 'none',
          },
          0.05
        )
        .to(
          fogMidRef.current,
          {
            xPercent: 45,
            opacity: 0.2,
            duration: 0.4,
            ease: 'power2.out',
          },
          0.55
        )

        .to(
          fogDeepRef.current,
          {
            xPercent: -20,
            opacity: 0.75,
            duration: 0.5,
            ease: 'none',
          },
          0.0
        )
        .to(
          fogDeepRef.current,
          {
            opacity: 0.1,
            duration: 0.4,
            ease: 'power2.out',
          },
          0.5
        )

        // 5. Masked Typography Zooms into Full Aperture
        .to(
          maskStageRef.current,
          {
            scale: 7.5,
            y: -30,
            opacity: 0,
            duration: 0.45,
            ease: 'power2.in',
          },
          0.38
        )

        // 6. Full-Bleed Architectural Photograph Seamlessly Cross-Fades In
        .to(
          revealedImgRef.current,
          {
            opacity: 1,
            scale: 1.0,
            duration: 0.45,
            ease: 'power2.out',
          },
          0.42
        )

        // 7. Stage 4: Editorial Details & Monograph Card Reveal
        .to(
          editorialCardRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.28,
            ease: 'power3.out',
          },
          0.72
        )
    }, stageEl)

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId)
      window.removeEventListener('resize', () => {})
      ctx.revert()
    }
  }, [])

  return (
    <div ref={pinWrapperRef} className="hero-scroll-pin-wrapper">
      <section ref={stageRef} className="hero-scroll-stage" id="top">
        {/* Subtle Architectural Blueprint Grid */}
        <div className="hero-ambient-blueprint-grid" aria-hidden="true" />

        {/* Layer 1: Full-Bleed Revealed Architectural Photograph */}
        <div
          ref={revealedImgRef}
          className="scroll-hero-revealed-image"
          style={{ backgroundImage: `url(${imageUrl})` }}
          role="img"
          aria-label="Monolithic contemporary architectural villa"
        >
          <div className="scroll-hero-revealed-overlay" />
        </div>

        {/* Layer 2: Deep Volumetric Fog Bank */}
        <div
          ref={fogDeepRef}
          className="fog-layer fog-layer--deep"
          style={{ backgroundImage: 'url(/fog-bank-3.png)' }}
          aria-hidden="true"
        />

        {/* Stage 0/1: PURE INITIAL IMAGE MASK (Only image shown first!) */}
        <div ref={portalMaskRef} className="scroll-hero-portal-mask">
          <div
            className="portal-mask-image"
            style={{ backgroundImage: `url(${imageUrl})` }}
            role="img"
            aria-label="Pure architectural image mask"
          />
          <div className="portal-mask-glow" />
        </div>

        {/* Stage 2: Oversized Typography with Image Masking (Site Name & Texts Reveal on Scroll) */}
        <div ref={maskStageRef} className="scroll-hero-mask-stage">
          <div className="scroll-hero-masked-headline">
            <span
              className="masked-line masked-line--primary"
              style={{ backgroundImage: `url(${imageUrl})` }}
            >
              S_DE_SIGN
            </span>
            <span
              className="masked-line masked-line--secondary"
              style={{ backgroundImage: `url(${imageUrl})` }}
            >
              {titleLine2 || 'QUIET PRESENCE'}
            </span>
          </div>
        </div>

        {/* Layer 4: Midground Volumetric Fog Bank */}
        <div
          ref={fogMidRef}
          className="fog-layer fog-layer--mid"
          style={{ backgroundImage: 'url(/fog-bank-2.png)' }}
          aria-hidden="true"
        />

        {/* Layer 5: Canvas Micro-Mist Particle Simulation */}
        <canvas ref={canvasRef} className="scroll-hero-canvas-mist" aria-hidden="true" />

        {/* Layer 6: Foreground Volumetric Fog Bank */}
        <div
          ref={fogForeRef}
          className="fog-layer fog-layer--fore"
          style={{ backgroundImage: 'url(/fog-bank-1.png)' }}
          aria-hidden="true"
        />

        {/* Pure Initial Minimal Scroll Cue (Visible at scroll 0) */}
        <div
          ref={scrollCueRef}
          className="scroll-indicator-wrap"
          style={{
            position: 'absolute',
            bottom: '7vh',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 22,
          }}
          aria-hidden="true"
        >
          <div className="scroll-indicator-mouse">
            <div className="scroll-indicator-dot" />
          </div>
          <span style={{ letterSpacing: '0.28em' }}>Scroll to reveal</span>
        </div>

        {/* Editorial Prompts (Reveals on Scroll) */}
        <div ref={initialUiRef} className="scroll-hero-initial-ui">
          <div className="scroll-hero-top-eyebrow">
            <span className="dot">●</span>
            <span>{eyebrow}</span>
          </div>

          <div className="scroll-hero-bottom-bar">
            <p className="scroll-hero-description">{description}</p>

            <a
              className="circle-link"
              href={targetSectionId}
              aria-label="Explore selected work"
            >
              <ArrowDownRight size={22} />
            </a>
          </div>
        </div>

        {/* Stage 4: Final Editorial Monograph Card with Full Details */}
        <div ref={editorialCardRef} className="scroll-hero-editorial-card">
          <div className="editorial-card-kicker">
            ( 01 ) MONOGRAPH · MONOLITHIC HORIZON
          </div>
          <h2>
            Spaces with <em>quiet presence.</em>
          </h2>
          <p>
            Architecture formed by monolithic earth, balanced light, and raw spatial honesty.
            We shape considered sanctuaries grounded in material permanence and context.
          </p>
          <div className="editorial-card-footer">
            <div className="editorial-meta-tags">
              <span>LISBON &middot; WORLDWIDE</span>
              <span>EST. 2018</span>
              <span>{indexText}</span>
            </div>
            <a href="#studio" className="submit-button" style={{ padding: '12px 20px' }}>
              <span>Studio Philosophy</span>
              <ArrowDownRight size={16} />
            </a>
          </div>
        </div>

        {/* HUD Corner Index & Stage Progress */}
        <div className="scroll-hero-hud-progress" aria-hidden="true">
          <span ref={hudTextRef}>STAGE 01 // IMAGE MASK</span>
          <div className="hud-progress-track">
            <div ref={hudFillRef} className="hud-progress-fill" />
          </div>
        </div>
      </section>
    </div>
  )
}
