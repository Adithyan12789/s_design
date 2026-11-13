import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { ProjectGalleryInteractive } from '@/components/project-gallery-interactive'
import { BrandLogo } from '@/components/brand-logo'
import { SiteHeaderNav } from '@/components/site-header-nav'
import { StaggeredHeading } from '@/components/motion/staggered-heading'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { getPublishedProjectBySlug, getPublicSiteData } from '@/lib/cms/queries'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [{ project }, siteData] = await Promise.all([
    getPublishedProjectBySlug(slug),
    getPublicSiteData(),
  ])
  return project
    ? {
        title: project.seoTitle || `${project.title} — ${siteData.settings.studioName} Architecture`,
        description: project.seoDescription || project.shortDescription || project.fullDescription,
      }
    : { title: `Project — ${siteData.settings.studioName}` }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [{ project, allProjects }, siteData] = await Promise.all([
    getPublishedProjectBySlug(slug),
    getPublicSiteData(),
  ])
  if (!project || allProjects.length === 0) notFound()

  const index = allProjects.findIndex((item) => item.slug === project.slug)
  const safeIndex = index === -1 ? 0 : index
  const nextIndex = (safeIndex + 1) % allProjects.length
  const prevIndex = (safeIndex - 1 + allProjects.length) % allProjects.length
  const nextProject = allProjects[nextIndex]
  const prevProject = allProjects[prevIndex]

  const allGalleryImages = [
    project.mainImage,
    ...project.galleryImages.map((img) => img.url).filter(Boolean),
  ].filter(Boolean)

  return (
    <main className="project-detail-page">
      {/* Top Header with Full Navigation Overlay */}
      <SiteHeaderNav
        showBackLink
        backHref="/#selected-work"
        backLabel="Selected Work"
        navItems={siteData.navigation}
        settings={siteData.settings}
      />

      {/* Hero Section: Two-Column Architectural Case Study Layout */}
      <section className="detail-hero">
        <div className="detail-hero-media">
          {project.mainMediaType === 'video' && project.mainVideoUrl ? (
            <video
              src={project.mainVideoUrl}
              poster={project.mainPosterUrl || project.mainImage || undefined}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="detail-hero-photo w-full h-full object-cover"
              aria-label={project.mainImageAlt || `${project.title} — ${project.location}`}
            />
          ) : (
            <img
              src={project.mainImage}
              alt={project.mainImageAlt || `${project.title} — ${project.location}`}
              className="detail-hero-photo"
              loading="eager"
            />
          )}
        </div>

        <div className="detail-hero-copy">
          <div className="detail-hero-index">
            <span>PROJECT / {project.year}</span>
            <span>
              CASE STUDY {String(safeIndex + 1).padStart(2, '0')} OF{' '}
              {String(allProjects.length).padStart(2, '0')}
            </span>
          </div>
          <p className="eyebrow">{project.category} · {project.location}</p>
          <StaggeredHeading
            tag="h1"
            animateOnInit
            lines={[{ text: project.title }]}
          />
          <p className="detail-hero-meta">{project.meta}</p>
          <p className="detail-hero-desc">{project.fullDescription || project.shortDescription}</p>
          <div className="detail-hero-actions">
            <div className="detail-hero-scroll">
              Scroll to explore <span>↓</span>
            </div>
            <Link href="/#contact" className="text-link detail-hero-cta">
              Start a conversation <ArrowUpRight size={15} />
            </Link>
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
              <p className="lead-paragraph">{project.fullDescription || project.shortDescription}</p>
              <p className="sub-paragraph">
                Every detail was developed through physical mockups and light studies on site,
                ensuring a seamless dialogue between built geometry and the surrounding landscape.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Interactive Gallery */}
      <section className="detail-gallery section-pad">
        <div className="section-heading">
          <div className="section-kicker">
            ( 02 ) <span>In Context &amp; Details</span>
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
            style={{ backgroundImage: `url(${nextProject.mainImage})` }}
          />
          <div className="next-project-overlay" />
          <div className="next-project-content">
            <span className="next-tag">Next Project · {String(nextIndex + 1).padStart(2, '0')}</span>
            <h2>{nextProject.title}</h2>
            <p>{nextProject.location} — {nextProject.type}</p>
            <div className="next-actions">
              <Link href={`/work/${nextProject.slug}`} className="submit-button">
                <span>View {nextProject.title}</span>
                <ArrowRight size={17} />
              </Link>
              <Link href="/#selected-work" className="text-link">
                View entire collection <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Footer */}
      <footer className="detail-footer">
        <BrandLogo
          href="/#top"
          size="sm"
          variant="glass"
          studioName={siteData.settings.studioName}
          studioSubtitle={siteData.settings.studioSubtitle}
          lightLogoUrl={siteData.settings.lightLogoUrl}
          darkLogoUrl={siteData.settings.darkLogoUrl}
        />
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
