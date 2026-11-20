'use client'

import { useEffect, useRef, useState } from 'react'

interface DetailHeroMediaProps {
  mediaType?: 'image' | 'video'
  videoUrl?: string
  posterUrl?: string
  imageUrl?: string
  alt: string
}

export function DetailHeroMedia({
  mediaType,
  videoUrl,
  posterUrl,
  imageUrl,
  alt,
}: DetailHeroMediaProps) {
  const [isPortrait, setIsPortrait] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const isVideo = mediaType === 'video' && Boolean(videoUrl)

  useEffect(() => {
    const video = videoRef.current
    if (video && video.readyState >= 1 && video.videoWidth && video.videoHeight) {
      setIsPortrait(video.videoHeight > video.videoWidth)
    }
  }, [videoUrl, isVideo])

  return (
    <div
      className={`detail-hero-media ${
        !isVideo
          ? 'is-image-card'
          : isPortrait
          ? 'is-video-portrait'
          : 'is-video-landscape'
      }`}
    >
      {isVideo && videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl || imageUrl || undefined}
          controls
          autoPlay
          muted
          loop
          playsInline
          onLoadedMetadata={(e) => {
            const v = e.currentTarget
            if (v.videoWidth && v.videoHeight) {
              setIsPortrait(v.videoHeight > v.videoWidth)
            }
          }}
          className="detail-hero-photo w-full h-full object-cover object-center"
          aria-label={alt}
        />
      ) : (
        <img
          src={imageUrl}
          alt={alt}
          className="detail-hero-photo w-full h-full object-cover object-center"
          loading="eager"
        />
      )}
    </div>
  )
}
