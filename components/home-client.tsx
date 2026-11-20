'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { CinematicReviews } from '@/components/cinematic-reviews'
import { FounderSection } from '@/components/founder-section'
import { WorkHorizontalShowcase } from '@/components/work-horizontal-showcase'
import { HeroCinematic } from '@/components/motion/hero-cinematic'
import { StaggeredHeading } from '@/components/motion/staggered-heading'
import { ParallaxImage } from '@/components/motion/parallax-image'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { FullNavOverlay } from '@/components/motion/full-nav-overlay'
import { HamburgerButton } from '@/components/motion/hamburger-button'
import type { Project } from '@/lib/projects'
import type { PublicSiteData, CmsNavItem } from '@/lib/cms/types'

const SECTION_IDS = ['studio', 'selected-work', 'services', 'reviews', 'founder', 'contact'] as const

function ApproachMediaVideo({
  videoUrl,
  posterUrl,
  altText,
  fallbackImageUrl,
}: {
  videoUrl: string
  posterUrl?: string
  altText?: string
  fallbackImageUrl?: string
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || hasError) return

    video.muted = true
    video.defaultMuted = true

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const playPromise = video.play()
            if (playPromise !== undefined) {
              playPromise.catch(() => {})
            }
          } else {
            video.pause()
          }
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(video)

    return () => {
      observer.disconnect()
    }
  }, [hasError, videoUrl])

  if (hasError && (fallbackImageUrl || posterUrl)) {
    return (
      <ParallaxImage
        src={fallbackImageUrl || posterUrl}
        alt={altText || 'Architectural design approach'}
        className="statement-parallax-stage"
        enableClipReveal
        parallaxSpeed={12}
      />
    )
  }

  return (
    <ParallaxImage
      className="statement-parallax-stage"
      enableClipReveal
      parallaxSpeed={12}
      alt={altText || 'Our architectural approach'}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl || fallbackImageUrl || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setHasError(true)}
        aria-label={altText || 'Architectural design approach video'}
        className="w-full h-full object-cover object-center"
      />
    </ParallaxImage>
  )
}

function StudioMediaVideo({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string
  posterUrl?: string
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.defaultMuted = true

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const playPromise = video.play()
            if (playPromise !== undefined) {
              playPromise.catch(() => {})
            }
          } else {
            video.pause()
          }
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(video)

    return () => {
      observer.disconnect()
    }
  }, [videoUrl])

  return (
    <div className="intro-parallax-stage relative overflow-hidden rounded-lg aspect-[4/3]">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover object-center"
      />
    </div>
  )
}

const DesktopNav = React.memo(function DesktopNav({
  visibleNav,
  activeSection,
}: {
  visibleNav: CmsNavItem[]
  activeSection: string
}) {
  return (
    <nav className="desktop-nav" aria-label="Primary navigation">
      {visibleNav.map((item) => {
        const sectionKey = item.href.replace('/#', '').replace('#', '')
        const href = item.href.startsWith('/#') ? item.href.slice(1) : item.href
        const isCurrent = activeSection === sectionKey
        return (
          <a
            key={item.id}
            href={href}
            className={`cursor-target ${isCurrent ? 'is-active' : ''}`}
            aria-current={isCurrent ? 'location' : undefined}
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
})

export function HomeClient({ siteData }: { siteData: PublicSiteData }) {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null)

  const toggleService = useCallback((id: string) => {
    setExpandedServiceId((prev) => (prev === id ? null : id))
  }, [])

  const { projects, services, studioInfo, founder, testimonials, settings, homepage, navigation } = siteData

  const showcaseProjects: Project[] = useMemo(() => projects.map((p) => ({
    slug: p.slug,
    title: p.title,
    meta: p.meta,
    image: p.mainImage,
    size: p.size,
    location: p.location,
    year: p.year,
    type: p.type,
    category: (['Residential', 'Hospitality', 'Cultural', 'Renovation'].includes(p.category)
      ? p.category
      : 'Residential') as Project['category'],
    area: p.area,
    description: p.shortDescription || p.fullDescription,
    details: p.details,
    gallery: p.galleryImages.map((img) => img.url),
    mainMediaType: p.mainMediaType,
    mainVideoUrl: p.mainVideoUrl,
    mainPosterUrl: p.mainPosterUrl,
    galleryItems: p.galleryImages,
  })), [projects])

  const visibleNav: CmsNavItem[] = useMemo(() => {
    const rawNav = Array.isArray(navigation) ? navigation : []
    const rawVisibleNav = rawNav.filter((n) => n && n.visible && !n.isCta)
    const hasAboutNav = rawVisibleNav.some(
      (n) => n && (n.href?.includes('founder') || n.label?.toLowerCase() === 'about')
    )

    return hasAboutNav
      ? rawVisibleNav.map((n) =>
          n.label?.toLowerCase() === 'about' && !n.href?.includes('founder')
            ? { ...n, href: '#founder' }
            : n
        )
      : (() => {
          const items = [...rawVisibleNav]
          const aboutItem: CmsNavItem = {
            id: 'nav-founder',
            label: 'About',
            href: '#founder',
            subtitle: 'The Founder & Philosophy',
            previewImage:
              founder?.founderPhoto ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85',
            displayOrder: 3.5,
            visible: true,
            isCta: false,
          }
          const contactIdx = items.findIndex((i) => i.href?.includes('contact'))
          if (contactIdx !== -1) {
            items.splice(contactIdx, 0, aboutItem)
          } else {
            items.push(aboutItem)
          }
          return items
        })()
  }, [navigation, founder?.founderPhoto])

  const isVideoFile = (url?: string | null) => {
    if (!url) return false
    const clean = url.split('?')[0].toLowerCase()
    return (
      clean.endsWith('.mp4') ||
      clean.endsWith('.webm') ||
      clean.endsWith('.mov') ||
      clean.endsWith('.ogg') ||
      clean.includes('/video/upload/')
    )
  }

  const defaultReviewVideo =
    '/uploads/1794576013976-acldi-150784-799174132_medium.mp4'

  const mappedReviews = useMemo(() => {
    return testimonials.map((t) => {
      const linkedProject = t.projectId
        ? projects.find((p) => p.id === t.projectId || p.slug === t.projectId)
        : undefined

      let resolvedVideo = t.videoUrl?.trim() || ''
      let resolvedPoster =
        t.posterImage?.trim() ||
        (t as { videoPoster?: string }).videoPoster?.trim() ||
        t.clientPhoto?.trim() ||
        linkedProject?.mainImage ||
        ''

      // If posterImage was saved as a video URL, rescue it into videoUrl
      if (!resolvedVideo && isVideoFile(resolvedPoster)) {
        resolvedVideo = resolvedPoster
        resolvedPoster = linkedProject?.mainImage || t.backgroundImage || ''
      }

      if (!resolvedVideo) {
        resolvedVideo = defaultReviewVideo
      }

      if (isVideoFile(resolvedPoster)) {
        resolvedPoster = linkedProject?.mainImage || t.backgroundImage || ''
      }

      const resolvedBackground =
        t.backgroundImage?.trim() && !isVideoFile(t.backgroundImage)
          ? t.backgroundImage.trim()
          : linkedProject?.mainImage || resolvedPoster || undefined

      let resolvedQuote = ''
      if (t.quote && t.quote.trim() && t.quote.trim() !== t.projectDescription?.trim()) {
        resolvedQuote = t.quote.trim()
      } else if (t.headline && t.headline.trim()) {
        resolvedQuote = t.headline.trim()
      } else if (t.quote && t.quote.trim()) {
        resolvedQuote = t.quote.trim()
      } else {
        resolvedQuote = 'A home shaped by quiet proportion, light, and enduring stillness.'
      }

      return {
        id: t.id,
        client: t.clientName,
        rating: t.rating,
        projectName: t.projectName || linkedProject?.title || '',
        projectDescription: t.projectDescription || linkedProject?.shortDescription || '',
        quote: resolvedQuote,
        videoUrl: resolvedVideo,
        posterImage: resolvedPoster || undefined,
        backgroundImage: resolvedBackground,
      }
    })
  }, [testimonials, projects])

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`)
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`)
    }
    window.addEventListener('pointermove', updatePointer)
    return () => window.removeEventListener('pointermove', updatePointer)
  }, [])

  // Track active navigation state with IntersectionObserver (zero layout thrashing and zero continuous scroll re-renders)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection((prev) => (prev !== entry.target.id ? entry.target.id : prev))
          }
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0,
      }
    )

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    const onHashEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ hash?: string }>).detail
      if (detail?.hash) {
        const targetId = detail.hash.replace(/^#/, '')
        setActiveSection((prev) => (prev !== targetId ? targetId : prev))
      }
    }

    window.addEventListener('site:hashchange', onHashEvent)

    return () => {
      observer.disconnect()
      window.removeEventListener('site:hashchange', onHashEvent)
    }
  }, [])

  return (
    <main className="site-shell">
      {/* Full-Screen Architectural Navigation Overlay */}
      <FullNavOverlay
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        activeSection={activeSection}
        navItems={visibleNav}
        settings={settings}
      />

      {/* Fixed Site Header */}
      <header className="site-header">
        <BrandLogo
          href="#top"
          studioName={settings.studioName}
          studioSubtitle={settings.studioSubtitle}
          lightLogoUrl={settings.lightLogoUrl}
          darkLogoUrl={settings.darkLogoUrl}
        />

        <div className="header-actions">
          <DesktopNav visibleNav={visibleNav} activeSection={activeSection} />

          <HamburgerButton
            isOpen={isNavOpen}
            onClick={() => setIsNavOpen(!isNavOpen)}
          />
        </div>
      </header>

      {/* PAGE 1 — Architectural Storytelling Cinematic Hero */}
      <HeroCinematic
        eyebrow={homepage.heroEyebrow}
        titleLine1={homepage.heroTitleLine1}
        titleLine2={homepage.heroTitleLine2}
        description={homepage.heroDescription}
        indexText={homepage.heroIndexText}
        imageUrl={homepage.heroImageUrl}
        mediaType={homepage.heroMediaType}
        videoUrl={homepage.heroVideoUrl}
        posterUrl={homepage.heroPosterUrl}
        targetSectionId="#selected-work"
        studioName={homepage.heroStudioName || settings.studioName}
        studioSubtitle={homepage.heroStudioSubtitle}
      />

      {/* Studio Section (Top of Selected Work) */}
      <section className="intro section-pad animated-section studio-section" id="studio">
        <div className="section-ambient ambient-orbit" aria-hidden="true" />

        <div className="intro-left-column">
          <div className="section-kicker">
            ( 01 ) <span>{studioInfo.kicker || 'Studio note'}</span>
          </div>
          {studioInfo.studioMediaType === 'video' && studioInfo.studioVideoUrl ? (
            <StudioMediaVideo
              videoUrl={studioInfo.studioVideoUrl}
              posterUrl={studioInfo.studioPosterUrl || studioInfo.studioImage || undefined}
            />
          ) : (
            <ParallaxImage
              src={
                studioInfo.studioImage ||
                studioInfo.studioImages?.[0] ||
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85'
              }
              alt="S_Designs Studio architecture and materiality"
              className="intro-parallax-stage"
              enableClipReveal
              parallaxSpeed={10}
            />
          )}
        </div>

        <div className="intro-copy">
          <StaggeredHeading
            tag="h2"
            lines={[
              { text: studioInfo.heading },
              { text: studioInfo.accentHeading, isAccent: true },
            ]}
          />

          <ScrollReveal delay={0.25}>
            <p>{studioInfo.description || studioInfo.introText}</p>
            <a className="text-link cursor-target" href="#contact">
              More about the studio <ArrowUpRight size={16} />
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* PAGE 2 — Selected Work (Cinematic Horizontal Parallax Gallery) */}
      <WorkHorizontalShowcase
        id="selected-work"
        projects={showcaseProjects}
        kicker={homepage.selectedWorkKicker}
        heading={homepage.selectedWorkHeading}
        slideGap={
          settings.typography?.workSlideGap &&
          settings.typography.workSlideGap !== 'clamp(140px, 18vw, 270px)'
            ? settings.typography.workSlideGap
            : undefined
        }
        secondaryImageSize={settings.typography?.workSecondaryImageSize}
      />

      {/* PAGE 3 — Initiate a Project */}
      <section className="work-cta-strip" id="initiate-project">
        <div className="cta-strip-inner">
          <ScrollReveal className="cta-strip-copy">
            <div className="section-kicker">{homepage.initiateKicker}</div>
            <h2>{homepage.initiateHeading}</h2>
            <p className="cta-strip-subtitle">{homepage.initiateSubtitle}</p>
            <p>{homepage.initiateDescription}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.14} className="cta-strip-actions">
            <a href={homepage.initiateCtaHref || '#contact'} className="submit-button cursor-target" data-crosshair-target data-cursor-label="Initiate">
              <span>{homepage.initiateCtaLabel}</span>
              <ArrowUpRight size={18} />
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Statement Section with Architectural Parallax & Clip Reveal */}
      <section className="statement">
        {homepage.approachMediaType === 'video' && homepage.approachVideoUrl ? (
          <ApproachMediaVideo
            videoUrl={homepage.approachVideoUrl}
            posterUrl={homepage.approachPosterUrl}
            altText={homepage.approachAlt}
            fallbackImageUrl={homepage.approachImageUrl}
          />
        ) : (
          <ParallaxImage
            src={homepage.approachImageUrl}
            alt={homepage.approachAlt || "Architectural stone structure and light aperture"}
            className="statement-parallax-stage"
            enableClipReveal
            parallaxSpeed={12}
          />
        )}

        <div className="statement-copy">
          <div className="section-kicker">( 03 ) <span>{homepage.approachKicker}</span></div>

          <StaggeredHeading
            tag="h2"
            lines={[
              { text: homepage.approachHeading1 },
              { text: homepage.approachHeading2, isAccent: true },
            ]}
          />

          <ScrollReveal delay={0.2}>
            <p>{homepage.approachDescription}</p>
            <a className="text-link cursor-target" href="#contact" data-cursor-label="Contact">
              Start a conversation <ArrowUpRight size={16} />
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Services Section with Staggered Interactive Rows */}
      <section className="services section-pad animated-section services-section" id="services">
        <div className="section-ambient ambient-lines" aria-hidden="true" />
        <div className="section-heading">
          <div className="section-kicker">( 04 ) <span>{homepage.servicesKicker}</span></div>
          <p className="section-note">{homepage.servicesNote}</p>
        </div>

        <ScrollReveal variant="stagger-children" stagger={0.1}>
          <div className="service-list">
            {services.map((service, i) => {
              const isExpanded = expandedServiceId === service.id
              const description = (service.shortDescription || service.fullDescription || '').trim()

              return (
                <div
                  key={service.id}
                  className={`service-row group cursor-target ${isExpanded ? 'is-expanded' : ''}`}
                  data-crosshair-target
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-controls={`service-desc-${service.id}`}
                  onClick={() => toggleService(service.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleService(service.id)
                    }
                  }}
                  suppressHydrationWarning
                >
                  <span className="service-index" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <div className="service-content-col">
                    <h3 className="service-title">{service.title}</h3>
                    {description && (
                      <div
                        id={`service-desc-${service.id}`}
                        className={`service-description-collapse ${isExpanded ? 'is-expanded' : ''}`}
                        aria-hidden={!isExpanded}
                      >
                        <div className="service-description-inner">
                          <p className="service-description-text text-[#FFFFFF]">{description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="service-toggle-col" aria-hidden="true">
                    <ChevronDown
                      size={20}
                      className={`service-toggle-icon ${isExpanded ? 'is-expanded' : ''}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollReveal>
      </section>

      {/* Reviews Section */}
      <CinematicReviews
        id="reviews"
        reviews={mappedReviews}
        kicker={
          homepage.reviewsKicker && homepage.reviewsKicker.toLowerCase() === 'client reviews'
            ? 'Client Reviews'
            : (homepage.reviewsKicker || 'Client Reviews')
        }
        heading1={
          homepage.reviewsHeading1?.trim().toLowerCase() === 'quiet'
            ? ''
            : (homepage.reviewsHeading1 || '')
        }
        heading2={
          homepage.reviewsHeading2?.trim().toLowerCase().replace('.', '') === 'appreciation'
            ? ''
            : (homepage.reviewsHeading2 || '')
        }
      />

      {/* Founder / About Section */}
      <FounderSection
        founder={founder}
        studioInfo={studioInfo}
        approachDescription={homepage.approachDescription}
      />

      {/* Contact Section */}
      <section className="contact section-pad" id="contact">
        <div className="section-kicker">( 06 ) <span>{homepage.contactKicker}</span></div>
        <div className="contact-layout">
          <div>
            <StaggeredHeading
              tag="h2"
              lines={[
                { text: homepage.contactHeading1 },
                { text: homepage.contactHeading2, isAccent: true },
              ]}
            />
            <ScrollReveal delay={0.2}>
              <p>{homepage.contactDescription}</p>
              <div className="contact-details">
                <span>{settings.email}</span>
                <span>{settings.officeAddress}</span>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.3} variant="fade-up">
            <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }} suppressHydrationWarning>
              <label>
                Name
                <input required name="name" placeholder="Your name" suppressHydrationWarning />
              </label>
              <label>
                Email
                <input required type="email" name="email" placeholder="you@email.com" suppressHydrationWarning />
              </label>
              <label>
                Tell us about your project
                <textarea required name="message" rows={4} placeholder="A few words to begin..." suppressHydrationWarning />
              </label>
              <button className="submit-button cursor-target" data-crosshair-target data-cursor-label="Submit" type="submit" suppressHydrationWarning>
                {submitted ? 'Message sent — thank you' : 'Send inquiry'} <ArrowUpRight size={17} />
              </button>
            </form>
          </ScrollReveal>
        </div>
      </section>

      {/* Site Footer */}
      <footer className="site-footer">
        <BrandLogo
          href="#top"
          size="sm"
          studioName={settings.studioName}
          studioSubtitle={settings.studioSubtitle}
          lightLogoUrl={settings.lightLogoUrl}
          darkLogoUrl={settings.darkLogoUrl}
        />
        <div className="footer-links">
          {(visibleNav || []).map((item) => {
            const href = item.href.startsWith('/#') ? item.href.slice(1) : item.href
            return (
              <a key={item.id} href={href} className="cursor-target">
                {item.label}
              </a>
            )
          })}
        </div>
        <div className="socials">
          <a
            href={settings.instagramUrl || '#top'}
            target={settings.instagramUrl ? '_blank' : undefined}
            rel={settings.instagramUrl ? 'noopener noreferrer' : undefined}
            aria-label="Instagram"
            className="cursor-target"
          >
            Instagram
          </a>
          <a
            href={settings.linkedinUrl || '#top'}
            target={settings.linkedinUrl ? '_blank' : undefined}
            rel={settings.linkedinUrl ? 'noopener noreferrer' : undefined}
            aria-label="LinkedIn"
            className="cursor-target"
          >
            LinkedIn
          </a>
          <span>{settings.footerCopyright}</span>
        </div>
      </footer>
    </main>
  )
}

