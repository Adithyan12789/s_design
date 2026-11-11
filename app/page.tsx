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
import { projects } from '@/lib/projects'

const services = [
  'Residential architecture',
  'Interior environments',
  'Renovation & adaptive reuse',
  'Visualization & consultation',
]

const reviews = [
  {
    id: 'almeida',
    client: 'Henrique & Sofia Almeida',
    quote:
      'They captured the quietness we had imagined for years — every room feels calm, balanced, and deeply intentional.',
    rating: 5,
  },
  {
    id: 'takahashi',
    client: 'Kenji Takahashi',
    quote:
      'Rare restraint and extraordinary care in every material detail. Our space still surprises us in morning light.',
    rating: 5,
  },
  {
    id: 'meier-keller',
    client: 'Elena Meier-Keller',
    quote:
      'From the earliest conversation to completion, their clarity and precision made the entire journey effortless.',
    rating: 5,
  },
]

const SECTION_IDS = ['studio', 'selected-work', 'services', 'reviews', 'contact'] as const

export default function Page() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')

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
      />

      {/* Fixed Site Header */}
      <header className="site-header">
        <BrandLogo href="#top" />

        <div className="header-actions">
          <nav className="desktop-nav" aria-label="Primary navigation">
            <a
              href="#selected-work"
              className={activeSection === 'selected-work' ? 'is-active' : undefined}
              aria-current={activeSection === 'selected-work' ? 'location' : undefined}
            >
              Work
            </a>
            <a
              href="#studio"
              className={activeSection === 'studio' ? 'is-active' : undefined}
              aria-current={activeSection === 'studio' ? 'location' : undefined}
            >
              Studio
            </a>
            <a
              href="#services"
              className={activeSection === 'services' ? 'is-active' : undefined}
              aria-current={activeSection === 'services' ? 'location' : undefined}
            >
              Services
            </a>
            <a
              href="#contact"
              className={activeSection === 'contact' ? 'is-active' : undefined}
              aria-current={activeSection === 'contact' ? 'location' : undefined}
            >
              Contact
            </a>
            <a className="nav-cta" href="#contact">
              Start a project <ArrowUpRight size={15} />
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
        eyebrow="Independent architecture studio · Portugal / Worldwide"
        titleLine1="Spaces with"
        titleLine2="quiet presence."
        description="We shape considered places for living, working and gathering — grounded in material, light and context."
        indexText="01 / 04"
        imageUrl="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=90"
        targetSectionId="#selected-work"
        studioName="S_DE_SIGN"
        studioSubtitle="ARCHITECTURE & SPATIAL PRACTICE"
      />

      {/* Studio Section (Top of Selected Work) */}
      <section className="intro section-pad animated-section studio-section" id="studio">
        <div className="section-ambient ambient-orbit" aria-hidden="true" />
        <div className="section-kicker">( 01 ) <span>Studio note</span></div>

        <div className="intro-copy">
          <StaggeredHeading
            tag="h2"
            lines={[
              { text: 'Architecture is the art of' },
              { text: 'making room for life.', isAccent: true },
            ]}
          />

          <ScrollReveal delay={0.25}>
            <p>
              S_Designs is a small, independent practice working across architecture, interiors and objects. We believe the most lasting spaces begin with careful attention — to how light moves, how materials age, and how people belong.
            </p>
            <a className="text-link" href="#contact">
              More about the studio <ArrowUpRight size={16} />
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* PAGE 2 — Selected Work (Cinematic Horizontal Parallax Gallery) */}
      <WorkHorizontalShowcase id="selected-work" projects={projects} />

      {/* PAGE 3 — Initiate a Project */}
      <section className="work-cta-strip" id="initiate-project">
        <div className="cta-strip-inner">
          <ScrollReveal className="cta-strip-copy">
            <div className="section-kicker">( INITIATE A PROJECT )</div>
            <h2>INITIATE A PROJECT</h2>
            <p className="cta-strip-subtitle">Have a site or idea in mind?</p>
            <p>
              We work with discerning clients globally on new builds, renovations, and interior
              architecture.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.14} className="cta-strip-actions">
            <a href="#contact" className="submit-button">
              <span>Begin a conversation</span>
              <ArrowUpRight size={18} />
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Statement Section with Architectural Parallax & Clip Reveal */}
      <section className="statement">
        <ParallaxImage
          src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85"
          alt="Architectural stone structure and light aperture"
          className="statement-parallax-stage"
          enableClipReveal
          parallaxSpeed={12}
        />

        <div className="statement-copy">
          <div className="section-kicker">( 03 ) <span>Our approach</span></div>

          <StaggeredHeading
            tag="h2"
            lines={[
              { text: 'Less, but' },
              { text: 'better.', isAccent: true },
            ]}
          />

          <ScrollReveal delay={0.2}>
            <p>
              We work slowly and collaboratively, building a clear idea before adding anything else. The result is architecture that feels inevitable — generous, tactile and made to last.
            </p>
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
          <div className="section-kicker">( 04 ) <span>What we do</span></div>
          <p className="section-note">From first sketch to final detail.</p>
        </div>

        <ScrollReveal variant="stagger-children" stagger={0.1}>
          <div className="service-list">
            {services.map((service, i) => (
              <div className="service-row group" key={service}>
                <span>0{i + 1}</span>
                <h3>{service}</h3>
                <ArrowUpRight size={20} className="service-arrow" />
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Reviews Section */}
      <CinematicReviews id="reviews" reviews={reviews} />

      {/* Contact Section */}
      <section className="contact section-pad" id="contact">
        <div className="section-kicker">( 06 ) <span>Begin a project</span></div>
        <div className="contact-layout">
          <div>
            <StaggeredHeading
              tag="h2"
              lines={[
                { text: 'Have a place' },
                { text: 'in mind?', isAccent: true },
              ]}
            />
            <ScrollReveal delay={0.2}>
              <p>
                Tell us a little about what you are imagining. We will get back to you within three working days.
              </p>
              <div className="contact-details">
                <span>hello@sdesigns.studio</span>
                <span>Lisbon · Portugal</span>
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
        <BrandLogo href="#top" size="sm" />
        <div className="footer-links">
          <a href="#selected-work">Work</a>
          <a href="#studio">Studio</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="socials">
          <a href="#top" aria-label="Instagram">Instagram</a>
          <a href="#top" aria-label="LinkedIn">LinkedIn</a>
          <span>© 2024 S_Designs</span>
        </div>
      </footer>
    </main>
  )
}
