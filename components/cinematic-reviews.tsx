'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft, ArrowRight, Play, Star, VideoOff } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export interface ReviewItem {
  id: string
  client: string
  rating: number
  projectName?: string
  projectDescription?: string
  videoUrl?: string
  posterImage?: string
  backgroundImage?: string
}

interface CinematicReviewsProps {
  id?: string
  reviews: ReviewItem[]
}

const AUTO_PLAY_MS = 7000

export function CinematicReviews({ id = 'reviews', reviews }: CinematicReviewsProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const reducedMotion = useReducedMotion()

  const safeReviews = useMemo(() => (reviews.length > 0 ? reviews : []), [reviews])
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [isInViewport, setIsInViewport] = useState(true)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [videoErrorId, setVideoErrorId] = useState<string | null>(null)

  const currentIndex = safeReviews.length > 0 ? activeIndex % safeReviews.length : 0
  const current = safeReviews[currentIndex]

  const hasVideo = Boolean(current?.videoUrl && current.videoUrl.trim().length > 0 && videoErrorId !== current.id)
  const posterSrc = current?.posterImage || current?.backgroundImage || ''
  const backdropSrc = current?.backgroundImage || current?.posterImage || ''

  // Pause video when leaving viewport and resume muted autoplay when returning.
  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof IntersectionObserver === 'undefined') {
      setIsInViewport(true)
      return
    }

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting)
        setIsInViewport(visible)
        const video = videoRef.current
        if (!video) return
        if (!visible && !video.paused) {
          video.pause()
        } else if (visible && hasVideo && video.paused) {
          video.muted = true
          video.play().catch(() => {})
        }
      },
      { threshold: 0.15 }
    )
    visibilityObserver.observe(section)

    return () => {
      visibilityObserver.disconnect()
    }
  }, [hasVideo])

  // Start muted autoplay whenever switching to a testimonial with a valid video.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !hasVideo) {
      setIsVideoPlaying(false)
      return
    }
    video.currentTime = 0
    video.muted = true
    if (isInViewport) {
      video.play().catch(() => {
        setIsVideoPlaying(false)
      })
    }
  }, [currentIndex, current?.videoUrl, hasVideo, isInViewport])

  // Auto-advance when idle and visible.
  useEffect(() => {
    if (safeReviews.length <= 1 || isPaused || !isInViewport) return
    const timer = window.setInterval(() => {
      setDirection(1)
      setActiveIndex((prev) => (prev + 1) % safeReviews.length)
    }, AUTO_PLAY_MS)
    return () => window.clearInterval(timer)
  }, [safeReviews.length, isPaused, isInViewport])

  // Subtle editorial entrance animation.
  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      if (frameRef.current) {
        gsap.fromTo(
          frameRef.current,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: frameRef.current,
              start: 'top 84%',
              once: true,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  const selectReview = (nextIndex: number) => {
    if (safeReviews.length <= 1 || nextIndex === currentIndex) return
    setDirection(nextIndex > currentIndex ? 1 : -1)
    setActiveIndex((nextIndex + safeReviews.length) % safeReviews.length)
  }

  const stepReview = (delta: number) => {
    if (safeReviews.length <= 1) return
    setDirection(delta >= 0 ? 1 : -1)
    setActiveIndex((currentIndex + delta + safeReviews.length) % safeReviews.length)
  }

  const handleTogglePlay = async () => {
    const video = videoRef.current
    if (!video || !hasVideo) return
    if (video.paused) {
      try {
        await video.play()
        setIsVideoPlaying(true)
      } catch {
        setIsVideoPlaying(false)
      }
    } else {
      video.pause()
      setIsVideoPlaying(false)
    }
  }

  if (!current) return null

  const normalizedRating = Math.min(5, Math.max(1, Math.round(current.rating || 5)))

  return (
    <section
      id={id}
      ref={sectionRef}
      className="reviews section-pad"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="reviews-ambient-glow" aria-hidden="true" />

      <div className="container reviews-container">
        <header className="reviews-section-header">
          <div className="section-kicker">
            ( 05 ) <span>Client reviews</span>
          </div>
          <h2>
            Client <em>reviews</em>
          </h2>
        </header>

        <div ref={frameRef} className="reviews-editorial-frame">
          {/* LEFT PANEL — Simplified 4-element client review details */}
          <div className="reviews-left-panel">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: reducedMotion ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="reviews-copy-block"
              >
                <h2 className="reviews-client-heading">{current.client}</h2>

                <div
                  className="reviews-star-row"
                  aria-label={`${normalizedRating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, index) => {
                    const filled = index < normalizedRating
                    return (
                      <Star
                        key={index}
                        size={16}
                        strokeWidth={1.5}
                        className={filled ? 'reviews-star-filled' : 'reviews-star-empty'}
                        fill={filled ? 'currentColor' : 'none'}
                        aria-hidden="true"
                      />
                    )
                  })}
                </div>

                {current.projectName && (
                  <div className="reviews-project-title">{current.projectName}</div>
                )}

                {current.projectDescription && (
                  <p className="reviews-description">{current.projectDescription}</p>
                )}
              </motion.div>
            </AnimatePresence>

            {safeReviews.length > 1 && (
              <div className="reviews-controls-bar">
                <div className="reviews-nav-buttons">
                  <button
                    type="button"
                    className="reviews-nav-btn"
                    onClick={() => stepReview(-1)}
                    aria-label="Previous testimonial"
                    suppressHydrationWarning
                  >
                    <ArrowLeft size={15} strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    className="reviews-nav-btn"
                    onClick={() => stepReview(1)}
                    aria-label="Next testimonial"
                    suppressHydrationWarning
                  >
                    <ArrowRight size={15} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="reviews-dots" role="tablist" aria-label="Select testimonial">
                  {safeReviews.map((review, index) => {
                    const isActive = index === currentIndex
                    return (
                      <button
                        key={review.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`View testimonial from ${review.client}`}
                        className={`reviews-dot${isActive ? ' is-active' : ''}`}
                        onClick={() => selectReview(index)}
                        suppressHydrationWarning
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL — Architectural background photograph */}
          <div className="reviews-right-backdrop">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${current.id}-backdrop`}
                initial={reducedMotion ? false : { opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0.15 : 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="reviews-backdrop-media"
              >
                {backdropSrc ? (
                  <img
                    src={backdropSrc}
                    alt={current.projectName ? `${current.projectName} architecture` : `${current.client} project`}
                    className="reviews-backdrop-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="reviews-backdrop-fallback" />
                )}
                <div className="reviews-backdrop-scrim" aria-hidden="true" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CENTER LAYER — Overlapping rectangular video testimonial card */}
          <div className="reviews-video-stage">
            <div className="reviews-video-card">
              {hasVideo ? (
                <>
                  <video
                    ref={videoRef}
                    key={current.videoUrl}
                    src={current.videoUrl}
                    poster={posterSrc || undefined}
                    autoPlay
                    muted
                    playsInline
                    loop
                    preload="auto"
                    controls
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onError={() => {
                      setIsVideoPlaying(false)
                      setVideoErrorId(current.id)
                    }}
                    className="reviews-video-element"
                    aria-label={`Video testimonial from ${current.client}`}
                  />

                  {!isVideoPlaying && (
                    <button
                      type="button"
                      className="reviews-play-overlay"
                      onClick={handleTogglePlay}
                      aria-label={`Play video testimonial from ${current.client}`}
                      suppressHydrationWarning
                    >
                      <span className="reviews-play-ring">
                        <Play size={22} strokeWidth={1.6} fill="currentColor" className="reviews-play-icon" />
                      </span>
                    </button>
                  )}
                </>
              ) : (
                <div className="reviews-video-fallback">
                  {posterSrc ? (
                    <img
                      src={posterSrc}
                      alt={`${current.client} testimonial preview`}
                      className="reviews-video-fallback-img"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="reviews-video-fallback-scrim" />
                  <div className="reviews-video-fallback-badge">
                    <VideoOff size={18} strokeWidth={1.5} aria-hidden="true" />
                    <span>VIDEO UNAVAILABLE</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
