'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { CinematicReviews } from '@/components/cinematic-reviews'
import { WorkHorizontalShowcase } from '@/components/work-horizontal-showcase'
import { HeroCinematic } from '@/components/motion/hero-cinematic'
import { StaggeredHeading } from '@/components/motion/staggered-heading'
import { ParallaxImage } from '@/components/motion/parallax-image'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { FullNavOverlay } from '@/components/motion/full-nav-overlay'
import { HamburgerButton } from '@/components/motion/hamburger-button'
import type { Project } from '@/lib/projects'
import type { PublicSiteData } from '@/lib/cms/types'

const SECTION_IDS = ['studio', 'selected-work', 'services', 'reviews', 'contact'] as const

export function HomeClient({ siteData }: { siteData: PublicSiteData }) {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')

  const { projects, services, studioInfo, testimonials, settings, homepage, navigation } = siteData

  const showcaseProjects: Project[] = projects.map((p) => ({
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
  }))

  const visibleNav = navigation.filter((n) => n.visible && !n.isCta)
  const ctaNav = navigation.find((n) => n.visible && n.isCta)

  const mappedReviews = testimonials.map((t) => {
    const linkedProject = t.projectId
      ? projects.find((p) => p.id === t.projectId || p.slug === t.projectId)
      : undefined
    const poster =
      t.posterImage ||
      (t as { videoPoster?: string }).videoPoster ||
      t.clientPhoto ||
      linkedProject?.mainImage ||
      undefined
    return {
      id: t.id,
      client: t.clientName,
      rating: t.rating,
      projectName: t.projectName || linkedProject?.title || '',
      projectDescription: t.projectDescription || t.quote || linkedProject?.shortDescription || '',
      videoUrl: t.videoUrl || undefined,
      posterImage: poster,
      backgroundImage: t.backgroundImage || linkedProject?.mainImage || poster,
    }
  })

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`)
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`)
    }
    window.addEventListener('pointermove', updatePointer)
    return () => window.removeEventListener('pointermove', updatePointer)
  }, [])

  // Track active navigation state while scrolling through sections
  useEffect(() => {
    const updateActiveSection = () => {
      const markerY = window.innerHeight * 0.35
      let current = ''

      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= markerY && rect.bottom >= 80) {
          current = id
        }
      }

      setActiveSection(current)
    }

    const onHashEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ hash?: string }>).detail
      if (detail?.hash) {
        setActiveSection(detail.hash.replace(/^#/, ''))
      }
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('site:hashchange', onHashEvent)

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
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
        navItems={navigation}
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
          <nav className="desktop-nav" aria-label="Primary navigation">
            {visibleNav.map((item) => {
              const sectionKey = item.href.replace('/#', '').replace('#', '')
              const href = item.href.startsWith('/#') ? item.href.slice(1) : item.href
              const isCurrent = activeSection === sectionKey
              return (
                <a
                  key={item.id}
                  href={href}
                  className={isCurrent ? 'is-active' : undefined}
                  aria-current={isCurrent ? 'location' : undefined}
                >
                  {item.label}
                </a>
              )
            })}
            <a className="nav-cta" href={ctaNav?.href || '#contact'}>
              {ctaNav?.label || 'Start a project'} <ArrowUpRight size={15} />
            </a>
          </nav>

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
            <a className="text-link" href="#contact">
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
            <a href={homepage.initiateCtaHref || '#contact'} className="submit-button">
              <span>{homepage.initiateCtaLabel}</span>
              <ArrowUpRight size={18} />
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Statement Section with Architectural Parallax & Clip Reveal */}
      <section className="statement">
        <ParallaxImage
          src={homepage.approachImageUrl}
          alt="Architectural stone structure and light aperture"
          className="statement-parallax-stage"
          enableClipReveal
          parallaxSpeed={12}
        />

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
            <a className="text-link" href="#contact">
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
            {services.map((service, i) => (
              <div className="service-row group" key={service.id}>
                <span>0{i + 1}</span>
                <h3>{service.title}</h3>
                <ArrowUpRight size={20} className="service-arrow" />
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Reviews Section */}
      <CinematicReviews
        id="reviews"
        reviews={mappedReviews}
        kicker={homepage.reviewsKicker}
        heading1={homepage.reviewsHeading1}
        heading2={homepage.reviewsHeading2}
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
              <button className="submit-button" type="submit" suppressHydrationWarning>
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
          {visibleNav.slice(0, 3).map((item) => {
            const href = item.href.startsWith('/#') ? item.href.slice(1) : item.href
            return (
              <a key={item.id} href={href}>
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
          >
            Instagram
          </a>
          <a
            href={settings.linkedinUrl || '#top'}
            target={settings.linkedinUrl ? '_blank' : undefined}
            rel={settings.linkedinUrl ? 'noopener noreferrer' : undefined}
            aria-label="LinkedIn"
          >
            LinkedIn
          </a>
          <span>{settings.footerCopyright}</span>
        </div>
      </footer>
    </main>
  )
}

