import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { WorkHorizontalShowcase } from '@/components/work-horizontal-showcase'
import { WorkGalleryView } from '@/components/work-gallery-view'
import { BrandLogo } from '@/components/brand-logo'
import { SiteHeaderNav } from '@/components/site-header-nav'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { projects } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Selected Works — S_Designs',
  description: 'Explore selected architectural commissions, residential sanctuaries, and cultural spaces by S_Designs.',
}

export default function WorkPage() {
  return (
    <main className="work-archive-page">
      {/* Top Header with Charcoal Gallery Navigation */}
      <SiteHeaderNav
        showBackLink
        backHref="/#work"
        backLabel="Back to home"
        theme="charcoal"
        className="work-fixed-header"
      />

      {/* Cinematic Scroll-Driven Horizontal Parallax Exhibition */}
      <WorkHorizontalShowcase projects={projects} />

      {/* Next Section: Complete Filterable Architectural Index */}
      <section className="work-directory-section" id="archive-index">
        <div className="work-directory-intro">
          <div className="section-kicker">
            ( COMPLETE INDEX / 0{projects.length} COMMISSIONS ) <span>FILTER &amp; EXPLORE</span>
          </div>
          <ScrollReveal>
            <div className="work-directory-heading-row">
              <h2>
                Built &amp; ongoing <em>commissions.</em>
              </h2>
              <p>
                Filter the complete architectural archive by typology, search locations and materials,
                or inspect detailed technical specifications for each project.
              </p>
            </div>
          </ScrollReveal>
        </div>

        <WorkGalleryView projects={projects} />
      </section>

      {/* Modern Inquire CTA Strip */}
      <section className="work-cta-strip">
        <div className="cta-strip-inner">
          <div>
            <div className="section-kicker">( INITIATE A PROJECT )</div>
            <h2>Have a site or idea in mind?</h2>
            <p>
              We work with discerning clients globally on new builds, renovations, and interior
              architecture.
            </p>
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
      <footer className="detail-footer work-charcoal-footer">
        <BrandLogo href="/#top" size="sm" variant="glass" />
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
