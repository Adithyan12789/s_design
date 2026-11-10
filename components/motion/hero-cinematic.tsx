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
  const initialUiRef = useRef<HTMLDivElement | null>(null)
  const maskStageRef = useRef<HTMLDivElement | null>(null)
  const revealedImgRef = useRef<HTMLDivElement | null>(null)
  
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
    let globalMistIntensity = 1.0

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

        // Generate 24 organic multi-scale mist puffs
        const particles: Array<{
          x: number
          y: number
          radius: number
          vx: number
          vy: number
          baseAlpha: number
          phase: number
        }> = []

        for (let i = 0; i < 24; i++) {
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

          // Only render if mist is active
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
        gsap.set(revealedImgRef.current, {
          opacity: 0.9,
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
        })
        gsap.set(editorialCardRef.current, { opacity: 1, y: 0 })
        return
      }

      // Initial States before user interaction
      gsap.set(maskStageRef.current, { scale: 0.95, opacity: 0, y: 30 })
      gsap.set(revealedImgRef.current, {
        opacity: 0,
        scale: 1.14,
        clipPath: 'inset(18% 12% 18% 12% round 14px)',
        filter: 'brightness(0.72) contrast(1.18) saturate(0.88)',
      })
      gsap.set(editorialCardRef.current, { opacity: 0, y: 38, scale: 0.97 })
      
      // Initial Fog States
      gsap.set(fogGroundRef.current, { xPercent: 12, yPercent: 0, opacity: 0 })
      gsap.set(fogWispsRef.current, { xPercent: -30, opacity: 0 })
      gsap.set(fogCumulusRef.current, { xPercent: -20, scale: 1.05, opacity: 0 })
      gsap.set(fogHazeRef.current, { xPercent: 8, opacity: 0 })
      gsap.set(initialUiRef.current, { opacity: 0, y: 18 })

      if (headerEl) gsap.set(headerEl, { y: -35, opacity: 0 })

      // Stage 01 Entrance (Initial landing at scroll 0)
      const entranceTl = gsap.timeline({ delay: 0.12 })

      if (headerEl) {
        entranceTl.to(headerEl, {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
        })
      }

      entranceTl.to(
        maskStageRef.current,
        {
          scale: 1.0,
          opacity: 1,
          y: 0,
          duration: 1.3,
          ease: 'power3.out',
        },
        0.18
      )

      entranceTl.to(
        [
          fogHazeRef.current,
          fogCumulusRef.current,
          fogWispsRef.current,
          fogGroundRef.current,
        ],
        {
          opacity: (i) => (i === 0 ? 0.25 : i === 1 ? 0.22 : i === 2 ? 0.26 : 0.36),
          duration: 1.5,
          ease: 'power2.out',
          stagger: 0.12,
        },
        0.35
      )

      entranceTl.to(
        initialUiRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power2.out',
        },
        0.65
      )

      // -------------------------------------------------------------
      // Master Scrubbed Scroll Timeline (One Synchronized Engine)
      // -------------------------------------------------------------
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: pinWrapper,
          start: 'top top',
          end: '+=280%',
          pin: stageEl,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress

            // Synchronize canvas mist intensity with scroll
            if (p < 0.45) {
              globalMistIntensity = 1.0
            } else if (p < 0.75) {
              globalMistIntensity = Math.max(0, 1 - (p - 0.45) / 0.3)
            } else {
              globalMistIntensity = 0.0
            }

            // HUD Stage Indicator
            if (hudFillRef.current) {
              hudFillRef.current.style.width = `${Math.round(p * 100)}%`
            }
            if (hudTextRef.current) {
              if (p < 0.2) {
                hudTextRef.current.innerText = 'STAGE 01 // TYPOGRAPHY MASK'
              } else if (p < 0.52) {
                hudTextRef.current.innerText = 'STAGE 02 // ATMOSPHERIC DISPERSAL'
              } else if (p < 0.84) {
                hudTextRef.current.innerText = 'STAGE 03 // ARCHITECTURAL REVEAL'
              } else {
                hudTextRef.current.innerText = 'STAGE 04 // EDITORIAL MONOGRAPH'
              }
            }
          },
        },
      })

      // STAGE 01 -> STAGE 02: Initial UI exit, Typography expansion, Fog flow
      // A. Initial UI cues fade cleanly
      masterTl.to(
        initialUiRef.current,
        {
          opacity: 0,
          y: -24,
          duration: 0.18,
          ease: 'power2.in',
        },
        0.0
      )

      // B. Typography scale transformation with synchronized internal shift
      masterTl
        .to(
          maskStageRef.current,
          {
            scale: 3.4,
            y: -14,
            duration: 0.5,
            ease: 'power2.inOut',
          },
          0.0
        )
        .to(
          maskStageRef.current,
          {
            scale: 7.2,
            y: -32,
            opacity: 0,
            duration: 0.3,
            ease: 'power3.in',
          },
          0.5
        )

      // C. Multi-layer Volumetric Fog choreography with distinct speeds & directions
      // 1. Low Ground Mist: sweeps right-to-left along lower 40%
      masterTl
        .to(
          fogGroundRef.current,
          {
            xPercent: -35,
            yPercent: -8,
            opacity: 0.85,
            duration: 0.48,
            ease: 'none',
          },
          0.0
        )
        .to(
          fogGroundRef.current,
          {
            xPercent: -60,
            opacity: 0.08,
            duration: 0.35,
            ease: 'power2.out',
          },
          0.48
        )

      // 2. High Wisps: drifts left-to-right across upper half
      masterTl
        .to(
          fogWispsRef.current,
          {
            xPercent: 24,
            opacity: 0.78,
            duration: 0.5,
            ease: 'none',
          },
          0.05
        )
        .to(
          fogWispsRef.current,
          {
            xPercent: 48,
            opacity: 0.0,
            duration: 0.3,
            ease: 'power2.out',
          },
          0.55
        )

      // 3. Central Cumulus Bank: rolls diagonally across center
      masterTl
        .to(
          fogCumulusRef.current,
          {
            xPercent: 28,
            scale: 1.34,
            opacity: 0.92,
            duration: 0.48,
            ease: 'none',
          },
          0.04
        )
        .to(
          fogCumulusRef.current,
          {
            xPercent: 55,
            opacity: 0.0,
            duration: 0.32,
            ease: 'power2.out',
          },
          0.52
        )

      // 4. Deep Ambient Haze: subtle background counter-drift
      masterTl
        .to(
          fogHazeRef.current,
          {
            xPercent: -14,
            opacity: 0.55,
            duration: 0.5,
            ease: 'none',
          },
          0.0
        )
        .to(
          fogHazeRef.current,
          {
            opacity: 0.04,
            duration: 0.3,
            ease: 'power2.out',
          },
          0.5
        )

      // STAGE 03: Full-Screen Architectural Image Clip-Path Reveal & Settling
      // The image expands its aperture, settles scale, and brightens to crystal clarity
      masterTl.to(
        revealedImgRef.current,
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          scale: 1.0,
          opacity: 1.0,
          filter: 'brightness(1.0) contrast(1.0) saturate(1.0)',
          duration: 0.34,
          ease: 'power2.out',
        },
        0.5
      )

      // STAGE 04: Editorial Monograph Card Reveal
      // Appears smoothly AFTER the architectural photograph has settled
      masterTl.to(
        editorialCardRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1.0,
          duration: 0.16,
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
        {/* Subtle Architectural Blueprint Precision Grid */}
        <div className="hero-ambient-blueprint-grid" aria-hidden="true" />

        {/* Layer 1: Revealed Full-Bleed Architectural Photograph (Clip-Path Aperture) */}
        <div
          ref={revealedImgRef}
          className="scroll-hero-revealed-image"
          style={{ backgroundImage: `url(${imageUrl})` }}
          role="img"
          aria-label="Monolithic contemporary architectural villa"
        >
          <div className="scroll-hero-revealed-overlay" />
        </div>

        {/* Layer 2: Deep Ambient Volumetric Haze */}
        <div
          ref={fogHazeRef}
          className="fog-layer fog-layer--haze"
          style={{ backgroundImage: 'url(/fog-bank-3.png)' }}
          aria-hidden="true"
        />

        {/* Layer 3: Oversized Typography with Synchronized Architectural Image Mask */}
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

        {/* Layer 4: Central Billowing Cumulus Fog Bank */}
        <div
          ref={fogCumulusRef}
          className="fog-layer fog-layer--cumulus"
          style={{ backgroundImage: 'url(/fog-dense-cumulus.png)' }}
          aria-hidden="true"
        />

        {/* Layer 5: High Altitude Wispy Cloud Drift */}
        <div
          ref={fogWispsRef}
          className="fog-layer fog-layer--wisps"
          style={{ backgroundImage: 'url(/fog-high-wisps.png)' }}
          aria-hidden="true"
        />

        {/* Layer 6: Dynamic Micro-Mist Particle Canvas */}
        <canvas ref={canvasRef} className="scroll-hero-canvas-mist" aria-hidden="true" />

        {/* Layer 7: Low Mountain Ground Mist */}
        <div
          ref={fogGroundRef}
          className="fog-layer fog-layer--ground"
          style={{ backgroundImage: 'url(/fog-ground-mist.png)' }}
          aria-hidden="true"
        />

        {/* Stage 01: Initial Editorial UI Prompts */}
        <div ref={initialUiRef} className="scroll-hero-initial-ui">
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
              <span>Scroll to reveal</span>
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

        {/* Stage 04: Final Editorial Monograph Card */}
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

        {/* HUD Corner Stage Tracker */}
        <div className="scroll-hero-hud-progress" aria-hidden="true">
          <span ref={hudTextRef}>STAGE 01 // TYPOGRAPHY MASK</span>
          <div className="hud-progress-track">
            <div ref={hudFillRef} className="hud-progress-fill" />
          </div>
        </div>
      </section>
    </div>
  )
}
