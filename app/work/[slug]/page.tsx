import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin, Calendar, Maximize2, Layers, Compass } from 'lucide-react'
import { ProjectImage3D } from '@/components/project-image-3d'
import { ProjectGalleryInteractive } from '@/components/project-gallery-interactive'
import { BrandLogo } from '@/components/brand-logo'
import { SiteHeaderNav } from '@/components/site-header-nav'
import { StaggeredHeading } from '@/components/motion/staggered-heading'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { projects } from '@/lib/projects'

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projects.find((item) => item.slug === slug)
  return project
    ? { title: `${project.title} — S_Designs Architecture`, description: project.description }
    : { title: 'Project — S_Designs' }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const index = projects.findIndex((item) => item.slug === slug)
  if (index === -1) notFound()
  const project = projects[index]

  const nextIndex = (index + 1) % projects.length
  const prevIndex = (index - 1 + projects.length) % projects.length
  const nextProject = projects[nextIndex]
  const prevProject = projects[prevIndex]

  const allGalleryImages = [project.image, ...project.gallery]

  return (
    <main className="project-detail-page">
      {/* Top Header with Full Navigation Overlay */}
      <SiteHeaderNav showBackLink backHref="/work" backLabel="All Works" />

      {/* Hero Section */}
      <section className="detail-hero">
        <ProjectImage3D
          src={project.image}
          alt={`${project.title} project exterior`}
          className="detail-hero-image"
          priority
        />
        <div className="detail-hero-overlay" />
        <div className="detail-hero-copy">
          <div className="detail-hero-index">
            <span>PROJECT / {project.year}</span>
            <span>CASE STUDY 0{index + 1} OF 0{projects.length}</span>
          </div>
          <p className="eyebrow">{project.category} · {project.location}</p>
          <StaggeredHeading
            tag="h1"
            animateOnInit
            lines={[{ text: project.title }]}
          />
          <p className="detail-hero-meta">{project.meta}</p>
          <div className="detail-hero-scroll">
            Scroll to explore <span>↓</span>
          </div>
        </div>
      </section>

      {/* Project Note & Narrative */}
      <section className="detail-intro section-pad">
        <div className="section-kicker">
          ( 01 ) <span>Architectural Intent</span>
        </div>
        <div className="detail-intro-grid">
          <StaggeredHeading
            tag="h2"
            lines={[
              { text: 'Designed for' },
              { text: 'quiet living.', isAccent: true },
            ]}
          />
          <div className="detail-intro-copy-block">
            <ScrollReveal delay={0.15}>
              <p className="lead-paragraph">{project.description}</p>
              <p className="sub-paragraph">
                Every detail was developed through physical mockups and light studies on site,
                ensuring a seamless dialogue between built geometry and the surrounding landscape.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* At a Glance: Key Specifications */}
      <section className="detail-facts section-pad">
        <div className="section-kicker">
          ( 02 ) <span>Key Specifications</span>
        </div>
        <ScrollReveal variant="stagger-children" stagger={0.06}>
          <div className="detail-facts-grid">
            <div className="spec-card">
              <MapPin className="spec-icon" size={18} />
              <span>Location</span>
              <strong>{project.location}</strong>
            </div>
            <div className="spec-card">
              <Calendar className="spec-icon" size={18} />
              <span>Completed</span>
              <strong>{project.year}</strong>
            </div>
            <div className="spec-card">
              <Maximize2 className="spec-icon" size={18} />
              <span>Scale / Area</span>
              <strong>{project.area}</strong>
            </div>
            <div className="spec-card">
              <Layers className="spec-icon" size={18} />
              <span>Typology</span>
              <strong>{project.type}</strong>
            </div>
            {project.details.map((detail, dIdx) => (
              <div key={detail} className="spec-card">
                <Compass className="spec-icon" size={18} />
                <span>Detail 0{dIdx + 1}</span>
                <strong>{detail}</strong>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Interactive Gallery */}
      <section className="detail-gallery section-pad">
        <div className="section-heading">
          <div className="section-kicker">
            ( 03 ) <span>In Context &amp; Details</span>
          </div>
          <span className="section-note">Click any plate for high-resolution inspection</span>
        </div>
        <ProjectGalleryInteractive title={project.title} images={allGalleryImages} />
      </section>

      {/* Next Project Teaser Showcase Card */}
      <section className="detail-next-project-section section-pad">
        <div className="section-kicker">
          ( CONTINUING EXPLORATION ) <span>NEXT CASE STUDY</span>
        </div>
        <div className="next-project-banner">
          <div
            className="next-project-bg"
            style={{ backgroundImage: `url(${nextProject.image})` }}
          />
          <div className="next-project-overlay" />
          <div className="next-project-content">
            <span className="next-tag">Next Project · 0{nextIndex + 1}</span>
            <h2>{nextProject.title}</h2>
            <p>{nextProject.location} — {nextProject.type}</p>
            <div className="next-actions">
              <Link href={`/work/${nextProject.slug}`} className="submit-button">
                <span>View {nextProject.title}</span>
                <ArrowRight size={17} />
              </Link>
              <Link href="/work" className="text-link">
                View entire collection <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Footer */}
      <footer className="detail-footer">
        <BrandLogo href="/#top" size="sm" variant="glass" />
        <div className="project-pager-nav">
          <Link href={`/work/${prevProject.slug}`} className="pager-link">
            <ArrowLeft size={14} /> Previous: {prevProject.title}
          </Link>
          <span className="dot">/</span>
          <Link href={`/work/${nextProject.slug}`} className="pager-link">
            Next: {nextProject.title} <ArrowRight size={14} />
          </Link>
        </div>
        <Link className="text-link" href="/#contact">
          Start a conversation <ArrowUpRight size={16} />
        </Link>
      </footer>
    </main>
  )
}
