'use client'

import { useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react'
import { Maximize2, X, ChevronLeft, ChevronRight, Play, Film } from 'lucide-react'
import { ProjectImage3D } from '@/components/project-image-3d'
import { getOptimizedImageUrl } from '@/lib/storage/image-optimization'
import {
  isVideoSource,
  getCloudinaryVideoThumbnail,
  generateVideoThumbnailFromUrl,
} from '@/lib/storage/video-thumbnails'

export interface ProjectGalleryPlate {
  id: string
  url: string
  type?: 'image' | 'video'
  posterUrl?: string | null
  altText?: string
  aspectRatio?: number
}

type ProjectGalleryInteractiveProps = {
  title: string
  plates?: ProjectGalleryPlate[]
  images?: string[]
  fallbackImage?: string
}

export type GalleryVideoCardHandle = {
  triggerFullscreen: () => void
  getVideoElement: () => HTMLVideoElement | null
}

function requestVideoFullscreen(video: HTMLVideoElement | null) {
  if (!video) return
  try {
    if (typeof video.requestFullscreen === 'function') {
      const p = video.requestFullscreen()
      if (p && typeof p.catch === 'function') {
        p.catch((err) => {
          console.debug('requestFullscreen was denied or failed:', err)
        })
      }
      return
    }
    // iOS Safari
    if (typeof (video as any).webkitEnterFullscreen === 'function') {
      try {
        ;(video as any).webkitEnterFullscreen()
      } catch (err) {
        console.debug('webkitEnterFullscreen failed:', err)
      }
      return
    }
    // Safari / WebKit desktop
    if (typeof (video as any).webkitRequestFullscreen === 'function') {
      const p = (video as any).webkitRequestFullscreen()
      if (p && typeof p.catch === 'function') {
        p.catch((err: unknown) => {
          console.debug('webkitRequestFullscreen failed:', err)
        })
      }
      return
    }
    // Firefox legacy
    if (typeof (video as any).mozRequestFullScreen === 'function') {
      const p = (video as any).mozRequestFullScreen()
      if (p && typeof p.catch === 'function') {
        p.catch((err: unknown) => {
          console.debug('mozRequestFullScreen failed:', err)
        })
      }
      return
    }
    // IE / Edge legacy
    if (typeof (video as any).msRequestFullscreen === 'function') {
      const p = (video as any).msRequestFullscreen()
      if (p && typeof p.catch === 'function') {
        p.catch((err: unknown) => {
          console.debug('msRequestFullscreen failed:', err)
        })
      }
      return
    }
  } catch (err) {
    console.debug('Fullscreen API error:', err)
  }
}

const GalleryVideoCard = forwardRef<
  GalleryVideoCardHandle,
  {
    plate: ProjectGalleryPlate
    fallbackImage?: string
    onMediaError?: () => void
  }
>(function GalleryVideoCard(
  { plate, fallbackImage, onMediaError },
  ref
) {
  const [hasStarted, setHasStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoThumbnail, setAutoThumbnail] = useState<string | null>(null)
  const [shouldLoadSource, setShouldLoadSource] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // IntersectionObserver-based deferred loading for below-the-fold gallery videos
  useEffect(() => {
    if (shouldLoadSource) return
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShouldLoadSource(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadSource(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [shouldLoadSource])

  // 1. Explicit posterUrl -> 2. Cloudinary 1.5s snapshot -> 3. Auto-extracted canvas frame -> 4. Fallback project image
  const resolvedPoster =
    plate.posterUrl ||
    getCloudinaryVideoThumbnail(plate.url, 1.5) ||
    autoThumbnail ||
    fallbackImage ||
    null

  // Automatic client-side thumbnail generation fallback for videos without pre-saved posters
  useEffect(() => {
    if (resolvedPoster) return
    let isMounted = true
    generateVideoThumbnailFromUrl(plate.url, 1.5).then((thumb) => {
      if (isMounted && thumb) {
        setAutoThumbnail(thumb)
      }
    })
    return () => {
      isMounted = false
    }
  }, [plate.url, resolvedPoster])

  const triggerFullscreen = () => {
    if (!shouldLoadSource) {
      setShouldLoadSource(true)
    }
    const video = videoRef.current
    if (!video) return

    // Check if already in native fullscreen
    const isFullscreen =
      document.fullscreenElement === video ||
      (document as any).webkitFullscreenElement === video ||
      Boolean((video as any).webkitDisplayingFullscreen)

    if (isFullscreen) return

    if (!hasStarted) {
      setHasStarted(true)
      video.play().catch(() => {})
    } else if (video.paused) {
      // If paused, preserve playback position and do not unexpectedly start playback
    } else {
      // Already playing: preserve playback position and continue playing
    }

    requestVideoFullscreen(video)
  }

  useImperativeHandle(ref, () => ({
    triggerFullscreen,
    getVideoElement: () => videoRef.current,
  }))

  const handleCardClick = (e: React.MouseEvent) => {
    if (!shouldLoadSource) {
      setShouldLoadSource(true)
    }
    const video = videoRef.current
    if (!video) return

    // If currently in native fullscreen, let native controls handle interaction
    const isFullscreen =
      document.fullscreenElement === video ||
      (document as any).webkitFullscreenElement === video ||
      Boolean((video as any).webkitDisplayingFullscreen)

    if (isFullscreen) return

    // If video has started and controls are visible, ignore clicks on the bottom native controls bar
    if (hasStarted) {
      const rect = video.getBoundingClientRect()
      // Typical native controls bar is within the bottom ~54px of the video
      if (rect.bottom - e.clientY <= 54) {
        return
      }
    }

    triggerFullscreen()
  }

  return (
    <div
      ref={containerRef}
      className="gallery-video-card-container w-full relative overflow-hidden rounded-md cursor-pointer group/thumb"
      onClick={handleCardClick}
    >
      <video
        ref={videoRef}
        src={shouldLoadSource || hasStarted ? plate.url : undefined}
        poster={resolvedPoster ? getOptimizedImageUrl(resolvedPoster, { width: 1280, quality: 'auto' }) : undefined}
        controls={hasStarted}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        playsInline
        preload={shouldLoadSource ? 'metadata' : 'none'}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
          setHasStarted(false)
        }}
        onError={onMediaError}
        className="w-full h-auto block object-contain object-center select-none"
        aria-label={plate.altText || 'Project video'}
      />

      {/* Overlay displayed before video is started */}
      {!hasStarted && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {resolvedPoster && (
            <img
              src={resolvedPoster}
              alt={plate.altText || 'Video thumbnail'}
              onError={onMediaError}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              className="absolute inset-0 w-full h-full object-contain object-center pointer-events-none select-none"
              loading="lazy"
            />
          )}

          {/* Vignette gradient overlay over thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Luxury Play Icon Badge */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              aria-label={`Play ${plate.altText || 'video'}`}
              className="relative z-20 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-[#141311]/85 backdrop-blur-md border border-[#d9b686]/40 text-[#f5f1e9] group-hover/thumb:scale-110 group-hover/thumb:bg-[#141311]/95 group-hover/thumb:border-[#d9b686] group-hover/thumb:text-[#d9b686] transition-all duration-300 shadow-2xl"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
            </div>
          </div>

          {/* Video indicator tag in bottom-left */}
          <span className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141311]/85 backdrop-blur-md border border-white/10 text-[#f5f1e9] text-[10px] sm:text-[11px] font-medium tracking-widest uppercase">
            <Play className="w-2.5 h-2.5 fill-[#d9b686] text-[#d9b686]" />
            Video
          </span>
        </div>
      )}
    </div>
  )
})

export function ProjectGalleryInteractive({
  title,
  plates,
  images,
  fallbackImage,
}: ProjectGalleryInteractiveProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [failedItemKeys, setFailedItemKeys] = useState<Set<string>>(new Set())
  const videoCardRefs = useRef<Record<string, GalleryVideoCardHandle | null>>({})

  // Normalize items to unified ProjectGalleryPlate[] format & filter out invalid / empty URLs
  const items: ProjectGalleryPlate[] = useMemo(() => {
    let rawItems: ProjectGalleryPlate[] = []
    if (plates && plates.length > 0) {
      rawItems = plates
    } else if (images && images.length > 0) {
      rawItems = images.map((img, idx) => {
        const isVid = isVideoSource(img)
        return {
          id: `plate-${idx}`,
          url: img,
          type: (isVid ? 'video' : 'image') as 'image' | 'video',
          posterUrl: isVid ? getCloudinaryVideoThumbnail(img, 1.5) : null,
          altText: `${title} plate ${idx + 1}`,
        }
      })
    }
    return rawItems.filter(
      (item) => Boolean(item && typeof item.url === 'string' && item.url.trim().length > 0)
    )
  }, [plates, images, title])

  const visibleItems = useMemo(() => {
    return items.filter((item, idx) => {
      const key = item.id || item.url || `item-${idx}`
      return !failedItemKeys.has(key)
    })
  }, [items, failedItemKeys])

  const leftItems = useMemo(() => {
    return visibleItems
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ originalIndex }) => originalIndex % 2 === 0)
  }, [visibleItems])

  const rightItems = useMemo(() => {
    return visibleItems
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ originalIndex }) => originalIndex % 2 !== 0)
  }, [visibleItems])

  const handleMediaError = (key: string) => {
    setFailedItemKeys((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const showNext = () => {
    if (lightboxIndex === null || visibleItems.length === 0) return
    setLightboxIndex((lightboxIndex + 1) % visibleItems.length)
  }

  const showPrev = () => {
    if (lightboxIndex === null || visibleItems.length === 0) return
    setLightboxIndex((lightboxIndex - 1 + visibleItems.length) % visibleItems.length)
  }

  if (visibleItems.length === 0) return null

  const renderItemCard = (
    item: ProjectGalleryPlate,
    index: number,
    side: 'left' | 'right' | 'single'
  ) => {
    const itemKey = item.id || item.url || `gallery-item-${index}`
    const isVid = item.type === 'video' || isVideoSource(item.url)
    const alignmentClass =
      side === 'left'
        ? 'gallery-item-left'
        : side === 'right'
        ? 'gallery-item-right'
        : 'gallery-item-single'

    return (
      <div
        key={`${itemKey}-${side}`}
        className={`gallery-item-wrapper ${alignmentClass} group cursor-pointer cursor-target`}
        data-crosshair-target
        data-cursor-label={isVid ? 'Play' : 'Expand'}
        data-alignment={side}
        data-index={index}
        onClick={(e) => {
          if (isVid) {
            // If the user clicks directly on the wrapper (e.g. border or edge), trigger video fullscreen
            if (e.target === e.currentTarget) {
              videoCardRefs.current[itemKey]?.triggerFullscreen()
            }
          } else {
            openLightbox(index)
          }
        }}
      >
        {isVid ? (
          <GalleryVideoCard
            ref={(node) => {
              videoCardRefs.current[itemKey] = node
            }}
            plate={item}
            fallbackImage={fallbackImage}
            onMediaError={() => handleMediaError(itemKey)}
          />
        ) : (
          <ProjectImage3D
            className="detail-gallery-image relative overflow-hidden"
            src={item.url}
            alt={item.altText || `${title} detail ${index + 1}`}
            onError={() => handleMediaError(itemKey)}
          />
        )}
        <div
          className="gallery-expand-hint"
          onClick={(e) => {
            e.stopPropagation()
            if (isVid) {
              videoCardRefs.current[itemKey]?.triggerFullscreen()
            } else {
              openLightbox(index)
            }
          }}
        >
          <Maximize2 size={15} />
          <span>{isVid ? 'Fullscreen' : 'Expand view'}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop / Tablet: Dual column alternating flow with no locked-row empty gaps */}
      <div className="detail-gallery-dual-flow">
        <div className="detail-gallery-col detail-gallery-col-left">
          {leftItems.map(({ item, originalIndex }) =>
            renderItemCard(item, originalIndex, 'left')
          )}
        </div>
        <div className="detail-gallery-col detail-gallery-col-right">
          {rightItems.map(({ item, originalIndex }) =>
            renderItemCard(item, originalIndex, 'right')
          )}
        </div>
      </div>

      {/* Mobile: Single sequential column in original 0, 1, 2, 3... order */}
      <div className="detail-gallery-single-flow">
        {visibleItems.map((item, index) =>
          renderItemCard(item, index, 'single')
        )}
      </div>

      {/* Full-screen Lightbox Modal */}
      {lightboxIndex !== null && visibleItems[lightboxIndex] && (
        <div
          className="lightbox-overlay"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close-btn cursor-target"
              data-crosshair-target
              onClick={closeLightbox}
              aria-label="Close media viewer"
              suppressHydrationWarning
            >
              <X size={22} />
            </button>

            {visibleItems.length > 1 && (
              <button
                className="lightbox-nav-btn prev cursor-target"
                data-crosshair-target
                onClick={showPrev}
                aria-label="Previous media"
                suppressHydrationWarning
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <div className="lightbox-image-stage" onContextMenu={(e) => e.preventDefault()}>
              {isVideoSource(visibleItems[lightboxIndex].url, visibleItems[lightboxIndex].type) ? (
                <video
                  src={visibleItems[lightboxIndex].url}
                  poster={
                    visibleItems[lightboxIndex].posterUrl ||
                    getCloudinaryVideoThumbnail(visibleItems[lightboxIndex].url, 1.5) ||
                    undefined
                  }
                  controls
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  autoPlay
                  playsInline
                  className="max-h-[85vh] max-w-[90vw] object-contain rounded shadow-2xl select-none"
                />
              ) : (
                <img
                  src={visibleItems[lightboxIndex].url}
                  alt={visibleItems[lightboxIndex].altText || `${title} view ${lightboxIndex + 1}`}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="lightbox-active-img select-none"
                />
              )}
              <div className="lightbox-caption">
                <span>{title}</span>
                <span className="dot">·</span>
                <span>Plate {lightboxIndex + 1} of {visibleItems.length}</span>
              </div>
            </div>

            {visibleItems.length > 1 && (
              <button
                className="lightbox-nav-btn next cursor-target"
                data-crosshair-target
                onClick={showNext}
                aria-label="Next media"
                suppressHydrationWarning
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
