import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { WorkGalleryView } from '@/components/work-gallery-view'
import { BrandLogo } from '@/components/brand-logo'
import { SiteHeaderNav } from '@/components/site-header-nav'
import { StaggeredHeading } from '@/components/motion/staggered-heading'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { projects } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Selected Works — S_Designs',
  description: 'Explore selected architectural commissions, residential sanctuaries, and cultural spaces by S_Designs.',
}

export default function WorkPage() {
  return (
    <main className="work-archive-page">
      {/* Top Header with Architectural Navigation */}
      <SiteHeaderNav showBackLink backHref="/#work" backLabel="Back to home" />

      {/* Hero Introduction Banner */}
      <section className="work-hero-banner">
        <div className="section-kicker">
          ( PORTFOLIO / 2021 — 2024 ) <span>ARCHITECTURAL ARCHIVE</span>
        </div>
        <div className="work-hero-content">
          <StaggeredHeading
            tag="h1"
            animateOnInit
            lines={[
              { text: 'Selected works &' },
              { text: 'considered spaces.', isAccent: true },
            ]}
          />

          <div className="work-hero-aside">
            <ScrollReveal delay={0.2}>
              <p>
                Each project begins with a deep reading of its landscape, light, and material heritage.
                Browse our complete archive of built residences, retreats, and cultural pavilions.
              </p>
              <div className="work-hero-metrics">
                <div className="metric-box">
                  <span className="metric-number">0{projects.length}</span>
                  <span className="metric-label">Commissions</span>
                </div>
                <div className="metric-box">
                  <span className="metric-number">04</span>
                  <span className="metric-label">Countries</span>
                </div>
                <div className="metric-box">
                  <span className="metric-number">100%</span>
                  <span className="metric-label">Bespoke Design</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Interactive Gallery with Filters & Quick View */}
      <section className="work-gallery-section">
        <WorkGalleryView projects={projects} />
      </section>

      {/* Modern Inquire CTA Strip */}
      <section className="work-cta-strip">
        <div className="cta-strip-inner">
          <div>
            <div className="section-kicker">( INITIATE A PROJECT )</div>
            <h2>Have a site or idea in mind?</h2>
            <p>We work with discerning clients globally on new builds, renovations, and interior architecture.</p>
          </div>
          <div className="cta-strip-actions">
            <Link href="/#contact" className="submit-button">
              <span>Begin a conversation</span>
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="detail-footer">
        <BrandLogo href="/#top" size="sm" />
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/work">All Works</Link>
          <Link href="/#contact">Contact</Link>
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
