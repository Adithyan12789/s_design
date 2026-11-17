'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { CmsStudioInfo } from '@/lib/cms/types'

gsap.registerPlugin(ScrollTrigger)

interface FounderSectionProps {
  id?: string
  studioInfo?: CmsStudioInfo
  approachDescription?: string
}

export function FounderSection({
  id = 'founder',
  studioInfo,
  approachDescription,
}: FounderSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const profileColRef = useRef<HTMLDivElement | null>(null)
  const contentColRef = useRef<HTMLDivElement | null>(null)
  const statsRef = useRef<HTMLDivElement | null>(null)

  const firstMember = studioInfo?.teamMembers?.[0]
  const founderName = firstMember?.name?.trim() || '[Founder Name]'
  const founderRole = firstMember?.role?.trim() || '[Principal Architect & Founder]'
  const founderBio =
    firstMember?.bio?.trim() ||
    '[Insert founder introduction — Leading S_DE_SIGN with an unwavering commitment to spatial silence, tactile materiality, and the dialogue between built form and natural context. Every project is conceived as an enduring sanctuary—crafted slowly, deliberately, and in harmony with the landscape.]'
  const founderPhoto =
    firstMember?.photoUrl?.trim() ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85'

  const founderQuote =
    studioInfo?.philosophy?.trim() ||
    '[Insert founder personal quote — "Architecture is not merely about form or enclosure; it is the quiet art of making room for life, shaped by light and tactile honesty."]'

  const visionText =
    studioInfo?.vision?.trim() ||
    approachDescription?.trim() ||
    '[Insert creative approach — We prioritize daylight, raw texture, and proportional restraint, cultivating quiet contemplation and spaces that belong naturally to their surroundings.]'

  const stats = [
    {
      value: '[14+]',
      label: 'Years of Experience',
      detail: 'Studio Practice',
    },
    {
      value: '[28+]',
      label: 'Projects Completed',
      detail: 'Private & Cultural',
    },
    {
      value: '[18,000 m²]',
      label: 'Total Area Designed',
      detail: 'Portugal & Global',
    },
  ]

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // Left Column Profile reveal
      if (profileColRef.current) {
        gsap.fromTo(
          profileColRef.current.children,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: profileColRef.current,
              start: 'top 82%',
              once: true,
            },
          }
        )
      }

      // Right Column Content reveal
      if (contentColRef.current) {
        const textElements = contentColRef.current.querySelectorAll(
          '.founder-main-headline, .founder-narrative, .founder-btn-wrap'
        )
        gsap.fromTo(
          textElements,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            stagger: 0.14,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: contentColRef.current,
              start: 'top 82%',
              once: true,
            },
          }
        )

        // Architectural Blueprint background reveal
        const blueprint = contentColRef.current.querySelector('.founder-blueprint-art')
        if (blueprint) {
          gsap.fromTo(
            blueprint,
            { opacity: 0, scale: 0.96 },
            {
              opacity: 0.16,
              scale: 1,
              duration: 1.4,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: contentColRef.current,
                start: 'top 85%',
                once: true,
              },
            }
          )
        }
      }

      // Statistics Staggered Reveal
      if (statsRef.current) {
        const statItems = statsRef.current.querySelectorAll('.founder-stat-item')
        gsap.fromTo(
          statItems,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 88%',
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
        <div className="founder-editorial-grid">
          {/* LEFT COLUMN: Founder profile */}
          <div ref={profileColRef} className="founder-profile-column">
            <div className="section-kicker founder-kicker">
              ( 06 ) <span>THE FOUNDER</span>
            </div>

            <div className="founder-portrait-wrap">
              <Image
                src={founderPhoto}
                alt={`${founderName} — ${founderRole}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 480px"
                className="founder-portrait-img"
                priority={false}
              />
              <div className="founder-portrait-scrim" aria-hidden="true" />
            </div>

            <blockquote className="founder-quote-block">
              <p className="founder-quote-text">“{founderQuote}”</p>
            </blockquote>

            <div className="founder-signature-block">
              <span className="founder-name">{founderName}</span>
              <span className="founder-role">{founderRole}</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Introduction, philosophy & statistics */}
          <div ref={contentColRef} className="founder-content-column">
            {/* Architectural Blueprint Linework Art */}
            <div className="founder-blueprint-art" aria-hidden="true">
              <svg
                viewBox="0 0 600 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="founder-blueprint-svg"
              >
                <line x1="40" y1="20" x2="40" y2="380" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="200" y1="20" x2="200" y2="380" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="360" y1="20" x2="360" y2="380" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="520" y1="20" x2="520" y2="380" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="20" y1="60" x2="580" y2="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="20" y1="180" x2="580" y2="180" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="20" y1="320" x2="580" y2="320" stroke="currentColor" strokeWidth="0.8" />
                <rect x="100" y="140" width="400" height="180" stroke="currentColor" strokeWidth="0.75" />
                <rect x="140" y="180" width="70" height="140" stroke="currentColor" strokeWidth="0.5" />
                <rect x="250" y="180" width="100" height="140" stroke="currentColor" strokeWidth="0.5" />
                <rect x="390" y="180" width="70" height="140" stroke="currentColor" strokeWidth="0.5" />
                <line x1="90" y1="120" x2="510" y2="120" stroke="currentColor" strokeWidth="0.75" />
                <line x1="120" y1="120" x2="120" y2="140" stroke="currentColor" strokeWidth="0.5" />
                <line x1="180" y1="120" x2="180" y2="140" stroke="currentColor" strokeWidth="0.5" />
                <line x1="240" y1="120" x2="240" y2="140" stroke="currentColor" strokeWidth="0.5" />
                <line x1="300" y1="120" x2="300" y2="140" stroke="currentColor" strokeWidth="0.5" />
                <line x1="360" y1="120" x2="360" y2="140" stroke="currentColor" strokeWidth="0.5" />
                <line x1="420" y1="120" x2="420" y2="140" stroke="currentColor" strokeWidth="0.5" />
                <line x1="480" y1="120" x2="480" y2="140" stroke="currentColor" strokeWidth="0.5" />
                <line x1="100" y1="95" x2="500" y2="95" stroke="currentColor" strokeWidth="0.5" />
                <line x1="100" y1="90" x2="100" y2="100" stroke="currentColor" strokeWidth="0.75" />
                <line x1="500" y1="90" x2="500" y2="100" stroke="currentColor" strokeWidth="0.75" />
                <text x="300" y="90" fill="currentColor" fontSize="7" letterSpacing="0.1em" textAnchor="middle">18.40 M</text>
                <text x="530" y="318" fill="currentColor" fontSize="7" letterSpacing="0.1em">+0.00 M</text>
                <text x="530" y="138" fill="currentColor" fontSize="7" letterSpacing="0.1em">+7.20 M</text>
              </svg>
            </div>

            <div className="founder-top-content">
              <h2 className="founder-main-headline">
                DESIGNING SPACES THAT INSPIRE. <em>BUILDING VISIONS THAT LAST.</em>
              </h2>

              <div className="founder-narrative">
                <p className="founder-lead-text">{founderBio}</p>
                <p className="founder-secondary-text">{visionText}</p>
              </div>

              <div className="founder-btn-wrap">
                <a href="#studio" className="founder-action-btn" suppressHydrationWarning>
                  <span>Our Philosophy</span>
                  <ArrowUpRight size={15} className="founder-btn-arrow" />
                </a>
              </div>
            </div>

            {/* THREE STATISTIC BLOCKS */}
            <div ref={statsRef} className="founder-stats-container">
              <div className="founder-stats-grid">
                {stats.map((stat, idx) => (
                  <div key={idx} className="founder-stat-item">
                    <span className="founder-stat-number">{stat.value}</span>
                    <span className="founder-stat-label">{stat.label}</span>
                    <span className="founder-stat-detail">{stat.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
