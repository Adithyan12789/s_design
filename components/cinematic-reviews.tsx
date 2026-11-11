'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Star } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { StaggeredHeading } from '@/components/motion/staggered-heading'

gsap.registerPlugin(ScrollTrigger)

export type ReviewItem = {
  id: string
  client: string
  quote: string
  rating: number
}

type CinematicReviewsProps = {
  id?: string
  reviews: ReviewItem[]
}

const AUTO_PLAY_MS = 6000

export function CinematicReviews({ id = 'reviews', reviews }: CinematicReviewsProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  const [activeIdx, setActiveIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (reducedMotion || isPaused || reviews.length <= 1) return
    const timer = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % reviews.length)
    }, AUTO_PLAY_MS)
    return () => window.clearInterval(timer)
  }, [isPaused, reducedMotion, reviews.length])

  // Subtle GSAP entrance for the spotlight stage
  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        stage,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 1.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  const goPrev = useCallback(() => {
    setActiveIdx((prev) => (prev - 1 + reviews.length) % reviews.length)
  }, [reviews.length])

  const goNext = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % reviews.length)
  }, [reviews.length])

  const activeReview = reviews[activeIdx] || reviews[0]

  return (
    <section
      ref={sectionRef}
      id={id}
      className="reviews section-pad animated-section"
      aria-label="Client reviews"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="reviews-ambient-glow" aria-hidden="true" />

      <div className="reviews-header">
        <div className="section-kicker">
          ( 05 ) <span>Client reviews</span>
        </div>

        <div className="reviews-heading-row">
          <StaggeredHeading
            tag="h2"
            lines={[
              { text: 'Quiet' },
              { text: 'appreciation.', isAccent: true },
            ]}
          />
          <div className="spotlight-controls">
            <button
              type="button"
              onClick={goPrev}
              className="spotlight-nav-btn"
              aria-label="Previous client review"
              suppressHydrationWarning
            >
              <ArrowLeft size={16} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="spotlight-nav-btn"
              aria-label="Next client review"
              suppressHydrationWarning
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Centered Minimalist Cinematic Spotlight */}
      <div ref={stageRef} className="reviews-minimal-stage">
        <div className="review-spotlight-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeReview.id}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 18, filter: 'blur(6px)' }
              }
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -14, filter: 'blur(4px)' }
              }
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="review-motion-body"
            >
              <div
                className="review-stars"
                aria-label={`${activeReview.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, starIdx) => (
                  <Star
                    key={starIdx}
                    size={15}
                    className={
                      starIdx < activeReview.rating ? 'star-filled' : 'star-empty'
                    }
                    fill={starIdx < activeReview.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>

              <blockquote className="spotlight-quote">
                &ldquo;{activeReview.quote}&rdquo;
              </blockquote>

              <div className="review-minimal-author">
                <span className="author-rule" aria-hidden="true" />
                <strong>{activeReview.client}</strong>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Minimal Index Pills with Animated Progress */}
        <div
          className="review-selector-strip"
          role="tablist"
          aria-label="Select client review"
        >
          {reviews.map((item, idx) => {
            const isSelected = idx === activeIdx
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveIdx(idx)}
                className={`review-selector-tab ${isSelected ? 'is-active' : ''}`}
                suppressHydrationWarning
              >
                <span className="selector-idx">0{idx + 1}</span>
                <span className="selector-client">{item.client}</span>

                <span className="selector-progress-track" aria-hidden="true">
                  {isSelected && (
                    <motion.span
                      key={`${activeIdx}-${isPaused ? 'paused' : 'play'}`}
                      className="selector-progress-fill"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={
                        isPaused || reducedMotion
                          ? { duration: 0.2 }
                          : { duration: AUTO_PLAY_MS / 1000, ease: 'linear' }
                      }
                    />
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
