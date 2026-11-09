'use client'

import { useState } from 'react'
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { ProjectImage3D } from '@/components/project-image-3d'

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
        {images.map((image, index) => (
          <div
            key={image}
            className="gallery-item-wrapper group"
            onClick={() => openLightbox(index)}
          >
            <ProjectImage3D
              className="detail-gallery-image"
              src={image}
              alt={`${title} detail ${index + 1}`}
            />
            <div className="gallery-expand-hint">
              <Maximize2 size={16} />
              <span>Expand view</span>
            </div>
          </div>
        ))}
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
              aria-label="Close image viewer"
              suppressHydrationWarning
            >
              <X size={22} />
            </button>

            <button
              className="lightbox-nav-btn prev"
              onClick={showPrev}
              aria-label="Previous image"
              suppressHydrationWarning
            >
              <ChevronLeft size={28} />
            </button>

            <div className="lightbox-image-stage">
              <img
                src={images[lightboxIndex]}
                alt={`${title} view ${lightboxIndex + 1}`}
                className="lightbox-active-img"
              />
              <div className="lightbox-caption">
                <span>{title}</span>
                <span className="dot">·</span>
                <span>Plate {lightboxIndex + 1} of {images.length}</span>
              </div>
            </div>

            <button
              className="lightbox-nav-btn next"
              onClick={showNext}
              aria-label="Next image"
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

