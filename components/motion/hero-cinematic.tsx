'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
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
  const bgPhotoRef = useRef<HTMLDivElement | null>(null)
  const vignetteRef = useRef<HTMLDivElement | null>(null)
  const initialPromptsRef = useRef<HTMLDivElement | null>(null)
  const maskStageRef = useRef<HTMLDivElement | null>(null)

  // 4 Independent Volumetric Fog Layers
  const fogGroundRef = useRef<HTMLDivElement | null>(null)
  const fogWispsRef = useRef<HTMLDivElement | null>(null)
  const fogCumulusRef = useRef<HTMLDivElement | null>(null)
  const fogHazeRef = useRef<HTMLDivElement | null>(null)

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
    // 1. Organic Micro-Mist Canvas Simulation (Scroll-Synchronized)
    // -------------------------------------------------------------
    const canvas = canvasRef.current
    let animFrameId: number | null = null
    let globalMistIntensity = 0.0

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
            radius: Math.random() * 240 + 150,
            vx: Math.random() * 0.32 + 0.12,
            vy: (Math.random() - 0.5) * 0.08,
            baseAlpha: Math.random() * 0.07 + 0.035,
            phase: Math.random() * Math.PI * 2,
          })
        }

        let time = 0
        const renderMist = () => {
          time += 0.007
          ctx2d.clearRect(0, 0, width, height)

          if (globalMistIntensity > 0.01) {
            for (let i = 0; i < particles.length; i++) {
              const p = particles[i]
              p.x += p.vx
              p.y += Math.sin(time + p.phase) * 0.3

              if (p.x - p.radius > width) {
                p.x = -p.radius
                p.y = Math.random() * height
              }

              const alpha = p.baseAlpha * globalMistIntensity
              const grad = ctx2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius)
              grad.addColorStop(0, `rgba(240, 236, 226, ${alpha})`)
              grad.addColorStop(0.5, `rgba(235, 230, 218, ${alpha * 0.45})`)
              grad.addColorStop(1, 'rgba(235, 230, 218, 0)')

              ctx2d.fillStyle = grad
              ctx2d.beginPath()
              ctx2d.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
              ctx2d.fill()
            }
          }

          animFrameId = requestAnimationFrame(renderMist)
        }

        animFrameId = requestAnimationFrame(renderMist)
      }
    }

    // -------------------------------------------------------------
    // 2. Coordinated GSAP ScrollTrigger Master Timeline
    // -------------------------------------------------------------
    const headerEl = document.querySelector('.site-header')

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(bgPhotoRef.current, { opacity: 1, scale: 1 })
        gsap.set(maskStageRef.current, { opacity: 1, y: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' })
        gsap.set(editorialCardRef.current, { opacity: 1, y: 0 })
        return
      }

      // -----------------------------------------------------------
      // INITIAL STATE (STAGE 1): Full-Screen Architectural Image FIRST
      // No large typography or studio name at the beginning.
      // -----------------------------------------------------------
      gsap.set(bgPhotoRef.current, { opacity: 1, scale: 1.04, yPercent: 0 })
      gsap.set(vignetteRef.current, { opacity: 0.25 })

      // Typography is strictly hidden at initial screen
      gsap.set(maskStageRef.current, {
        opacity: 0,
        visibility: 'hidden',
        y: 40,
        scale: 0.94,
        clipPath: 'inset(100% 0% 0% 0%)',
      })

      // Fog layers are strictly hidden at initial screen
      gsap.set(fogGroundRef.current, { xPercent: 15, yPercent: 0, opacity: 0 })
      gsap.set(fogWispsRef.current, { xPercent: -30, opacity: 0 })
      gsap.set(fogCumulusRef.current, { xPercent: -20, scale: 1.0, opacity: 0 })
      gsap.set(fogHazeRef.current, { opacity: 0 })

      // Editorial card is hidden at initial screen
      gsap.set(editorialCardRef.current, { opacity: 0, y: 35, scale: 0.97 })

      // Initial clean minimal prompts are visible
      gsap.set(initialPromptsRef.current, { opacity: 0, y: 15 })

      if (headerEl) gsap.set(headerEl, { y: -35, opacity: 0 })

      // Page Load Entrance (Scroll = 0)
      const entranceTl = gsap.timeline({ delay: 0.12 })

      if (headerEl) {
        entranceTl.to(headerEl, {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
        })
      }

      // Background image slow cinematic breathe into scale: 1.0
      entranceTl.to(
        bgPhotoRef.current,
        {
          scale: 1.0,
          duration: 2.0,
          ease: 'power2.out',
        },
        0.1
      )

      // Minimal eyebrow and scroll prompt fade in smoothly
      entranceTl.to(
        initialPromptsRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
        },
        0.55
      )

      // -----------------------------------------------------------
      // MASTER SCROLL TIMELINE (7 COORIDINATED STAGES)
      // -----------------------------------------------------------
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: pinWrapper,
          start: 'top top',
          end: '+=300%',
          pin: stageEl,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress

            // Synchronize micro-mist intensity
            if (p < 0.28) {
              globalMistIntensity = 0.0
            } else if (p < 0.55) {
              globalMistIntensity = Math.min(1.0, (p - 0.28) / 0.25)
            } else if (p < 0.85) {
              globalMistIntensity = Math.max(0, 1 - (p - 0.55) / 0.3)
            } else {
              globalMistIntensity = 0.0
            }

            // HUD Stage Indicator
            if (hudFillRef.current) {
              hudFillRef.current.style.width = `${Math.round(p * 100)}%`
            }
            if (hudTextRef.current) {
              if (p < 0.14) {
                hudTextRef.current.innerText = 'STAGE 01 // ARCHITECTURAL CANVAS'
              } else if (p < 0.32) {
                hudTextRef.current.innerText = 'STAGE 02 // CINEMATIC DRIFT'
              } else if (p < 0.52) {
                hudTextRef.current.innerText = 'STAGE 03 // ATMOSPHERIC MIST'
              } else if (p < 0.74) {
                hudTextRef.current.innerText = 'STAGE 04 // TYPOGRAPHY REVEAL'
              } else if (p < 0.86) {
                hudTextRef.current.innerText = 'STAGE 05 // BRANDING MONOGRAPH'
              } else if (p < 0.97) {
                hudTextRef.current.innerText = 'STAGE 06 // STUDIO ETHOS'
              } else {
                hudTextRef.current.innerText = 'STAGE 07 // EXPLORE STUDIO'
              }
            }
          },
        },
      })

      // STAGE 1 -> STAGE 2 (0.00 - 0.14): Clean UI exit, subtle image drift begins
      masterTl
        .to(
          initialPromptsRef.current,
          {
            opacity: 0,
            y: -20,
            duration: 0.14,
            ease: 'power2.in',
          },
          0.0
        )
        .to(
          bgPhotoRef.current,
          {
            scale: 1.08,
            yPercent: -6,
            duration: 0.45,
            ease: 'none',
          },
          0.0
        )
        .to(
          vignetteRef.current,
          {
            opacity: 0.58,
            duration: 0.45,
            ease: 'none',
          },
          0.0
        )

      // STAGE 3 (0.18 - 0.52): Atmospheric fog moves across the architectural photograph
      masterTl
        // Low Ground Mist sweeps across lower third
        .to(
          fogGroundRef.current,
          {
            xPercent: -28,
            yPercent: -6,
            opacity: 0.85,
            duration: 0.45,
            ease: 'none',
          },
          0.16
        )
        // High Wisps drift across upper half
        .to(
          fogWispsRef.current,
          {
            xPercent: 18,
            opacity: 0.78,
            duration: 0.45,
            ease: 'none',
          },
          0.18
        )
        // Central Cumulus rolls in diagonally
        .to(
          fogCumulusRef.current,
          {
            xPercent: 16,
            scale: 1.32,
            opacity: 0.92,
            duration: 0.45,
            ease: 'none',
          },
          0.2
        )
        // Deep Haze softly diffuses background
        .to(
          fogHazeRef.current,
          {
            opacity: 0.55,
            duration: 0.4,
            ease: 'none',
          },
          0.2
        )

      // STAGE 4 (0.46 - 0.72): Oversized studio name reveals progressively through fog
      masterTl
        .set(maskStageRef.current, { visibility: 'visible' }, 0.44)
        .to(
          maskStageRef.current,
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            y: 0,
            scale: 1.0,
            duration: 0.28,
            ease: 'power3.out',
          },
          0.46
        )
        // Fog drifts across the letters, partially concealing and parting around them
        .to(
          fogCumulusRef.current,
          {
            xPercent: 36,
            scale: 1.45,
            opacity: 0.35,
            duration: 0.3,
            ease: 'power2.out',
          },
          0.52
        )
        .to(
          fogWispsRef.current,
          {
            xPercent: 38,
            opacity: 0.2,
            duration: 0.28,
            ease: 'power2.out',
          },
          0.52
        )

      // STAGE 5 (0.72 - 0.86): Typography branding locks in with architectural imagery in letters
      masterTl
        .to(
          maskStageRef.current,
          {
            scale: 1.03,
            duration: 0.18,
            ease: 'power2.out',
          },
          0.72
        )
        .to(
          fogGroundRef.current,
          {
            opacity: 0.12,
            duration: 0.2,
            ease: 'power2.out',
          },
          0.72
        )

      // STAGE 6 (0.84 - 0.96): Supporting headline, description, and CTA appear smoothly
      masterTl.to(
        editorialCardRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1.0,
          duration: 0.14,
          ease: 'power3.out',
        },
        0.84
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
        {/* Layer 1: Full-Bleed Architectural Photograph (Clean and visible from the start) */}
        <div
          ref={bgPhotoRef}
          className="scroll-hero-full-photo"
          style={{ backgroundImage: `url(${imageUrl})` }}
          role="img"
          aria-label="Monolithic contemporary architectural villa"
        />

        {/* Ambient Vignette Overlay (Subtly darkens only as typography reveals) */}
        <div ref={vignetteRef} className="scroll-hero-ambient-vignette" aria-hidden="true" />

        {/* Subtle Architectural Blueprint Precision Grid */}
        <div className="hero-ambient-blueprint-grid" aria-hidden="true" />

        {/* Layer 2: Deep Ambient Volumetric Haze */}
        <div
          ref={fogHazeRef}
          className="fog-layer fog-layer--haze"
          style={{ backgroundImage: 'url(/fog-bank-3.png)', opacity: 0 }}
          aria-hidden="true"
        />

        {/* Layer 3: High Altitude Wispy Cloud Drift */}
        <div
          ref={fogWispsRef}
          className="fog-layer fog-layer--wisps"
          style={{ backgroundImage: 'url(/fog-high-wisps.png)', opacity: 0 }}
          aria-hidden="true"
        />

        {/* Layer 4: Central Billowing Cumulus Fog Bank */}
        <div
          ref={fogCumulusRef}
          className="fog-layer fog-layer--cumulus"
          style={{ backgroundImage: 'url(/fog-dense-cumulus.png)', opacity: 0 }}
          aria-hidden="true"
        />

        {/* Layer 5: Dynamic Micro-Mist Particle Canvas */}
        <canvas ref={canvasRef} className="scroll-hero-canvas-mist" aria-hidden="true" />

        {/* Layer 6: Low Mountain Ground Mist */}
        <div
          ref={fogGroundRef}
          className="fog-layer fog-layer--ground"
          style={{ backgroundImage: 'url(/fog-ground-mist.png)', opacity: 0 }}
          aria-hidden="true"
        />

        {/* Layer 7: Architectural Emblem + Oversized Studio Typography (Revealed through fog on scroll) */}
        <div
          ref={maskStageRef}
          className="scroll-hero-mask-stage"
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          <div className="scroll-hero-revealed-emblem" aria-hidden="true">
            <Image
              src="/s-design-emblem-white.png"
              alt="S_Designs Arch Blueprint"
              width={76}
              height={76}
              className="scroll-hero-emblem-img"
              priority
            />
          </div>
          <div className="scroll-hero-masked-headline">
            <span
              className="masked-line masked-line--primary"
              style={{ backgroundImage: `url(${imageUrl})` }}
            >
              S_DE_SIGN
            </span>
            <span className="masked-line-sub">
              — STUDIO —
            </span>
          </div>
        </div>

        {/* Stage 1: Initial Minimal Screen UI (No oversized typography at beginning) */}
        <div ref={initialPromptsRef} className="scroll-hero-initial-ui">
          <div className="scroll-hero-top-eyebrow">
            <span className="dot">●</span>
            <span>{eyebrow}</span>
          </div>

          <div className="scroll-hero-bottom-bar">
            <p className="scroll-hero-description">{description}</p>

            <div className="scroll-indicator-wrap" aria-hidden="true">
              <div className="scroll-indicator-mouse">
                <div className="scroll-indicator-dot" />
              </div>
              <span>Scroll to explore</span>
            </div>

            <a
              className="circle-link"
              href={targetSectionId}
              aria-label="Explore selected work"
            >
              <ArrowDownRight size={22} />
            </a>
          </div>
        </div>

        {/* Stage 6: Editorial Monograph Card (Appears after studio branding) */}
        <div ref={editorialCardRef} className="scroll-hero-editorial-card" style={{ opacity: 0 }}>
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
              <span>ALENTEJO &middot; PORTUGAL</span>
              <span>420 M&sup2;</span>
              <span>{indexText}</span>
            </div>
            <a href="#studio" className="submit-button" style={{ padding: '12px 20px' }}>
              <span>Studio Philosophy</span>
              <ArrowDownRight size={16} />
            </a>
          </div>
        </div>

        {/* HUD Corner Stage Tracker (7 Stages) */}
        <div className="scroll-hero-hud-progress" aria-hidden="true">
          <span ref={hudTextRef}>STAGE 01 // ARCHITECTURAL CANVAS</span>
          <div className="hud-progress-track">
            <div ref={hudFillRef} className="hud-progress-fill" />
          </div>
        </div>
      </section>
    </div>
  )
}
