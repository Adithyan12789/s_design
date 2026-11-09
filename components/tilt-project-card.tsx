'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, Compass } from 'lucide-react'

type TiltProjectCardProps = {
  slug?: string
  title: string
  meta: string
  image: string
  size?: 'large' | 'small'
  index: number
  category?: string
  location?: string
  year?: string
  area?: string
}

export function TiltProjectCard({
  slug,
  title,
  meta,
  image,
  size = 'small',
  index,
  category,
  location,
  year,
  area,
}: TiltProjectCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const projectHref = `/work/${slug || title.toLowerCase().replaceAll(' ', '-').replace('the-', 'the-')}`

  return (
    <article
      className={`project-card ${size} tilt-project-card group`}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5
        setTilt({ x: y * -7, y: x * 7 })
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setTilt({ x: 0, y: 0 })
      }}
      style={{ '--tilt-x': `${tilt.x}deg`, '--tilt-y': `${tilt.y}deg` } as React.CSSProperties}
    >
      <Link href={projectHref} className="project-card-link" aria-label={`View ${title} project details`}>
        <div className="tilt-project-stage">
          <div className="project-image" style={{ backgroundImage: `url(${image})` }} />
          <div className="tilt-project-overlay" />
          <div className="tilt-project-gloss" aria-hidden="true" />
          <div className="tilt-project-depth" aria-hidden="true" />

          {/* Floating Modern Badges */}
          <div className="project-floating-tags">
            {category && <span className="project-tag-pill">{category}</span>}
            {year && <span className="project-tag-pill year">{year}</span>}
          </div>

          {/* Centered View Case Study Action Pill on Hover */}
          <div className={`project-hover-cta ${isHovered ? 'visible' : ''}`}>
            <span>View Case Study</span>
            <ArrowUpRight size={15} />
          </div>
        </div>

        <div className="project-info">
          <span className="project-index">0{index + 1}</span>
          <div className="project-meta-col">
            <h3>{title}</h3>
            <p>{meta}</p>
            {location && area && (
              <div className="project-quick-specs">
                <span>{location}</span>
                <span className="dot">·</span>
                <span>{area}</span>
              </div>
            )}
          </div>
          <div className="project-arrow-wrap">
            <ArrowUpRight className="project-arrow" size={20} />
          </div>
        </div>
      </Link>
    </article>
  )
}
