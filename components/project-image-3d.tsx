'use client'

import { useState } from 'react'

type ProjectImage3DProps = {
  src: string
  alt: string
  className?: string
  priority?: boolean
  aspectRatio?: number
  onError?: () => void
  onDimensionsDetected?: (width: number, height: number) => void
}

export function ProjectImage3D({
  src,
  alt,
  className = '',
  priority = false,
  aspectRatio,
  onError,
  onDimensionsDetected,
}: ProjectImage3DProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    setTilt({ x: (0.5 - y) * 8, y: (x - 0.5) * 10 })
  }

  const hasRatio = typeof aspectRatio === 'number' && aspectRatio > 0

  return (
    <div
      className={`project-image-3d ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        '--image-tilt-x': `${tilt.x}deg`,
        '--image-tilt-y': `${tilt.y}deg`,
        aspectRatio: hasRatio ? `${aspectRatio}` : undefined,
        height: hasRatio ? '100%' : 'auto',
      } as React.CSSProperties}
    >
      <div
        className="project-image-3d__frame"
        style={{
          aspectRatio: hasRatio ? `${aspectRatio}` : undefined,
          height: hasRatio ? '100%' : 'auto',
        }}
      >
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onError={onError}
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.currentTarget
            if (naturalWidth && naturalHeight) {
              onDimensionsDetected?.(naturalWidth, naturalHeight)
            }
          }}
          className={`w-full block object-contain object-center ${hasRatio ? 'h-full' : 'h-auto'}`}
        />
        <span className="project-image-3d__shine" aria-hidden="true" />
      </div>
    </div>
  )
}

