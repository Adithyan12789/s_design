'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

type CinematicLoaderProps = {
  onComplete?: () => void
}

export function CinematicLoader({ onComplete }: CinematicLoaderProps) {
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    setMounted(true)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setShouldRender(false)
      if (onComplete) onComplete()
      return
    }

    let current = 0
    const interval = setInterval(() => {
      // Natural accelerating progress
      current += Math.floor(Math.random() * 22) + 12
      if (current >= 100) {
        current = 100
        setProgress(100)
        clearInterval(interval)

        setTimeout(() => {
          setIsDone(true)
          if (onComplete) onComplete()

          setTimeout(() => {
            setShouldRender(false)
          }, 950)
        }, 180)
      } else {
        setProgress(current)
      }
    }, 45)

    return () => clearInterval(interval)
  }, [onComplete])

  if (!shouldRender || !mounted) return null

  const loaderJSX = (
    <aside
      className={`cinematic-loader-curtain ${isDone ? 'is-exiting' : ''}`}
      aria-label="Loading architectural portfolio"
      aria-live="polite"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="loader-curtain-panel top" />
      <div className="loader-curtain-panel bottom" />

      <div className="loader-content-wrap">
        <div className="loader-mark-frame">
          <Image
            src="/s-design-emblem-white.png"
            alt="S_Designs Architectural Mark"
            width={72}
            height={72}
            className="loader-logo-img"
            priority
          />
        </div>

        <div className="loader-brand-title">
          <span>S_DE_SIGN</span>
          <span className="loader-sub">— STUDIO —</span>
        </div>

        <div className="loader-progress-track">
          <div
            className="loader-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="loader-status-row">
          <span className="loader-coord">38.7223° N, 9.1393° W · LISBON</span>
          <span className="loader-percentage">
            {progress < 10 ? `0${progress}` : progress}%
          </span>
        </div>
      </div>
    </aside>
  )

  return createPortal(loaderJSX, document.body)
}
