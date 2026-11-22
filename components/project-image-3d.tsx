'use client'

import { useState } from 'react'

type ProjectImage3DProps = {
  src: string
  alt: string
  className?: string
  priority?: boolean
  aspectRatio?: number
}

export function ProjectImage3D({
  src,
  alt,
  className = '',
  priority = false,
  aspectRatio: initialAspectRatio,
}: ProjectImage3DProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [aspectRatio, setAspectRatio] = useState<number | null>(initialAspectRatio || null)

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    setTilt({ x: (0.5 - y) * 8, y: (x - 0.5) * 10 })
  }

  return (
    <div
      className={`project-image-3d ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        '--image-tilt-x': `${tilt.x}deg`,
        '--image-tilt-y': `${tilt.y}deg`,
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
      } as React.CSSProperties}
    >
      <div className="project-image-3d__depth" aria-hidden="true" />
      <div
        className="project-image-3d__frame"
        style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : undefined }}
      >
        <img
          ref={(imgEl) => {
            if (imgEl && imgEl.complete && imgEl.naturalWidth && !aspectRatio) {
              setAspectRatio(imgEl.naturalWidth / imgEl.naturalHeight)
            }
          }}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.currentTarget
            if (naturalWidth && naturalHeight) {
              setAspectRatio(naturalWidth / naturalHeight)
            }
          }}
          className="w-full h-auto block object-cover object-center"
          style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : undefined }}
        />
        <span className="project-image-3d__shine" aria-hidden="true" />
      </div>
    </div>
  )
}
