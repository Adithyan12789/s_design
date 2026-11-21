'use client'

import React from 'react'
import { ArchitecturalBlueprintSvg } from '@/components/architectural-blueprint-svg'

export interface ArchitecturalLoaderViewProps {
  title?: string
  subtitle?: string
  progress?: number
  isExiting?: boolean
  isStatic?: boolean
  isProject?: boolean
}

export function ArchitecturalLoaderView({
  title = 'S_Designs',
  subtitle,
  progress = 0,
  isExiting = false,
  isStatic = false,
}: ArchitecturalLoaderViewProps) {
  const currentProgress = Math.max(0, Math.min(100, Math.round(progress)))
  const formattedPercent = String(currentProgress).padStart(2, '0')

  return (
    <div
      className={`architectural-loader-screen ${
        isExiting ? 'architectural-loader-exiting' : ''
      } ${isStatic ? 'architectural-loader-static' : ''}`}
      aria-live="polite"
      aria-busy={!isExiting}
      role="status"
    >
      <div className="architectural-loader-container">
        {/* 1. Centered Architectural Blueprint-to-Building Animation */}
        <div className="architectural-loader-svg-box">
          <ArchitecturalBlueprintSvg
            progress={isStatic ? 100 : currentProgress}
            isStatic={isStatic}
          />
        </div>

        {/* 2. S_DESIGNS Branding */}
        <div className="architectural-loader-brand-block">
          <h1 className="architectural-loader-brand-title">{title}</h1>
          {subtitle && (
            <p className="architectural-loader-brand-sub">{subtitle}</p>
          )}
        </div>

        {/* 3. Clearly Visible LOADING Label with Animated Feedback Dots */}
        <div className="architectural-loader-status-row">
          <span className="architectural-loader-status-label">LOADING</span>
          <span className="architectural-loader-dots" aria-hidden="true">
            <span className="loader-dot" />
            <span className="loader-dot" />
            <span className="loader-dot" />
          </span>
        </div>

        {/* 4. Thin Bronze Progress Bar & Percentage Counter */}
        <div className="architectural-loader-progress-wrap">
          <div className="architectural-loader-track" aria-hidden="true">
            <div
              className={`architectural-loader-bar ${
                isStatic ? 'architectural-loader-bar-pulse' : ''
              }`}
              style={
                !isStatic
                  ? { width: `${currentProgress}%` }
                  : undefined
              }
            />
          </div>

          <div
            className="architectural-loader-counter"
            aria-label={`Website loading progress: ${currentProgress} percent`}
          >
            <span className="architectural-loader-number">{formattedPercent}</span>
            <span className="architectural-loader-symbol">%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
