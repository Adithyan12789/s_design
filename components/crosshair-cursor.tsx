'use client'

import React, { useEffect, useState } from 'react'
import Crosshair from '@/components/Crosshair'

export default function CrosshairCursor() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // Only activate precision crosshair on devices with a fine pointer (mouse, trackpad)
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setEnabled(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  if (!enabled) return null

  return (
    <Crosshair
      color="#ffffff"
      thickness={1}
      opacity={0.85}
      lineStyle="solid"
      gap={0}
      fade={0}
      smoothing={0.35}
      showCoordinates={true}
      targetEffect="lock"
      targetSelector="a, button, [data-crosshair-target]"
      clickPulse={true}
      hideCursor={false}
      blendMode="difference"
    />
  )
}
