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
  onOpenLightbox,
}: {
  plate: ProjectGalleryPlate
  fallbackImage?: string
  onOpenLightbox?: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<number | null>(plate.aspectRatio || null)
  const [autoThumbnail, setAutoThumbnail] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

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
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }

  return (
    <div
      className="gallery-video-card-container w-full relative overflow-hidden bg-[#141311] rounded-md"
      style={{
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
        maxHeight: 'min(78vh, 840px)',
      }}
    >
      <video
        ref={(vEl) => {
          videoRef.current = vEl
          if (vEl && vEl.videoWidth && vEl.videoHeight && !aspectRatio) {
            setAspectRatio(vEl.videoWidth / vEl.videoHeight)
          }
        }}
        src={plate.url}
        poster={resolvedPoster || undefined}
        controls={isPlaying}
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => {
          const v = e.currentTarget
          if (v.videoWidth && v.videoHeight) {
            setAspectRatio(v.videoWidth / v.videoHeight)
          }
        }}
        onEnded={() => setIsPlaying(false)}
        className="w-full h-full object-cover object-center block"
        style={{
          aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
        }}
        aria-label={plate.altText || 'Project video'}
      />

      {/* Before playback: Thumbnail & Luxury Play Overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer group/thumb bg-black/25 hover:bg-black/15 transition-all duration-300"
          onClick={handlePlayClick}
        >
          {resolvedPoster ? (
            <img
              ref={(imgEl) => {
                if (imgEl && imgEl.complete && imgEl.naturalWidth && !aspectRatio) {
                  setAspectRatio(imgEl.naturalWidth / imgEl.naturalHeight)
                }
              }}
              src={resolvedPoster}
              alt={plate.altText || 'Video thumbnail'}
              onLoad={(e) => {
                const { naturalWidth, naturalHeight } = e.currentTarget
                if (naturalWidth && naturalHeight && !aspectRatio) {
                  setAspectRatio(naturalWidth / naturalHeight)
                }
              }}
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-[#161513] flex items-center justify-center">
              <Film className="w-10 h-10 text-white/30" />
            </div>
          )}

          {/* Vignette gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20 pointer-events-none" />

          {/* Luxury Play Icon Badge */}
          <button
            type="button"
            onClick={handlePlayClick}
            aria-label={`Play ${plate.altText || 'video'}`}
            className="relative z-20 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-[#141311]/85 backdrop-blur-md border border-[#d9b686]/40 text-[#f5f1e9] group-hover/thumb:scale-110 group-hover/thumb:bg-[#141311]/95 group-hover/thumb:border-[#d9b686] group-hover/thumb:text-[#d9b686] transition-all duration-300 shadow-2xl cursor-pointer"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
          </button>

          {/* Video indicator tag in bottom-left */}
          <span className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141311]/85 backdrop-blur-md border border-white/10 text-[#f5f1e9] text-[10px] sm:text-[11px] font-medium tracking-widest uppercase">
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

  // Normalize items to unified ProjectGalleryPlate[] format
  const items: ProjectGalleryPlate[] = useMemo(() => {
    if (plates && plates.length > 0) return plates
    if (images && images.length > 0) {
      return images.map((img, idx) => {
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
    return []
  }, [plates, images, title])

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const showNext = () => {
    if (lightboxIndex === null || items.length === 0) return
    setLightboxIndex((lightboxIndex + 1) % items.length)
  }

  const showPrev = () => {
    if (lightboxIndex === null || items.length === 0) return
    setLightboxIndex((lightboxIndex - 1 + items.length) % items.length)
  }

  if (items.length === 0) return null

  return (
    <>
      <div className="detail-gallery-grid">
        {items.map((item, index) => {
          const isVid = item.type === 'video' || isVideoSource(item.url)
          return (
            <div
              key={item.id || item.url}
              className="gallery-item-wrapper group cursor-pointer cursor-target"
              data-crosshair-target
              data-cursor-label={isVid ? 'Play' : 'Expand'}
              onClick={() => openLightbox(index)}
            >
              {isVid ? (
                <GalleryVideoCard
                  plate={item}
                  fallbackImage={fallbackImage}
                  onOpenLightbox={() => openLightbox(index)}
                />
              ) : (
                <ProjectImage3D
                  className="detail-gallery-image relative overflow-hidden"
                  src={item.url}
                  alt={item.altText || `${title} detail ${index + 1}`}
                  aspectRatio={item.aspectRatio}
                />
              )}
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
            </div>
          )
        })}
      </div>

      {/* Full-screen Lightbox Modal */}
      {lightboxIndex !== null && items[lightboxIndex] && (
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

            {items.length > 1 && (
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
              {isVideoSource(items[lightboxIndex].url, items[lightboxIndex].type) ? (
                <video
                  src={items[lightboxIndex].url}
                  poster={
                    items[lightboxIndex].posterUrl ||
                    getCloudinaryVideoThumbnail(items[lightboxIndex].url, 1.5) ||
                    undefined
                  }
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[85vh] max-w-[90vw] object-contain rounded shadow-2xl"
                />
              ) : (
                <img
                  src={items[lightboxIndex].url}
                  alt={items[lightboxIndex].altText || `${title} view ${lightboxIndex + 1}`}
                  className="lightbox-active-img"
                />
              )}
              <div className="lightbox-caption">
                <span>{title}</span>
                <span className="dot">·</span>
                <span>Plate {lightboxIndex + 1} of {items.length}</span>
              </div>
            </div>

            {items.length > 1 && (
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
