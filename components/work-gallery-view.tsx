'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Grid,
  List,
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Calendar,
  Layers,
  Maximize2,
  Eye,
} from 'lucide-react'
import { TiltProjectCard } from '@/components/tilt-project-card'
import type { Project } from '@/lib/projects'

type WorkGalleryViewProps = {
  projects: Project[]
  initialCategory?: string
  showSearch?: boolean
}

const CATEGORIES = ['All', 'Residential', 'Hospitality', 'Renovation', 'Cultural'] as const

export function WorkGalleryView({ projects, initialCategory = 'All', showSearch = true }: WorkGalleryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'editorial'>('grid')
  const [activePreview, setActivePreview] = useState<Project | null>(null)
  const [previewImageIndex, setPreviewImageIndex] = useState(0)

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        selectedCategory === 'All' || project.category === selectedCategory
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query) ||
        project.meta.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.details.some((d) => d.toLowerCase().includes(query))

      return matchesCategory && matchesSearch
    })
  }, [projects, selectedCategory, searchQuery])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: projects.length }
    for (const p of projects) {
      counts[p.category] = (counts[p.category] || 0) + 1
    }
    return counts
  }, [projects])

  return (
    <div className="work-gallery-container">
      {/* Control Bar: Filters, Search & View Mode Switcher */}
      <div className="work-control-bar">
        {/* Category Pills */}
        <div className="work-filter-pills" role="tablist" aria-label="Filter works by category">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(cat)}
                className={`work-filter-pill ${isActive ? 'is-active' : ''}`}
                suppressHydrationWarning
              >
                <span>{cat}</span>
                <span className="pill-count">{count}</span>
              </button>
            )
          })}
        </div>

        {/* Right Tools: Live Search & View Mode */}
        <div className="work-tools">
          {showSearch && (
            <div className="work-search-wrapper">
              <Search className="search-icon" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, locations..."
                className="work-search-input"
                aria-label="Search projects"
                suppressHydrationWarning
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  suppressHydrationWarning
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          <div className="view-mode-toggle" role="group" aria-label="View layout switch">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid layout"
              title="Grid View"
              suppressHydrationWarning
            >
              <Grid size={16} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'editorial' ? 'is-active' : ''}`}
              onClick={() => setViewMode('editorial')}
              aria-label="Editorial list layout"
              title="Editorial List View"
              suppressHydrationWarning
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Header Status */}
      <div className="work-status-bar">
        <span className="status-kicker">
          ( ARCHIVE / 0{filteredProjects.length} )
        </span>
        <span className="status-note">
          Showing {filteredProjects.length} of {projects.length} architectural commissions
        </span>
      </div>

      {/* Projects Display: Grid View */}
      {viewMode === 'grid' && (
        <div className="project-grid">
          {filteredProjects.map((project, index) => (
            <div key={project.slug} className="project-grid-item">
              <TiltProjectCard {...project} index={index} />
              <button
                className="quick-view-trigger"
                onClick={() => {
                  setActivePreview(project)
                  setPreviewImageIndex(0)
                }}
                aria-label={`Quick view ${project.title}`}
                title="Quick View"
                suppressHydrationWarning
              >
                <Eye size={14} />
                <span>Quick View</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Projects Display: Editorial List View */}
      {viewMode === 'editorial' && (
        <div className="work-editorial-list">
          {filteredProjects.map((project, index) => (
            <article key={project.slug} className="editorial-row group">
              <div className="editorial-row-meta">
                <span className="editorial-index">0{index + 1}</span>
                <span className="editorial-year">{project.year}</span>
              </div>

              <div className="editorial-main">
                <Link href={`/work/${project.slug}`} className="editorial-title-link">
                  <h2>{project.title}</h2>
                </Link>
                <p className="editorial-desc">{project.description}</p>
                <div className="editorial-tags">
                  <span>{project.category}</span>
                  <span className="dot">·</span>
                  <span>{project.location}</span>
                  <span className="dot">·</span>
                  <span>{project.area}</span>
                </div>
              </div>

              <div className="editorial-image-preview">
                <div
                  className="editorial-thumb"
                  style={{ backgroundImage: `url(${project.image})` }}
                />
              </div>

              <div className="editorial-actions">
                <button
                  className="editorial-preview-btn"
                  onClick={() => {
                    setActivePreview(project)
                    setPreviewImageIndex(0)
                  }}
                  title="Quick View"
                  suppressHydrationWarning
                >
                  <Eye size={16} />
                </button>
                <Link
                  href={`/work/${project.slug}`}
                  className="editorial-arrow-link"
                  aria-label={`Open ${project.title}`}
                >
                  <ArrowUpRight size={22} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="work-empty-state">
          <h3>No architectural commissions found</h3>
          <p>Try refining your search term or selecting another category.</p>
          <button
            className="text-link"
            onClick={() => {
              setSelectedCategory('All')
              setSearchQuery('')
            }}
            suppressHydrationWarning
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Interactive Quick-View Modal / Lightbox */}
      {activePreview && (
        <div
          className="quick-view-overlay"
          onClick={() => setActivePreview(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="quick-view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="quick-view-close"
              onClick={() => setActivePreview(null)}
              aria-label="Close preview"
              suppressHydrationWarning
            >
              <X size={20} />
            </button>

            <div className="quick-view-grid">
              {/* Media gallery side */}
              <div className="quick-view-media">
                <div
                  className="quick-view-hero-image"
                  style={{
                    backgroundImage: `url(${
                      previewImageIndex === 0
                        ? activePreview.image
                        : activePreview.gallery[previewImageIndex - 1] || activePreview.image
                    })`,
                  }}
                />
                {activePreview.gallery.length > 0 && (
                  <div className="quick-view-thumbs">
                    <button
                      className={`thumb-btn ${previewImageIndex === 0 ? 'is-active' : ''}`}
                      onClick={() => setPreviewImageIndex(0)}
                      suppressHydrationWarning
                    >
                      <div style={{ backgroundImage: `url(${activePreview.image})` }} />
                    </button>
                    {activePreview.gallery.map((img, idx) => (
                      <button
                        key={img}
                        className={`thumb-btn ${previewImageIndex === idx + 1 ? 'is-active' : ''}`}
                        onClick={() => setPreviewImageIndex(idx + 1)}
                        suppressHydrationWarning
                      >
                        <div style={{ backgroundImage: `url(${img})` }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Information side */}
              <div className="quick-view-info">
                <div className="quick-view-kicker">
                  {activePreview.category} · {activePreview.year}
                </div>
                <h2>{activePreview.title}</h2>
                <p className="quick-view-desc">{activePreview.description}</p>

                <div className="quick-view-specs-grid">
                  <div>
                    <MapPin size={14} />
                    <span>Location</span>
                    <strong>{activePreview.location}</strong>
                  </div>
                  <div>
                    <Calendar size={14} />
                    <span>Year</span>
                    <strong>{activePreview.year}</strong>
                  </div>
                  <div>
                    <Maximize2 size={14} />
                    <span>Scale</span>
                    <strong>{activePreview.area}</strong>
                  </div>
                  <div>
                    <Layers size={14} />
                    <span>Typology</span>
                    <strong>{activePreview.type}</strong>
                  </div>
                </div>

                <div className="quick-view-details-list">
                  <h4>Key Architectural Details</h4>
                  <ul>
                    {activePreview.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>

                <div className="quick-view-actions">
                  <Link
                    href={`/work/${activePreview.slug}`}
                    className="submit-button"
                    onClick={() => setActivePreview(null)}
                  >
                    <span>Explore Full Case Study</span>
                    <ArrowUpRight size={17} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

