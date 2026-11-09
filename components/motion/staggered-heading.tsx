'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type StaggeredHeadingProps = {
  lines: Array<{
    text: string
    isAccent?: boolean
  }>
  tag?: 'h1' | 'h2' | 'h3'
  className?: string
  delay?: number
  triggerOnScroll?: boolean
  animateOnInit?: boolean
}

export function StaggeredHeading({
  lines,
  tag = 'h1',
  className = '',
  delay = 0.1,
  triggerOnScroll = true,
  animateOnInit = false,
}: StaggeredHeadingProps) {
  const containerRef = useRef<HTMLHeadingElement | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const wordElements = el.querySelectorAll('.stagger-word-inner')

    if (prefersReducedMotion) {
      gsap.set(wordElements, { y: 0, opacity: 1 })
      return
    }

    gsap.set(wordElements, { y: '115%', opacity: 0.2 })

    if (triggerOnScroll && !animateOnInit) {
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(wordElements, {
            y: '0%',
            opacity: 1,
            duration: 1.15,
            stagger: 0.05,
            ease: 'power3.out',
            delay,
          })
        },
      })

      return () => {
        trigger.kill()
      }
    } else {
      // Immediate or controlled entrance
      const ctx = gsap.context(() => {
        gsap.to(wordElements, {
          y: '0%',
          opacity: 1,
          duration: 1.25,
          stagger: 0.06,
          ease: 'power3.out',
          delay,
        })
      }, el)

      return () => ctx.revert()
    }
  }, [delay, triggerOnScroll, animateOnInit])

  const Component = tag

  return (
    <Component ref={containerRef} className={`staggered-heading ${className}`}>
      {lines.map((line, lIdx) => {
        const words = line.text.split(' ')
        return (
          <span key={lIdx} className="stagger-line">
            {words.map((word, wIdx) => (
              <span key={wIdx} className="stagger-word-wrapper">
                <span className={`stagger-word-inner ${line.isAccent ? 'is-accent' : ''}`}>
                  {line.isAccent ? <em>{word}</em> : word}
                </span>
                {wIdx < words.length - 1 && '\u00A0'}
              </span>
            ))}
          </span>
        )
      })}
    </Component>
  )
}

