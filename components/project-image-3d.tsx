'use client'

import { useState } from 'react'

type ProjectImage3DProps = {
  src: string
  alt: string
  className?: string
  priority?: boolean
  aspectRatio?: number
  onError?: () => void
}

export function ProjectImage3D({
  src,
  alt,
  className = '',
  priority = false,
  onError,
}: ProjectImage3DProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

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
      } as React.CSSProperties}
    >
      <div className="project-image-3d__frame">
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onError={onError}
          className="w-full h-auto block object-contain object-center"
        />
        <span className="project-image-3d__shine" aria-hidden="true" />
      </div>
    </div>
  )
}

