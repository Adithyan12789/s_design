'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, Menu, X } from 'lucide-react'
import { ReactBitsBackground } from '@/components/react-bits-background'
import { TiltProjectCard } from '@/components/tilt-project-card'
import { projects } from '@/lib/projects'

const services = ['Residential architecture', 'Interior environments', 'Renovation & adaptive reuse', 'Visualization & consultation']

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
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
      <ReactBitsBackground />
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="S_Designs home">S_Designs<span>ARCHITECTURE / OBJECTS</span></a>
        <nav className={`desktop-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
          <Link href="/work" onClick={() => setMenuOpen(false)}>Work</Link>
          <a href="#studio" onClick={() => setMenuOpen(false)}>Studio</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Start a project <ArrowUpRight size={15} /></a>
        </nav>
        <button className="menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)} suppressHydrationWarning>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-image" role="img" aria-label="Minimal concrete home surrounded by trees" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">Independent architecture studio · Portugal / Worldwide</p>
          <h1>Spaces with<br /><em>quiet presence.</em></h1>
          <div className="hero-bottom">
            <p>We shape considered places for living, working and gathering — grounded in material, light and context.</p>
            <a className="circle-link" href="#work" aria-label="Explore selected work"><ArrowDownRight size={23} /></a>
          </div>
        </div>
        <div className="hero-index">01 <span>/</span> 04</div>
      </section>

      <section className="intro section-pad animated-section studio-section" id="studio"><div className="section-ambient ambient-orbit" aria-hidden="true" />
        <div className="section-kicker">( 01 ) <span>Studio note</span></div>
        <div className="intro-copy"><h2>Architecture is the art of making <em>room for life.</em></h2><p>S_Designs is a small, independent practice working across architecture, interiors and objects. We believe the most lasting spaces begin with careful attention — to how light moves, how materials age, and how people belong.</p><a className="text-link" href="#contact">More about the studio <ArrowUpRight size={16} /></a></div>
      </section>

      <section className="work section-pad animated-section work-section" id="work"><div className="section-ambient ambient-grid" aria-hidden="true" />
        <div className="section-heading"><div className="section-kicker">( 02 ) <span>Selected work</span></div><Link className="text-link" href="/work">View full archive ({projects.length}) <ArrowUpRight size={16} /></Link></div>
        <div className="project-grid">{projects.map((project, index) => <TiltProjectCard key={project.title} {...project} index={index} />)}</div>
      </section>

      <section className="statement"><div className="statement-image" /><div className="statement-copy"><div className="section-kicker">( 03 ) <span>Our approach</span></div><h2>Less, but <em>better.</em></h2><p>We work slowly and collaboratively, building a clear idea before adding anything else. The result is architecture that feels inevitable — generous, tactile and made to last.</p><a className="text-link" href="#contact">Start a conversation <ArrowUpRight size={16} /></a></div></section>

      <section className="services section-pad animated-section services-section" id="services"><div className="section-ambient ambient-lines" aria-hidden="true" /><div className="section-heading"><div className="section-kicker">( 04 ) <span>What we do</span></div><p className="section-note">From first sketch to final detail.</p></div><div className="service-list">{services.map((service, i) => <div className="service-row" key={service}><span>0{i + 1}</span><h3>{service}</h3><ArrowUpRight size={20} /></div>)}</div></section>

      <section className="contact section-pad" id="contact">
        <div className="section-kicker">( 05 ) <span>Begin a project</span></div>
        <div className="contact-layout">
          <div>
            <h2>Have a place<br />in <em>mind?</em></h2>
            <p>Tell us a little about what you are imagining. We will get back to you within three working days.</p>
            <div className="contact-details">
              <span>hello@sdesigns.studio</span>
              <span>Lisbon · Portugal</span>
            </div>
          </div>
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
        </div>
      </section>

      <footer className="site-footer"><a className="wordmark" href="#top">S_Designs<span>ARCHITECTURE / OBJECTS</span></a><div className="footer-links"><Link href="/work">Work</Link><a href="#studio">Studio</a><a href="#contact">Contact</a></div><div className="socials"><a href="#top" aria-label="Instagram">Instagram</a><a href="#top" aria-label="LinkedIn">LinkedIn</a><span>© 2024 S_Designs</span></div></footer>
    </main>
  )
}
