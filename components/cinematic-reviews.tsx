'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft, ArrowRight, Play, Quote, Star, VideoOff } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export interface ReviewItem {
  id: string
  client: string
  rating: number
  projectName?: string
  projectDescription?: string
  quote?: string
  headline?: string
  videoUrl?: string
  posterImage?: string
  backgroundImage?: string
}

interface CinematicReviewsProps {
  id?: string
  reviews: ReviewItem[]
  kicker?: string
  heading1?: string
  heading2?: string
}

const AUTO_PLAY_MS = 7000

const isVideoFile = (url?: string | null) => {
  if (!url) return false
  const clean = url.split('?')[0].toLowerCase()
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.ogg') ||
    clean.includes('/video/upload/')
  )
}

export const CinematicReviews = React.memo(function CinematicReviews({
  id = 'reviews',
  reviews,
  kicker = 'Client Reviews',
  heading1 = '',
  heading2 = '',
}: CinematicReviewsProps) {
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
  const [isPortraitVideo, setIsPortraitVideo] = useState(false)

  const currentIndex = safeReviews.length > 0 ? activeIndex % safeReviews.length : 0
  const current = safeReviews[currentIndex]

  const rawVideo = current?.videoUrl?.trim() || ''
  const rawPoster = current?.posterImage?.trim() || ''

  const videoSrc = useMemo(() => {
    if (rawVideo) return rawVideo
    if (rawPoster && isVideoFile(rawPoster)) return rawPoster
    return '/uploads/1794576013976-acldi-150784-799174132_medium.mp4'
  }, [rawVideo, rawPoster])

  const posterSrc = useMemo(() => {
    if (rawPoster && !isVideoFile(rawPoster)) return rawPoster
    if (current?.backgroundImage && !isVideoFile(current.backgroundImage)) return current.backgroundImage
    return ''
  }, [rawPoster, current?.backgroundImage])

  const backdropSrc = useMemo(() => {
    if (current?.backgroundImage && !isVideoFile(current.backgroundImage)) return current.backgroundImage
    if (rawPoster && !isVideoFile(rawPoster)) return rawPoster
    return ''
  }, [current?.backgroundImage, rawPoster])

  // Clear error state whenever active testimonial changes
  useEffect(() => {
    setVideoErrorId(null)
    setIsPortraitVideo(false)
    const video = videoRef.current
    if (video && video.readyState >= 1 && video.videoWidth && video.videoHeight) {
      setIsPortraitVideo(video.videoHeight > video.videoWidth)
    }
  }, [currentIndex, videoSrc])

  const hasVideo = Boolean(videoSrc && videoErrorId !== current?.id)

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
          video.play().then(() => setIsVideoPlaying(true)).catch(() => {})
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
      video.play()
        .then(() => {
          setIsVideoPlaying(true)
        })
        .catch(() => {
          setIsVideoPlaying(false)
        })
    }
  }, [currentIndex, videoSrc, hasVideo, isInViewport])

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
      video.muted = false
      try {
        await video.play()
        setIsVideoPlaying(true)
      } catch {
        try {
          video.muted = true
          await video.play()
          setIsVideoPlaying(true)
        } catch {
          setIsVideoPlaying(false)
        }
      }
    } else {
      video.pause()
      setIsVideoPlaying(false)
    }
  }

  if (!current) return null

  const normalizedRating = Math.min(5, Math.max(1, Math.round(current.rating || 5)))
  const showCustomHeading = Boolean(
    (heading1?.trim() && heading1.trim().toLowerCase() !== 'quiet') ||
    (heading2?.trim() && heading2.trim().toLowerCase().replace('.', '') !== 'appreciation')
  )

  const resolvedQuote =
    current.quote?.trim() ||
    current.headline?.trim() ||
    'A home shaped by quiet proportion, light, and enduring stillness.'

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

      <div className="reviews-container">
        <div ref={frameRef} className="reviews-editorial-frame">
          {/* LEFT PANEL — Simplified 4-element client review details */}
          <div className="reviews-left-panel">
            <header className="reviews-section-header">
              <h2 className="section-kicker reviews-section-kicker">
                <span className="reviews-kicker-title">
                  {kicker && kicker.toLowerCase() === 'client reviews' ? 'Client Reviews' : kicker}
                </span>
              </h2>
              {showCustomHeading && (
                <div className="reviews-custom-heading">
                  {heading1} {heading2 ? <em>{heading2}</em> : null}
                </div>
              )}
            </header>

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
                <h3 className="reviews-client-heading">{current.client}</h3>

                <div
                  className="reviews-star-row"
                  aria-label={`${normalizedRating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, index) => {
                    const filled = index < normalizedRating
                    return (
                      <Star
                        key={index}
                        size={15}
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

                {/* Dedicated client personal quote */}
                {resolvedQuote && (
                  <blockquote className="reviews-quote-card">
                    <Quote
                      size={15}
                      strokeWidth={1.4}
                      className="reviews-quote-icon"
                      aria-hidden="true"
                    />
                    <p className="reviews-quote-text">“{resolvedQuote}”</p>
                    <footer className="reviews-quote-client">
                      — {current.client}
                    </footer>
                  </blockquote>
                )}
              </motion.div>
            </AnimatePresence>

            {safeReviews.length > 1 && (
              <div className="reviews-controls-bar">
                <div className="reviews-nav-buttons">
                  <button
                    type="button"
                    className="reviews-nav-btn cursor-target"
                    data-crosshair-target
                    onClick={() => stepReview(-1)}
                    aria-label="Previous testimonial"
                    suppressHydrationWarning
                  >
                    <ArrowLeft size={15} strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    className="reviews-nav-btn cursor-target"
                    data-crosshair-target
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
                        className={`reviews-dot cursor-target${isActive ? ' is-active' : ''}`}
                        data-crosshair-target
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
          <div className={`reviews-video-stage ${isPortraitVideo ? 'is-portrait' : 'is-landscape'}`}>
            <div
              className={`reviews-video-card ${
                !hasVideo
                  ? 'image-card-fallback aspect-[4/3]'
                  : isPortraitVideo
                  ? 'video-portrait aspect-[9/16]'
                  : 'video-landscape aspect-[16/9]'
              }`}
            >
              {hasVideo ? (
                <>
                  <video
                    ref={videoRef}
                    key={videoSrc}
                    src={videoSrc}
                    poster={posterSrc || undefined}
                    onLoadedMetadata={(e) => {
                      const v = e.currentTarget
                      if (v.videoWidth && v.videoHeight) {
                        setIsPortraitVideo(v.videoHeight > v.videoWidth)
                      }
                    }}
                    autoPlay
                    muted
                    playsInline
                    loop
                    preload="auto"
                    controls
                    onClick={handleTogglePlay}
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onError={() => {
                      setIsVideoPlaying(false)
                    }}
                    className="reviews-video-element"
                    aria-label={`Video testimonial from ${current.client}`}
                  />

                  {!isVideoPlaying && (
                    <button
                      type="button"
                      className="reviews-play-overlay cursor-target"
                      data-crosshair-target
                      data-cursor-label="Play"
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
})
