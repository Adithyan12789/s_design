'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { CmsStudioInfo, CmsFounderInfo } from '@/lib/cms/types'

gsap.registerPlugin(ScrollTrigger)

interface FounderSectionProps {
  id?: string
  founder?: CmsFounderInfo
  studioInfo?: CmsStudioInfo
  approachDescription?: string
}

export function FounderSection({
  id = 'founder',
  founder,
  studioInfo,
}: FounderSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const imageRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  // If section is explicitly hidden by administrator in Admin Panel, do not render
  if (founder && founder.visible === false) {
    return null
  }

  const firstMember = studioInfo?.teamMembers?.[0]
  const founderName =
    founder?.founderName?.trim() || firstMember?.name?.trim() || '[Founder Name]'
  const founderRole =
    founder?.founderRole?.trim() ||
    firstMember?.role?.trim() ||
    '[Principal Architect & Founder]'
  const founderBio =
    founder?.founderBio?.trim() ||
    firstMember?.bio?.trim() ||
    '[Insert founder introduction — Leading S_DE_SIGN with an unwavering commitment to spatial silence, tactile materiality, and the dialogue between built form and natural context. Every project is conceived as an enduring sanctuary—crafted slowly, deliberately, and in harmony with the landscape.]'
  const founderPhoto =
    founder?.founderPhoto?.trim() ||
    firstMember?.photoUrl?.trim() ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85'

  const founderQuote =
    founder?.quote?.trim() ||
    founder?.philosophy?.trim() ||
    studioInfo?.philosophy?.trim() ||
    '[Insert founder personal quote — "Architecture is not merely about form or enclosure; it is the quiet art of making room for life, shaped by light and tactile honesty."]'

  const kicker = founder?.kicker?.trim() || '( 06 )'
  const label = founder?.label?.trim() || 'THE FOUNDER'
  const showButton = Boolean(founder?.showButton && founder?.buttonText?.trim())
  const showStats = Boolean(founder?.showStats && founder?.stats && founder.stats.length > 0)
  const showIllustration = Boolean(founder?.showIllustration && founder?.illustrationUrl?.trim())

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, y: 30, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: imageRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="founder-section" id={id} suppressHydrationWarning>
      <div className="founder-ambient-glow" aria-hidden="true" />

      <div className="founder-container">
        <div className="founder-compact-grid">
          {/* LEFT: Founder image with small size */}
          <div ref={imageRef} className="founder-image-col">
            <div className="founder-small-portrait">
              <Image
                src={founderPhoto}
                alt={`${founderName} — ${founderRole}`}
                fill
                sizes="(max-width: 768px) 220px, 320px"
                className="founder-portrait-img"
                priority={false}
              />
              <div className="founder-portrait-scrim" aria-hidden="true" />
            </div>
          </div>

          {/* RIGHT: Name, Tag, Details, Quote */}
          <div ref={contentRef} className="founder-content-col">
            <div className="section-kicker founder-kicker">
              {kicker} <span>{label}</span>
            </div>

            <h2 className="founder-name">{founderName}</h2>

            <p className="founder-tag">{founderRole}</p>

            <p className="founder-details">{founderBio}</p>

            <blockquote className="founder-quote-block">
              <p className="founder-quote-text">“{founderQuote}”</p>
            </blockquote>

            {showButton && (
              <div className="founder-btn-wrap">
                <a href={founder?.buttonHref || '#studio'} className="founder-action-btn">
                  <span>{founder?.buttonText || 'Our Philosophy'}</span>
                  <ArrowUpRight size={14} className="founder-btn-arrow" />
                </a>
              </div>
            )}

            {showStats && (
              <div className="founder-stats-container">
                <div className="founder-stats-grid">
                  {founder?.stats?.map((st, i) => (
                    <div key={i} className="founder-stat-item">
                      <span className="founder-stat-number">{st.value}</span>
                      <span className="founder-stat-label">{st.label}</span>
                      <span className="founder-stat-detail">{st.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showIllustration && founder?.illustrationUrl && (
        <div className="founder-illustration-bg" aria-hidden="true">
          <Image
            src={founder.illustrationUrl}
            alt="Architectural Blueprint"
            fill
            className="object-contain"
          />
        </div>
      )}
    </section>
  )
}
