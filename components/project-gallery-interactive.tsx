'use client'

import { useState } from 'react'
import { Maximize2, X, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { ProjectImage3D } from '@/components/project-image-3d'
import { isVideoSource } from '@/components/media-renderer'

type ProjectGalleryInteractiveProps = {
  title: string
  images: string[]
}

export function ProjectGalleryInteractive({ title, images }: ProjectGalleryInteractiveProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const showNext = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % images.length)
  }

  const showPrev = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
  }

  return (
    <>
      <div className="detail-gallery-grid">
        {images.map((image, index) => {
          const isVid = isVideoSource(image)
          return (
            <div
              key={image}
              className="gallery-item-wrapper group cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              {isVid ? (
                <div className="detail-gallery-image relative overflow-hidden bg-black aspect-[4/3]">
                  <video
                    src={image}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded bg-black/75 text-white text-[11px] font-medium tracking-wider uppercase">
                    <Play className="w-3 h-3 fill-current" />
                    Video
                  </span>
                </div>
              ) : (
                <ProjectImage3D
                  className="detail-gallery-image"
                  src={image}
                  alt={`${title} detail ${index + 1}`}
                />
              )}
              <div className="gallery-expand-hint">
                <Maximize2 size={16} />
                <span>{isVid ? 'Play video' : 'Expand view'}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Full-screen Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="lightbox-overlay"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close-btn"
              onClick={closeLightbox}
              aria-label="Close media viewer"
              suppressHydrationWarning
            >
              <X size={22} />
            </button>

            <button
              className="lightbox-nav-btn prev"
              onClick={showPrev}
              aria-label="Previous media"
              suppressHydrationWarning
            >
              <ChevronLeft size={28} />
            </button>

            <div className="lightbox-image-stage">
              {isVideoSource(images[lightboxIndex]) ? (
                <video
                  src={images[lightboxIndex]}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[85vh] max-w-[90vw] object-contain rounded shadow-2xl"
                />
              ) : (
                <img
                  src={images[lightboxIndex]}
                  alt={`${title} view ${lightboxIndex + 1}`}
                  className="lightbox-active-img"
                />
              )}
              <div className="lightbox-caption">
                <span>{title}</span>
                <span className="dot">·</span>
                <span>Plate {lightboxIndex + 1} of {images.length}</span>
              </div>
            </div>

            <button
              className="lightbox-nav-btn next"
              onClick={showNext}
              aria-label="Next media"
              suppressHydrationWarning
            >
              <ChevronRight size={28} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}


