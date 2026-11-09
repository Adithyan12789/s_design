'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { ReactBitsBackground } from '@/components/react-bits-background'
import { TiltProjectCard } from '@/components/tilt-project-card'
import { BrandLogo } from '@/components/brand-logo'
import { CinematicLoader } from '@/components/motion/cinematic-loader'
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

export default function Page() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`)
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`)
    }
    window.addEventListener('pointermove', updatePointer)
    return () => window.removeEventListener('pointermove', updatePointer)
  }, [])

  return (
    <main className="site-shell">
      {/* Cinematic Entrance Curtain */}
      <CinematicLoader />

      {/* Full-Screen Architectural Navigation Overlay */}
      <FullNavOverlay isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <ReactBitsBackground />

      {/* Fixed Site Header */}
      <header className="site-header">
        <BrandLogo href="#top" />

        <div className="header-actions">
          <nav className="desktop-nav" aria-label="Primary navigation">
            <Link href="/work">Work</Link>
            <a href="#studio">Studio</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
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

      {/* Cinematic Hero Entrance */}
      <HeroCinematic
        eyebrow="Independent architecture studio · Portugal / Worldwide"
        titleLine1="Spaces with"
        titleLine2="quiet presence."
        description="We shape considered places for living, working and gathering — grounded in material, light and context."
        indexText="01 / 04"
        imageUrl="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=90"
        targetSectionId="#work"
      />

      {/* Studio Section */}
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

      {/* Selected Work Section */}
      <section className="work section-pad animated-section work-section" id="work">
        <div className="section-ambient ambient-grid" aria-hidden="true" />
        <div className="section-heading">
          <div className="section-kicker">( 02 ) <span>Selected work</span></div>
          <Link className="text-link" href="/work">
            View full archive ({projects.length}) <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="project-grid">
          {projects.map((project, index) => (
            <TiltProjectCard key={project.title} {...project} index={index} />
          ))}
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

      {/* Contact Section */}
      <section className="contact section-pad" id="contact">
        <div className="section-kicker">( 05 ) <span>Begin a project</span></div>
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
          <Link href="/work">Work</Link>
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
