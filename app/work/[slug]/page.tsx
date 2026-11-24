import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import {
  ProjectGalleryInteractive,
  type ProjectGalleryPlate,
} from '@/components/project-gallery-interactive'
import { DetailHeroMedia } from '@/components/detail-hero-media'
import { BrandLogo } from '@/components/brand-logo'
import { SiteHeaderNav } from '@/components/site-header-nav'
import { StaggeredHeading } from '@/components/motion/staggered-heading'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { ProjectNavigationFeedbackGuard } from '@/components/project-navigation-feedback-guard'
import { getPublishedProjectBySlug, getPublicSiteData } from '@/lib/cms/queries'
import { isVideoSource, getCloudinaryVideoThumbnail } from '@/lib/storage/video-thumbnails'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [{ project }, siteData] = await Promise.all([
    getPublishedProjectBySlug(slug),
    getPublicSiteData(),
  ])

  if (!project) {
    return { title: `Project — ${siteData.settings.studioName || 'S_DE_SIGN'}` }
  }

  const studioName = siteData.settings.studioName || 'S_DE_SIGN'
  const title =
    project.seoTitle?.trim() ||
    `${project.title} — ${project.category ? `${project.category} Architecture — ` : ''}${studioName}`
  const description =
    project.seoDescription?.trim() ||
    project.shortDescription?.trim() ||
    project.fullDescription?.trim() ||
    `${project.title} architectural case study in ${project.location} by ${studioName}.`
  const canonicalUrl = `https://sdesign.co.in/work/${project.slug}`
  const ogImage = project.mainImage || '/s-design-logo.jpg'

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: studioName,
      type: 'article',
      images: [
        {
          url: ogImage,
          alt: project.mainImageAlt || `${project.title} — ${project.location} Architecture`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [{ project, allProjects }, siteData] = await Promise.all([
    getPublishedProjectBySlug(slug),
    getPublicSiteData(),
  ])
  if (!project || allProjects.length === 0) notFound()

  const studioName = siteData.settings.studioName || 'S_DE_SIGN'
  const canonicalUrl = `https://sdesign.co.in/work/${project.slug}`
  const projectDesc = project.shortDescription || project.fullDescription || `${project.title} architectural case study in ${project.location}.`
  const publishedDate = project.updatedAt
    ? (!isNaN(new Date(project.updatedAt).getTime()) ? new Date(project.updatedAt).toISOString() : new Date().toISOString())
    : new Date().toISOString()

  // Comprehensive Schema.org @graph: Breadcrumbs, CreativeWork, and optional VideoObject
  const structuredDataGraph: any[] = [
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://sdesign.co.in',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Selected Work',
          item: 'https://sdesign.co.in/work',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: project.title,
          item: canonicalUrl,
        },
      ],
    },
    {
      '@type': 'CreativeWork',
      '@id': `${canonicalUrl}#project`,
      name: project.title,
      headline: `${project.title} — ${project.category || ''} Architecture`,
      description: projectDesc,
      url: canonicalUrl,
      image: project.mainImage || 'https://sdesign.co.in/s-design-logo.jpg',
      datePublished: publishedDate,
      dateModified: publishedDate,
      inLanguage: 'en',
      author: {
        '@type': 'Organization',
        name: studioName,
        url: 'https://sdesign.co.in',
      },
      creator: {
        '@type': 'Organization',
        name: studioName,
        url: 'https://sdesign.co.in',
      },
      ...(project.location ? { contentLocation: { '@type': 'Place', name: project.location } } : {}),
      ...(project.year ? { copyrightYear: parseInt(project.year, 10) || undefined } : {}),
    },
  ]

  if (project.mainMediaType === 'video' && project.mainVideoUrl && project.mainVideoUrl.trim()) {
    structuredDataGraph.push({
      '@type': 'VideoObject',
      '@id': `${canonicalUrl}#video`,
      name: `${project.title} Architectural Film`,
      description: `Cinematic walkthrough and spatial study of ${project.title} in ${project.location}.`,
      thumbnailUrl: project.mainPosterUrl || project.mainImage || 'https://sdesign.co.in/s-design-logo.jpg',
      uploadDate: publishedDate,
      contentUrl: project.mainVideoUrl.trim(),
    })
  }

  const projectJsonString = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': structuredDataGraph,
    },
    null,
    2
  )

  const index = allProjects.findIndex((item) => item.slug === project.slug)
  const safeIndex = index === -1 ? 0 : index
  const nextIndex = (safeIndex + 1) % allProjects.length
  const prevIndex = (safeIndex - 1 + allProjects.length) % allProjects.length
  const nextProject = allProjects[nextIndex]
  const prevProject = allProjects[prevIndex]

  const plates: ProjectGalleryPlate[] = []

  // Main hero media (if video or image)
  if (project.mainMediaType === 'video' && project.mainVideoUrl && project.mainVideoUrl.trim()) {
    plates.push({
      id: 'main-media',
      url: project.mainVideoUrl.trim(),
      type: 'video',
      posterUrl:
        project.mainPosterUrl ||
        getCloudinaryVideoThumbnail(project.mainVideoUrl, 1.5) ||
        (project.mainImage && !isVideoSource(project.mainImage) ? project.mainImage : null),
      altText: project.mainImageAlt || `${project.title} — ${project.location} architectural film and presentation video`,
    })
  } else if (project.mainImage && project.mainImage.trim()) {
    const isVid = isVideoSource(project.mainImage)
    plates.push({
      id: 'main-media',
      url: project.mainImage.trim(),
      type: isVid ? 'video' : 'image',
      posterUrl: isVid
        ? project.mainPosterUrl || getCloudinaryVideoThumbnail(project.mainImage, 1.5)
        : null,
      altText: project.mainImageAlt || `${project.title} — ${project.location} ${project.category || ''} primary architectural view`,
    })
  }

  // Project Gallery Plates
  project.galleryImages.forEach((item, idx) => {
    if (!item?.url || !item.url.trim()) return
    const trimmedUrl = item.url.trim()
    // Avoid duplicating main media if exact same URL
    if (plates.some((p) => p.url === trimmedUrl)) return

    const isVid = item.type === 'video' || isVideoSource(trimmedUrl)
    plates.push({
      id: item.id || `gallery-${idx}`,
      url: trimmedUrl,
      type: isVid ? 'video' : 'image',
      posterUrl:
        item.posterUrl ||
        (isVid ? getCloudinaryVideoThumbnail(trimmedUrl, 1.5) : null) ||
        (project.mainImage && !isVideoSource(project.mainImage) ? project.mainImage : null),
      altText: item.altText || `${project.title} — ${project.location} architectural detail plate ${idx + 1}`,
    })
  })

  const allGalleryImages = plates.map((p) => p.url)

  // (01) Project Features Dynamic Content
  const rawSecNum = (project.featuresSectionNumber || '').trim()
  const sectionNumber = rawSecNum
    ? (rawSecNum.startsWith('(') ? rawSecNum : `( ${rawSecNum} )`)
    : '( 01 )'
  const sectionHeading = (project.featuresSectionHeading || '').trim() || 'Project Features'

  const rawHeading1 = (project.featuresHeading || '').trim()
  const rawHeading2 = (project.featuresAccentHeading || '').trim()

  const headingLines: Array<{ text: string; isAccent?: boolean }> = []
  if (rawHeading1) {
    const lines = rawHeading1.split('\n').map((l) => l.trim()).filter(Boolean)
    lines.forEach((l) => headingLines.push({ text: l }))
  }
  if (rawHeading2) {
    headingLines.push({ text: rawHeading2, isAccent: true })
  }
  if (headingLines.length === 0) {
    headingLines.push(
      { text: 'Designed for' },
      { text: 'quiet living.', isAccent: true }
    )
  }

  const leadDescription =
    (project.featuresDescription || '').trim() ||
    project.fullDescription ||
    project.shortDescription

  const supportingDescription =
    project.featuresSupportingText !== undefined && project.featuresSupportingText.trim() !== ''
      ? project.featuresSupportingText.trim()
      : 'Every detail was developed through physical mockups and light studies on site, ensuring a seamless dialogue between built geometry and the surrounding landscape.'

  return (
    <main className="project-detail-page">
      {/* Exit Intent & Navigation Project Review Interceptor */}
      <ProjectNavigationFeedbackGuard project={project} />

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
        <DetailHeroMedia
          mediaType={project.mainMediaType}
          videoUrl={project.mainVideoUrl}
          posterUrl={project.mainPosterUrl || project.mainImage}
          imageUrl={project.mainImage}
          alt={project.mainImageAlt || `${project.title} — ${project.location} ${project.category || ''} architecture by ${studioName}`}
        />

        <div className="detail-hero-copy">
          <div className="detail-hero-index">
            <span>PROJECT / {project.year}</span>
            <span>
              PROJECT NO. {String(safeIndex + 1).padStart(2, '0')} OF{' '}
              {String(allProjects.length).padStart(2, '0')}
            </span>
          </div>
          <p className="eyebrow">{project.category} · {project.location}</p>
          <StaggeredHeading
            tag="h1"
            animateOnInit
            lines={[{ text: project.title }]}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: projectJsonString }}
          />
          <p className="detail-hero-meta">{project.meta}</p>
          <p className="detail-hero-desc">{project.shortDescription || project.fullDescription}</p>
          <div className="detail-hero-actions">
            <div className="detail-hero-scroll">
              Scroll to explore <span>↓</span>
            </div>
            <Link href="/#contact" className="text-link detail-hero-cta cursor-target" data-cursor-label="Contact">
              Start a conversation <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Project Note & Narrative / Project Features */}
      <section className="detail-intro section-pad">
        <div className="section-kicker">
          {sectionNumber} <span>{sectionHeading}</span>
        </div>
        <div className="detail-intro-grid">
          <div className="detail-intro-heading-col">
            <StaggeredHeading
              tag="h2"
              lines={headingLines}
            />
            {project.details && project.details.length > 0 && (
              <ScrollReveal delay={0.1} className="detail-features-highlights-wrap">
                <ul className="detail-features-highlights" aria-label="Key Highlights">
                  {project.details.map((point, pIdx) => (
                    <li key={pIdx} className="detail-highlight-item">
                      <span className="detail-highlight-bullet" aria-hidden="true" />
                      <span className="detail-highlight-text">{point}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            )}
          </div>
          <div className="detail-intro-copy-block">
            <ScrollReveal delay={0.15}>
              <p className="lead-paragraph">{leadDescription}</p>
              {supportingDescription && (
                <p className="sub-paragraph">{supportingDescription}</p>
              )}
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
        <ProjectGalleryInteractive
          title={project.title}
          plates={plates}
          images={allGalleryImages}
          fallbackImage={project.mainImage}
        />
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
              <Link href={`/work/${nextProject.slug}`} className="submit-button cursor-target" data-cursor-label="Next">
                <span>View {nextProject.title}{nextProject.category ? ` ${nextProject.category} project` : ' project'}</span>
                <ArrowRight size={17} />
              </Link>
              <Link href="/#selected-work" className="text-link cursor-target">
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
          <Link href={`/work/${prevProject.slug}`} className="pager-link cursor-target" data-cursor-label="Previous">
            <ArrowLeft size={14} /> Previous: {prevProject.title}{prevProject.category ? ` ${prevProject.category} project` : ' project'}
          </Link>
          <span className="dot">/</span>
          <Link href={`/work/${nextProject.slug}`} className="pager-link cursor-target" data-cursor-label="Next">
            Next: {nextProject.title} <ArrowRight size={14} />
          </Link>
        </div>
        <Link className="text-link cursor-target" href="/#contact" data-cursor-label="Contact">
          Start a conversation <ArrowUpRight size={16} />
        </Link>
      </footer>
    </main>
  )
}
