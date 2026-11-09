'use client'

import { useEffect, useRef } from 'react'

export function ReactBitsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    let frame = 0
    let animationFrame = 0
    let width = 0
    let height = 0
    let dpr = 1
    const pointer = { x: 0.5, y: 0.35, active: false }

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = bounds.width
      height = bounds.height
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      frame += 0.006
      context.clearRect(0, 0, width, height)

      const glow = context.createRadialGradient(
        pointer.x * width,
        pointer.y * height,
        0,
        pointer.x * width,
        pointer.y * height,
        Math.max(width, height) * 0.5,
      )
      glow.addColorStop(0, 'rgba(209, 166, 112, 0.15)')
      glow.addColorStop(0.45, 'rgba(157, 137, 109, 0.06)')
      glow.addColorStop(1, 'rgba(157, 137, 109, 0)')
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)

      const spacing = width < 600 ? 30 : 42
      const columns = Math.ceil(width / spacing) + 1
      const rows = Math.ceil(height / spacing) + 1
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < columns; x += 1) {
          const baseX = x * spacing
          const baseY = y * spacing
          const wave = Math.sin(frame * 2 + x * 0.37 + y * 0.18) * 2
          const distance = Math.hypot(baseX - pointer.x * width, baseY - pointer.y * height)
          const influence = Math.max(0, 1 - distance / 230)
          const size = 1.1 + influence * 2.8 + Math.sin(frame * 3 + x) * 0.35
          const alpha = 0.07 + influence * 0.2

          context.beginPath()
          context.arc(baseX + wave, baseY + wave * 0.5, size, 0, Math.PI * 2)
          context.fillStyle = `rgba(70, 67, 58, ${alpha})`
          context.fill()
        }
      }

      animationFrame = requestAnimationFrame(draw)
    }

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth
      pointer.y = event.clientY / window.innerHeight
      pointer.active = true
    }

    const onPointerLeave = () => {
      pointer.active = false
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerleave', onPointerLeave)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="reactbits-background" aria-hidden="true" />
}
