import React from 'react'

export function ArchitecturalLoaderView({
  title = 'S_Designs',
}: {
  title?: string
  subtitle?: string
  isProject?: boolean
  message?: string
}) {
  return (
    <div
      className="minimal-loader-screen minimal-loader-static"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="minimal-loader-content">
        <h1 className="minimal-loader-brand">{title}</h1>

        <div className="minimal-loader-track" aria-hidden="true">
          <div className="minimal-loader-fill minimal-loader-fill-pulse" />
        </div>

        <div className="minimal-loader-counter">
          00%
        </div>
      </div>
    </div>
  )
}
