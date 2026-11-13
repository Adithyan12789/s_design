'use client'

import { useEffect, useRef, useState } from 'react'

export interface MediaRendererProps {
  src?: string | null
  type?: 'image' | 'video'
  posterUrl?: string | null
  alt?: string
  className?: string
  imageClassName?: string
  videoClassName?: string
  isBackground?: boolean
  controls?: boolean
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  playsInline?: boolean
  aspectRatio?: string
  fallbackSrc?: string
  children?: React.ReactNode
}

export function isVideoSource(src?: string | null, type?: 'image' | 'video'): boolean {
  if (type === 'video') return true
  if (type === 'image') return false
  if (!src) return false
  return Boolean(
    src.match(/\.(mp4|webm|mov|mkv|ogg)($|\?)/i) ||
      src.includes('/video/upload/') ||
      src.startsWith('data:video/')
  )
}

export function MediaRenderer({
  src,
  type,
  posterUrl,
  alt = 'Architectural media',
  className = '',
  imageClassName = '',
  videoClassName = '',
  isBackground = false,
  controls = false,
  autoPlay,
  muted = true,
  loop = true,
  playsInline = true,
  aspectRatio,
  fallbackSrc,
  children,
}: MediaRendererProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(!isBackground)

  const isVideo = !hasError && isVideoSource(src, type)
  const shouldAutoPlay = autoPlay ?? isBackground
  const effectiveMuted = isBackground ? true : muted

  // Lazy-load and pause video when leaving viewport
  useEffect(() => {
    if (!isVideo) return
    const container = containerRef.current
    if (!container || typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting)
        setIsInView(visible)
        const video = videoRef.current
        if (!video) return

        if (!visible && !video.paused) {
          video.pause()
        } else if (visible && shouldAutoPlay && video.paused) {
          video.muted = true
          video.play().catch(() => {})
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [isVideo, shouldAutoPlay])

  // Handle source changes
  useEffect(() => {
    setHasError(false)
  }, [src])

  const poster = posterUrl || fallbackSrc || (isVideo ? undefined : src || undefined)

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {isVideo && src ? (
        <video
          ref={videoRef}
          key={src}
          src={src}
          poster={poster}
          autoPlay={shouldAutoPlay && isInView}
          muted={effectiveMuted}
          loop={loop}
          playsInline={playsInline}
          controls={controls && !isBackground}
          preload={isBackground ? 'auto' : 'metadata'}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover ${videoClassName}`}
          aria-label={alt}
        />
      ) : (
        <img
          src={src || poster || '/s-design-emblem-clean.png'}
          alt={alt}
          loading="lazy"
          onError={() => {
            if (fallbackSrc && src !== fallbackSrc) {
              setHasError(true)
            }
          }}
          className={`w-full h-full object-cover ${imageClassName}`}
        />
      )}
      {children}
    </div>
  )
}

