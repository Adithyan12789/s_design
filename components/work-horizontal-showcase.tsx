'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowDown, Compass } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Project } from '@/lib/projects'

gsap.registerPlugin(ScrollTrigger)

type WorkHorizontalShowcaseProps = {
  id?: string
  projects: Project[]
}

const SLIDE_ASPECTS = [
  'aspect-editorial-wide',
  'aspect-editorial-tall',
  'aspect-editorial-square',
  'aspect-editorial-cinema',
  'aspect-editorial-tall',
  'aspect-editorial-wide',
] as const

export function WorkHorizontalShowcase({ id = 'selected-work', projects }: WorkHorizontalShowcaseProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
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

    mm.add('(min-width: 768px)', () => {
      const ctx = gsap.context(() => {
        const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[]
        if (slides.length === 0) return

        // Measure so Project 0 starts centered and last project ends centered
        const computeTravel = () => {
          const firstSlide = slides[0]
          const lastSlide = slides[slides.length - 1]
          const firstCenter = firstSlide.offsetLeft + firstSlide.offsetWidth / 2
          const lastCenter = lastSlide.offsetLeft + lastSlide.offsetWidth / 2
          return Math.max(0, lastCenter - firstCenter)
        }

        // Initialize slides' initial scale/opacity emphasis cleanly
        const updateSlideEmphasis = () => {
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

            // Normalized distance (0 at exact center, 1+ at edges)
            const norm = Math.min(1.2, dist / (window.innerWidth * 0.55))
            const scale = 1 - norm * 0.1
            const opacity = Math.max(0.32, 1 - norm * 0.58)

            gsap.set(slide, {
              scale,
              opacity,
            })

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

        // Initial emphasis state before first scroll
        updateSlideEmphasis()

        const travelTween = gsap.to(track, {
          x: () => -computeTravel(),
          ease: 'none',
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
              updateSlideEmphasis()
            },
            onRefresh: () => {
              updateSlideEmphasis()
            },
          },
        })

        if (travelTween.scrollTrigger) {
          triggerInstanceRef.current = travelTween.scrollTrigger
        }
      }, section)

      return () => {
        triggerInstanceRef.current = null
        ctx.revert()
      }
    })

    // Mobile vertical architectural reveal
    mm.add('(max-width: 767px)', () => {
      const ctx = gsap.context(() => {
        const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[]
        slides.forEach((slide) => {
          gsap.fromTo(
            slide,
            { opacity: 0.4, y: 28 },
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

  const activeProject = projects[activeIndex] || projects[0]

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
            <span>SELECTED WORKS ARCHIVE</span>
            <span className="kicker-divider">/</span>
            <span className="kicker-sub">2021 — 2024</span>
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
                  {/* Floating Slide Index Tag */}
                  <div className="slide-number-badge">
                    <span>0{index + 1}</span>
                    <span className="slide-line" />
                    <span>{project.year}</span>
                  </div>

                  {/* Primary Dominant Architectural Frame */}
                  <Link
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
                    <span className="secondary-frame-caption">
                      {project.area} · {project.category}
                    </span>
                  </div>

                  {/* Mobile-Only Card Details (Hidden on Desktop where bottom HUD updates) */}
                  <div className="exhibition-mobile-details">
                    <span className="mobile-meta">
                      0{index + 1} / 0{projects.length} — {project.location} · {project.category}
                    </span>
                    <h2>{project.title}</h2>
                    <p>{project.description}</p>
                    <Link href={`/work/${project.slug}`} className="exhibition-explore-btn">
                      <span>Explore Project</span>
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {/* Synchronized Active Project Typography & Editorial HUD (Desktop/Tablet) */}
        <div className="exhibition-bottom-hud">
          <div className="hud-project-identity">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject.slug}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="hud-motion-wrap"
              >
                <div className="hud-meta-row">
                  <span className="hud-index">
                    0{activeIndex + 1} / 0{projects.length}
                  </span>
                  <span className="hud-dot" />
                  <span>{activeProject.location}</span>
                  <span className="hud-dot" />
                  <span className="hud-category">{activeProject.category}</span>
                  <span className="hud-dot" />
                  <span>{activeProject.year}</span>
                </div>

                <h2 className="hud-project-title">{activeProject.title}</h2>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="hud-project-narrative">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeProject.slug}-desc`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.34, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="hud-narrative-inner"
              >
                <p className="hud-description">{activeProject.description}</p>
                <div className="hud-actions">
                  <Link
                    href={`/work/${activeProject.slug}`}
                    className="exhibition-explore-btn"
                  >
                    <span>Explore Project</span>
                    <ArrowUpRight size={16} />
                  </Link>
                  <span className="hud-specs-note">
                    {activeProject.area} · {activeProject.type}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
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
