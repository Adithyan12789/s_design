'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Maximize2, X, ChevronLeft, ChevronRight, Play, Film } from 'lucide-react'
import { ProjectImage3D } from '@/components/project-image-3d'
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

function GalleryVideoCard({
  plate,
  fallbackImage,
  aspectRatio,
  onOpenLightbox,
  onMediaError,
  onDimensionsDetected,
  onPlayingChange,
}: {
  plate: ProjectGalleryPlate
  fallbackImage?: string
  aspectRatio?: number
  onOpenLightbox?: () => void
  onMediaError?: () => void
  onDimensionsDetected?: (width: number, height: number) => void
  onPlayingChange?: (isPlaying: boolean) => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoThumbnail, setAutoThumbnail] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<HTMLVideoElement | null>(null)

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

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPlaying(true)
    onPlayingChange?.(true)
  }

  useEffect(() => {
    if (isPlaying && playerRef.current) {
      playerRef.current.play().catch(() => {})
    }
  }, [isPlaying])

  const handleLoadedMeta = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget
    if (v.videoWidth && v.videoHeight) {
      onDimensionsDetected?.(v.videoWidth, v.videoHeight)
    }
  }

  const handlePosterLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img.naturalWidth && img.naturalHeight) {
      onDimensionsDetected?.(img.naturalWidth, img.naturalHeight)
    }
  }

  const hasRatio = typeof aspectRatio === 'number' && aspectRatio > 0

  return (
    <div
      className="gallery-video-card-container w-full relative overflow-hidden rounded-md"
      style={{
        aspectRatio: hasRatio ? `${aspectRatio}` : undefined,
        height: hasRatio ? '100%' : 'auto',
      }}
    >
      {isPlaying ? (
        <video
          ref={playerRef}
          src={plate.url}
          poster={resolvedPoster || undefined}
          controls
          autoPlay
          playsInline
          onEnded={() => {
            setIsPlaying(false)
            onPlayingChange?.(false)
          }}
          onError={onMediaError}
          onLoadedMetadata={handleLoadedMeta}
          className={`w-full block object-contain object-center ${hasRatio ? 'h-full' : 'h-auto'}`}
          aria-label={plate.altText || 'Project video'}
        />
      ) : (
        <div
          className={`relative w-full cursor-pointer group/thumb ${hasRatio ? 'h-full' : 'h-auto'}`}
          onClick={handlePlayClick}
        >
          {resolvedPoster ? (
            <img
              src={resolvedPoster}
              alt={plate.altText || 'Video thumbnail'}
              onError={onMediaError}
              onLoad={handlePosterLoaded}
              className={`w-full block object-contain object-center ${hasRatio ? 'h-full' : 'h-auto'}`}
              loading="lazy"
            />
          ) : (
            <video
              ref={videoRef}
              src={plate.url}
              preload="metadata"
              muted
              playsInline
              onError={onMediaError}
              onLoadedMetadata={handleLoadedMeta}
              className={`w-full block object-contain object-center ${hasRatio ? 'h-full' : 'h-auto'}`}
              aria-label={plate.altText || 'Project video'}
            />
          )}

          {/* Vignette gradient overlay over thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Luxury Play Icon Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              type="button"
              onClick={handlePlayClick}
              aria-label={`Play ${plate.altText || 'video'}`}
              className="pointer-events-auto relative z-20 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-[#141311]/85 backdrop-blur-md border border-[#d9b686]/40 text-[#f5f1e9] group-hover/thumb:scale-110 group-hover/thumb:bg-[#141311]/95 group-hover/thumb:border-[#d9b686] group-hover/thumb:text-[#d9b686] transition-all duration-300 shadow-2xl cursor-pointer"
              suppressHydrationWarning
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
            </button>
          </div>

          {/* Video indicator tag in bottom-left */}
          <span className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141311]/85 backdrop-blur-md border border-white/10 text-[#f5f1e9] text-[10px] sm:text-[11px] font-medium tracking-widest uppercase pointer-events-none">
            <Play className="w-2.5 h-2.5 fill-[#d9b686] text-[#d9b686]" />
            Video
          </span>
        </div>
      )}
    </div>
  )
}

export function ProjectGalleryInteractive({
  title,
  plates,
  images,
  fallbackImage,
}: ProjectGalleryInteractiveProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [failedItemKeys, setFailedItemKeys] = useState<Set<string>>(new Set())
  const [mediaDimensions, setMediaDimensions] = useState<
    Record<string, { width: number; height: number; aspectRatio: number }>
  >({})
  const [playingVideoKeys, setPlayingVideoKeys] = useState<Set<string>>(new Set())

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

  const handleMediaError = (key: string) => {
    setFailedItemKeys((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }

  const handleDimensionsDetected = (key: string, width: number, height: number) => {
    if (!width || !height || width <= 0 || height <= 0) return
    const ratio = width / height
    setMediaDimensions((prev) => {
      const existing = prev[key]
      if (
        existing &&
        Math.abs(existing.aspectRatio - ratio) < 0.005 &&
        existing.width === width &&
        existing.height === height
      ) {
        return prev
      }
      return {
        ...prev,
        [key]: { width, height, aspectRatio: ratio },
      }
    })
  }

  // Pre-load natural dimensions for image and video posters
  useEffect(() => {
    visibleItems.forEach((item, idx) => {
      const mediaKey = item.id || item.url || `media-${idx}`
      const isVid = item.type === 'video' || isVideoSource(item.url)

      if (item.aspectRatio && item.aspectRatio > 0) {
        handleDimensionsDetected(mediaKey, item.aspectRatio * 1000, 1000)
      }

      if (!isVid && item.url) {
        const img = new Image()
        img.src = item.url
        img.onload = () => {
          if (img.naturalWidth && img.naturalHeight) {
            handleDimensionsDetected(mediaKey, img.naturalWidth, img.naturalHeight)
          }
        }
      } else if (isVid) {
        const poster =
          item.posterUrl ||
          getCloudinaryVideoThumbnail(item.url, 1.5) ||
          null
        if (poster) {
          const img = new Image()
          img.src = poster
          img.onload = () => {
            if (img.naturalWidth && img.naturalHeight) {
              handleDimensionsDetected(mediaKey, img.naturalWidth, img.naturalHeight)
            }
          }
        }
      }
    })
  }, [visibleItems])

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

  const leftItems = useMemo(
    () =>
      visibleItems
        .map((item, idx) => ({ item, index: idx }))
        .filter(({ index }) => index % 2 === 0),
    [visibleItems]
  )
  const rightItems = useMemo(
    () =>
      visibleItems
        .map((item, idx) => ({ item, index: idx }))
        .filter(({ index }) => index % 2 === 1),
    [visibleItems]
  )

  const getMediaWrapperStyles = (
    dim?: { width: number; height: number; aspectRatio: number },
    isEven: boolean = true
  ): React.CSSProperties => {
    if (!dim || !dim.aspectRatio || dim.aspectRatio <= 0) {
      return {
        width: '100%',
        maxWidth: '100%',
        height: 'auto',
      }
    }

    const { aspectRatio, width: naturalW } = dim
    const maxDesktopHeight = 'min(72vh, 720px)'

    // Landscape media (ratio >= 1.15)
    if (aspectRatio >= 1.15) {
      const hasSmallNaturalWidth = naturalW > 0 && naturalW < 600
      return {
        width: hasSmallNaturalWidth ? `min(100%, ${naturalW}px)` : '100%',
        maxWidth: '100%',
        aspectRatio: `${aspectRatio}`,
        height: 'auto',
      }
    }

    // Portrait (ratio < 0.9) or Square / Neutral (0.9 <= ratio < 1.15)
    // Derive width naturally from the max desktop height and the exact aspect ratio
    const naturalWidthConstraint =
      naturalW > 0 && naturalW < 720
        ? `min(100%, ${naturalW}px, calc(${maxDesktopHeight} * ${aspectRatio}))`
        : `min(100%, calc(${maxDesktopHeight} * ${aspectRatio}))`

    return {
      width: naturalWidthConstraint,
      maxWidth: '100%',
      aspectRatio: `${aspectRatio}`,
      height: 'auto',
    }
  }

  const renderGalleryItem = (
    item: ProjectGalleryPlate,
    index: number,
    keyPrefix: string
  ) => {
    const itemKey = `${keyPrefix}-${item.id || item.url || index}`
    const mediaKey = item.id || item.url || `media-${index}`
    const isVid = item.type === 'video' || isVideoSource(item.url)
    const isEven = index % 2 === 0
    const alignmentClass = isEven ? 'gallery-item-left' : 'gallery-item-right'
    const dim =
      mediaDimensions[mediaKey] ||
      (item.aspectRatio ? { width: 0, height: 0, aspectRatio: item.aspectRatio } : undefined)
    const itemStyle = getMediaWrapperStyles(dim, isEven)
    const isPlayingVideo = playingVideoKeys.has(mediaKey)

    return (
      <div
        key={itemKey}
        className={`gallery-item-wrapper ${alignmentClass} group cursor-pointer cursor-target`}
        data-crosshair-target
        data-cursor-label={isVid ? 'Play' : 'Expand'}
        data-alignment={isEven ? 'left' : 'right'}
        data-index={index}
        style={itemStyle}
        onClick={() => openLightbox(index)}
      >
        {isVid ? (
          <GalleryVideoCard
            plate={item}
            fallbackImage={fallbackImage}
            aspectRatio={dim?.aspectRatio}
            onOpenLightbox={() => openLightbox(index)}
            onMediaError={() => handleMediaError(item.id || item.url || `item-${index}`)}
            onDimensionsDetected={(w, h) => handleDimensionsDetected(mediaKey, w, h)}
            onPlayingChange={(playing) => {
              setPlayingVideoKeys((prev) => {
                const next = new Set(prev)
                if (playing) next.add(mediaKey)
                else next.delete(mediaKey)
                return next
              })
            }}
          />
        ) : (
          <ProjectImage3D
            className="detail-gallery-image relative overflow-hidden"
            src={item.url}
            alt={item.altText || `${title} detail ${index + 1}`}
            aspectRatio={dim?.aspectRatio}
            onError={() => handleMediaError(item.id || item.url || `item-${index}`)}
            onDimensionsDetected={(w, h) => handleDimensionsDetected(mediaKey, w, h)}
          />
        )}
        {!isPlayingVideo && (
          <div
            className="gallery-expand-hint"
            onClick={(e) => {
              e.stopPropagation()
              openLightbox(index)
            }}
          >
            <Maximize2 size={15} />
            <span>{isVid ? 'Full view' : 'Expand view'}</span>
          </div>
        )}
      </div>
    )
  }

  if (visibleItems.length === 0) return null

  return (
    <>
      {/* Desktop / Tablet Two-Column Independent Vertical Flow */}
      <div className="detail-gallery-grid detail-gallery-desktop">
        <div className="detail-gallery-col detail-gallery-col-left">
          {leftItems.map(({ item, index }) => renderGalleryItem(item, index, 'left'))}
        </div>
        <div className="detail-gallery-col detail-gallery-col-right">
          {rightItems.map(({ item, index }) => renderGalleryItem(item, index, 'right'))}
        </div>
      </div>

      {/* Mobile Single-Column Sequential Flow */}
      <div className="detail-gallery-grid detail-gallery-mobile">
        {visibleItems.map((item, index) => renderGalleryItem(item, index, 'mobile'))}
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

            <div className="lightbox-image-stage">
              {isVideoSource(visibleItems[lightboxIndex].url, visibleItems[lightboxIndex].type) ? (
                <video
                  src={visibleItems[lightboxIndex].url}
                  poster={
                    visibleItems[lightboxIndex].posterUrl ||
                    getCloudinaryVideoThumbnail(visibleItems[lightboxIndex].url, 1.5) ||
                    undefined
                  }
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[85vh] max-w-[90vw] object-contain rounded shadow-2xl"
                />
              ) : (
                <img
                  src={visibleItems[lightboxIndex].url}
                  alt={visibleItems[lightboxIndex].altText || `${title} view ${lightboxIndex + 1}`}
                  className="lightbox-active-img"
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
