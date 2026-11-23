'use client'

import { useEffect, useRef, useState } from 'react'
import { getCloudinaryVideoThumbnail } from '@/lib/storage/video-thumbnails'

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
  const resolvedPoster =
    posterUrl ||
    (videoUrl ? getCloudinaryVideoThumbnail(videoUrl, 1.5) : null) ||
    imageUrl ||
    undefined

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
          poster={resolvedPoster}
          controls
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
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
          className="detail-hero-photo w-full h-full object-cover object-center select-none"
          aria-label={alt}
        />
      ) : (
        <img
          src={imageUrl}
          alt={alt}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="detail-hero-photo w-full h-full object-cover object-center select-none"
          loading="eager"
        />
      )}
    </div>
  )
}
