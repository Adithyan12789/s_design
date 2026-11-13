'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowDown, Compass } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Project } from '@/lib/projects'

gsap.registerPlugin(ScrollTrigger)

type WorkHorizontalShowcaseProps = {
  id?: string
  projects: Project[]
  kicker?: string
  heading?: string
}

const SLIDE_ASPECTS = [
  'aspect-editorial-wide',
  'aspect-editorial-tall',
  'aspect-editorial-square',
  'aspect-editorial-cinema',
  'aspect-editorial-tall',
  'aspect-editorial-wide',
] as const

export function WorkHorizontalShowcase({
  id = 'selected-work',
  projects,
  kicker = 'SELECTED WORKS ARCHIVE',
  heading = '2021 — 2024',
}: WorkHorizontalShowcaseProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const slideBadgeRefs = useRef<(HTMLDivElement | null)[]>([])
  const primaryLinkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const primaryImgRefs = useRef<(HTMLDivElement | null)[]>([])
  const secondaryFrameRefs = useRef<(HTMLDivElement | null)[]>([])
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const triggerInstanceRef = useRef<ScrollTrigger | null>(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  const scrollToProject = useCallback((index: number) => {
    const st = triggerInstanceRef.current
    if (!st || projects.length <= 1) return
    const targetProgress = index / (projects.length - 1)
    const targetY = st.start + targetProgress * (st.end - st.start)

    const startY = window.scrollY
    const distance = targetY - startY
    const duration = 680
    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = Math.min(1, (now - startTime) / duration)
      const eased = 1 - Math.pow(1 - elapsed, 3)
      window.scrollTo(0, startY + distance * eased)
      if (elapsed < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [projects.length])

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const track = trackRef.current
    if (!section || !stage || !track || projects.length === 0) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const mm = gsap.matchMedia()

    const setupHorizontalExhibition = (activeScale: number, innerZoomScale: number) => {
      const ctx = gsap.context(() => {
        const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[]
        const primaryLinks = primaryLinkRefs.current.filter(Boolean) as HTMLAnchorElement[]
        if (slides.length === 0) return

        // Measure so Project 0 starts centered and last project ends centered
        const computeTravel = () => {
          const firstSlide = slides[0]
          const lastSlide = slides[slides.length - 1]
          const firstCenter = firstSlide.offsetLeft + firstSlide.offsetWidth / 2
          const lastCenter = lastSlide.offsetLeft + lastSlide.offsetWidth / 2
          return Math.max(0, lastCenter - firstCenter)
        }

        // Update inner image parallax, secondary frame depth & active focus metadata
        const updateParallaxAndActive = () => {
          const viewportCenter = window.innerWidth / 2
          let closestIdx = 0
          let minDist = Infinity

          slides.forEach((slide, i) => {
            const rect = slide.getBoundingClientRect()
            const slideCenter = rect.left + rect.width / 2
            const dist = Math.abs(slideCenter - viewportCenter)

            if (dist < minDist) {
              minDist = dist
              closestIdx = i
            }

            // Inner photograph parallax within frame mask
            const primaryImg = primaryImgRefs.current[i]
            if (primaryImg) {
              const signedOffset = (slideCenter - viewportCenter) / window.innerWidth
              gsap.set(primaryImg, {
                xPercent: Math.max(-10, Math.min(10, signedOffset * -16)),
              })
            }

            // Secondary offset detail frame moves at distinct speed
            const secondaryFrame = secondaryFrameRefs.current[i]
            if (secondaryFrame) {
              const signedOffset = (slideCenter - viewportCenter) / window.innerWidth
              gsap.set(secondaryFrame, {
                x: signedOffset * 72,
                y: signedOffset * -18,
              })
            }
          })

          setActiveIndex((prev) => (prev !== closestIdx ? closestIdx : prev))
        }

        const totalSteps = Math.max(0, slides.length - 1)
        const timelineDuration = Math.max(1, totalSteps)
        const badgeLiftY = activeScale > 1.08 ? -18 : -12

        // Set initial emphasis state (Project 0 begins large & focused; others at scale 1)
        primaryLinks.forEach((linkEl, i) => {
          const isFirst = i === 0
          const slideEl = slides[i]
          const imgEl = primaryImgRefs.current[i]
          const badgeEl = slideBadgeRefs.current[i]

          gsap.set(linkEl, {
            scale: isFirst ? activeScale : 1,
            transformOrigin: 'center center',
          })
          gsap.set(slideEl, {
            opacity: isFirst ? 1 : 0.48,
            zIndex: isFirst ? 6 : 2,
          })
          if (imgEl) {
            gsap.set(imgEl, {
              scale: isFirst ? innerZoomScale : 1,
              transformOrigin: 'center center',
            })
          }
          if (badgeEl) {
            gsap.set(badgeEl, {
              y: isFirst ? badgeLiftY : 0,
            })
          }
        })

        updateParallaxAndActive()

        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            pin: stage,
            start: 'top top',
            end: () => `+=${Math.max(window.innerHeight * 2.8, computeTravel() * 1.15)}`,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              triggerInstanceRef.current = self
              setScrollProgress(self.progress)
              if (progressBarRef.current) {
                progressBarRef.current.style.transform = `scaleX(${self.progress})`
              }
              updateParallaxAndActive()
            },
            onRefresh: () => {
              updateParallaxAndActive()
            },
          },
        })

        // Continuous horizontal gallery track travel synchronized with ScrollTrigger progress
        masterTl.to(
          track,
          {
            x: () => -computeTravel(),
            ease: 'none',
            duration: timelineDuration,
          },
          0
        )

        // Synchronized camera-focus handoff: outgoing shrinks 1.2 -> 1 while incoming zooms 1 -> 1.2
        for (let i = 0; i < totalSteps; i++) {
          const prevLink = primaryLinks[i]
          const nextLink = primaryLinks[i + 1]
          const prevSlide = slides[i]
          const nextSlide = slides[i + 1]
          const prevImg = primaryImgRefs.current[i]
          const nextImg = primaryImgRefs.current[i + 1]
          const prevBadge = slideBadgeRefs.current[i]
          const nextBadge = slideBadgeRefs.current[i + 1]

          if (prevLink) {
            masterTl.fromTo(
              prevLink,
              { scale: activeScale },
              { scale: 1, ease: 'power2.inOut', duration: 1, immediateRender: false },
              i
            )
          }
          if (nextLink) {
            masterTl.fromTo(
              nextLink,
              { scale: 1 },
              { scale: activeScale, ease: 'power2.inOut', duration: 1, immediateRender: false },
              i
            )
          }

          masterTl.fromTo(
            prevSlide,
            { opacity: 1, zIndex: 6 },
            { opacity: 0.48, zIndex: 2, ease: 'power2.inOut', duration: 1, immediateRender: false },
            i
          )
          masterTl.fromTo(
            nextSlide,
            { opacity: 0.48, zIndex: 2 },
            { opacity: 1, zIndex: 6, ease: 'power2.inOut', duration: 1, immediateRender: false },
            i
          )

          if (prevImg) {
            masterTl.fromTo(
              prevImg,
              { scale: innerZoomScale },
              { scale: 1, ease: 'power2.inOut', duration: 1, immediateRender: false },
              i
            )
          }
          if (nextImg) {
            masterTl.fromTo(
              nextImg,
              { scale: 1 },
              { scale: innerZoomScale, ease: 'power2.inOut', duration: 1, immediateRender: false },
              i
            )
          }

          if (prevBadge) {
            masterTl.fromTo(
              prevBadge,
              { y: badgeLiftY },
              { y: 0, ease: 'power2.inOut', duration: 1, immediateRender: false },
              i
            )
          }
          if (nextBadge) {
            masterTl.fromTo(
              nextBadge,
              { y: 0 },
              { y: badgeLiftY, ease: 'power2.inOut', duration: 1, immediateRender: false },
              i
            )
          }
        }

        if (masterTl.scrollTrigger) {
          triggerInstanceRef.current = masterTl.scrollTrigger
        }
      }, section)

      return () => {
        triggerInstanceRef.current = null
        ctx.revert()
      }
    }

    // Desktop: balanced 1.1x active focus zoom for grand imagery
    mm.add('(min-width: 1024px)', () => setupHorizontalExhibition(1.1, 1.04))

    // Tablet: balanced 1.08x zoom intensity to prevent neighbor collisions
    mm.add('(min-width: 768px) and (max-width: 1023px)', () => setupHorizontalExhibition(1.08, 1.03))

    // Mobile: vertical editorial layout with gentle scroll-driven center focus zoom
    mm.add('(max-width: 767px)', () => {
      const ctx = gsap.context(() => {
        const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[]
        slides.forEach((slide, i) => {
          const linkEl = primaryLinkRefs.current[i]
          const imgEl = primaryImgRefs.current[i]

          gsap.fromTo(
            slide,
            { opacity: 0.45, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: slide,
                start: 'top 86%',
                end: 'top 45%',
                toggleActions: 'play none none reverse',
              },
            }
          )

          if (linkEl) {
            gsap.set(linkEl, { scale: 1, transformOrigin: 'center center' })
            const focusTl = gsap.timeline({
              scrollTrigger: {
                trigger: linkEl,
                start: 'top 85%',
                end: 'bottom 15%',
                scrub: 0.8,
              },
            })
            focusTl
              .to(linkEl, { scale: 1.04, ease: 'power2.inOut', duration: 0.5 })
              .to(linkEl, { scale: 1, ease: 'power2.inOut', duration: 0.5 })
            if (imgEl) {
              focusTl
                .to(imgEl, { scale: 1.06, ease: 'power2.inOut', duration: 0.5 }, 0)
                .to(imgEl, { scale: 1, ease: 'power2.inOut', duration: 0.5 }, 0.5)
            }
          }
        })
      }, section)

      return () => ctx.revert()
    })

    const refreshFrame = requestAnimationFrame(() => {
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
    })

    return () => {
      cancelAnimationFrame(refreshFrame)
      mm.revert()
    }
  }, [projects])

  return (
    <section
      id={id}
      ref={sectionRef}
      className="work-exhibition-section"
      aria-label="Selected architectural works horizontal exhibition"
    >
      <div ref={stageRef} className="work-exhibition-stage">
        {/* Subtle Architectural Hairline Grid Backdrop */}
        <div className="exhibition-bg-grid" aria-hidden="true">
          <span className="grid-v-line left" />
          <span className="grid-v-line center" />
          <span className="grid-v-line right" />
          <span className="grid-h-line top" />
          <span className="grid-h-line bottom" />
        </div>

        {/* Top Exhibition Meta Strip */}
        <div className="exhibition-top-bar">
          <div className="exhibition-kicker">
            <Compass size={13} className="text-[var(--bronze-light)]" />
            <span>{kicker}</span>
            {heading && (
              <>
                <span className="kicker-divider">/</span>
                <span className="kicker-sub">{heading}</span>
              </>
            )}
          </div>

          <div className="exhibition-top-right">
            <div className="exhibition-scroll-cue">
              <span>SCROLL TO TRAVEL</span>
              <ArrowDown size={13} className="scroll-cue-arrow" />
            </div>

            <nav className="exhibition-index-nav" aria-label="Jump to project">
              {projects.map((project, idx) => (
                <button
                  key={project.slug}
                  type="button"
                  onClick={() => scrollToProject(idx)}
                  className={`exhibition-index-btn ${idx === activeIndex ? 'is-active' : ''}`}
                  aria-label={`View ${project.title}`}
                  suppressHydrationWarning
                >
                  0{idx + 1}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Horizontal Parallax Gallery Track */}
        <div className="exhibition-viewport">
          <div ref={trackRef} className="exhibition-track">
            {projects.map((project, index) => {
              const aspectClass = SLIDE_ASPECTS[index % SLIDE_ASPECTS.length]
              const secondaryImage = project.gallery[0] || project.image
              const isEven = index % 2 === 0

              return (
                <article
                  key={project.slug}
                  ref={(el) => {
                    slideRefs.current[index] = el as HTMLDivElement | null
                  }}
                  className={`exhibition-slide ${aspectClass} ${index === activeIndex ? 'is-focused' : ''}`}
                >
                  {/* Work Name Above Image (Left-Aligned) */}
                  <div
                    ref={(el) => {
                      slideBadgeRefs.current[index] = el
                    }}
                    className="slide-header-group"
                  >
                    <Link
                      href={`/work/${project.slug}`}
                      className="slide-title-link"
                      aria-label={`View ${project.title}`}
                    >
                      <h2 className="slide-project-title">{project.title}</h2>
                    </Link>
                  </div>

                  {/* Media Stage: Main Image & Secondary Offset Photograph */}
                  <div className="slide-media-stage">
                    {/* Primary Dominant Architectural Frame */}
                    <Link
                      ref={(el) => {
                        primaryLinkRefs.current[index] = el
                      }}
                      href={`/work/${project.slug}`}
                      className="exhibition-primary-link"
                      aria-label={`Explore ${project.title} in ${project.location}`}
                    >
                      <div className="exhibition-frame-mask">
                        <div
                          ref={(el) => {
                            primaryImgRefs.current[index] = el
                          }}
                          className="exhibition-frame-img"
                          style={{ backgroundImage: `url(${project.image})` }}
                        />
                        <div className="exhibition-frame-vignette" />
                        <div className="exhibition-hover-pill">
                          <span>Open Case Study</span>
                          <ArrowUpRight size={14} />
                        </div>
                      </div>
                    </Link>

                    {/* Secondary Offset Architectural Detail Photograph */}
                    <div
                      ref={(el) => {
                        secondaryFrameRefs.current[index] = el
                      }}
                      className={`exhibition-secondary-frame ${isEven ? 'pos-bottom-right' : 'pos-top-right'}`}
                      aria-hidden="true"
                    >
                      <div
                        className="exhibition-secondary-img"
                        style={{ backgroundImage: `url(${secondaryImage})` }}
                      />
                    </div>
                  </div>

                  {/* Short Work Description Below Image with Big Gap */}
                  {project.description && (
                    <div className="slide-description-wrap">
                      <p className="slide-project-description">{project.description}</p>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>

        {/* Continuous Exhibition Scroll Progress Rail */}
        <div className="exhibition-progress-rail" aria-hidden="true">
          <div
            ref={progressBarRef}
            className="exhibition-progress-fill"
            style={{ transform: `scaleX(${scrollProgress})` }}
          />
        </div>
      </div>
    </section>
  )
}
