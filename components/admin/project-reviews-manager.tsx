'use client'

import React, { useState, useEffect, useMemo, useTransition } from 'react'
import Image from 'next/image'
import {
  Star,
  BarChart3,
  TrendingUp,
  Award,
  MessageSquare,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Trash2,
  X,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react'
import type { CmsProjectReview, ProjectAnalyticsSummary } from '@/lib/cms/types'

interface ProjectReviewsManagerProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void
}

type SortOption = 'highest-rating' | 'most-reviews' | 'lowest-rating' | 'alphabetical'
type FilterOption = 'all' | 'rated-only' | 'unrated-only'

export function ProjectReviewsManager({ onNotify }: ProjectReviewsManagerProps) {
  const [data, setData] = useState<ProjectAnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('highest-rating')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<
    ProjectAnalyticsSummary['projects'][0] | null
  >(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function fetchAnalytics(showToast = false) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/project-analytics', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load project reviews data.')
      const json: ProjectAnalyticsSummary = await res.json()
      setData(json)

      // If a project modal is open, refresh its data
      if (selectedProject) {
        const updatedSelected = json.projects.find((p) => p.id === selectedProject.id)
        if (updatedSelected) {
          setSelectedProject(updatedSelected)
        }
      }

      if (showToast) {
        onNotify('Project analytics refreshed.', 'success')
      }
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Error fetching analytics', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function handleDeleteReview(reviewId: string) {
    if (!confirm('Are you sure you want to permanently delete this review?')) return
    setDeletingId(reviewId)
    try {
      const res = await fetch(`/api/admin/project-reviews?id=${encodeURIComponent(reviewId)}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to delete review.')

      onNotify('Review deleted successfully.', 'success')
      await fetchAnalytics()
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Error deleting review', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  // Filter & Sort Projects
  const filteredProjects = useMemo(() => {
    if (!data) return []

    let list = [...data.projects]

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      )
    }

    // Filter by rated/unrated
    if (filterBy === 'rated-only') {
      list = list.filter((p) => p.reviewsCount > 0)
    } else if (filterBy === 'unrated-only') {
      list = list.filter((p) => p.reviewsCount === 0)
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'highest-rating') {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating
        }
        return b.reviewsCount - a.reviewsCount
      }
      if (sortBy === 'most-reviews') {
        if (b.reviewsCount !== a.reviewsCount) {
          return b.reviewsCount - a.reviewsCount
        }
        return b.averageRating - a.averageRating
      }
      if (sortBy === 'lowest-rating') {
        if (a.reviewsCount === 0 && b.reviewsCount > 0) return 1
        if (b.reviewsCount === 0 && a.reviewsCount > 0) return -1
        return a.averageRating - b.averageRating
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

    return list
  }, [data, searchQuery, filterBy, sortBy])

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-[#7c7367]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#b68d54] mb-3" />
        <p className="text-sm font-mono uppercase tracking-wider">Loading project analytics...</p>
      </div>
    )
  }

  const {
    totalReviews = 0,
    overallAverageRating = 0,
    totalRatedProjects = 0,
    totalProjects = 0,
    highestRatedProject = null,
    mostRatedProject = null,
  } = data || {}

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17]">Project Feedback &amp; Analytics</h2>
          <p className="text-xs text-[#7c7367] mt-1">
            Real visitor impressions, 5-star ratings, and design feedback collected upon leaving Work Details pages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchAnalytics(true)}
          disabled={loading}
          className="admin-btn-secondary self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* OVERALL STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="admin-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[#7c7367]">
            <span className="text-xs font-mono uppercase tracking-wider">Total Reviews</span>
            <MessageSquare className="w-4 h-4 text-[#b68d54]" />
          </div>
          <div className="admin-serif text-3xl sm:text-4xl text-[#1c1a17]">
            {totalReviews}
          </div>
          <p className="text-[11px] text-[#7c7367]">
            Across {totalRatedProjects} of {totalProjects} studio projects
          </p>
        </div>

        {/* Overall Average Rating */}
        <div className="admin-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[#7c7367]">
            <span className="text-xs font-mono uppercase tracking-wider">Average Rating</span>
            <Star className="w-4 h-4 text-[#b68d54] fill-[#b68d54]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="admin-serif text-3xl sm:text-4xl text-[#1c1a17]">
              {overallAverageRating > 0 ? overallAverageRating.toFixed(1) : '—'}
            </span>
            <span className="text-xs text-[#7c7367] font-mono">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(overallAverageRating)
                    ? 'fill-[#b68d54] text-[#b68d54]'
                    : 'text-[#d6cec1]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Highest-Rated Project */}
        <div className="admin-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[#7c7367]">
            <span className="text-xs font-mono uppercase tracking-wider">Highest Rated</span>
            <Award className="w-4 h-4 text-[#b68d54]" />
          </div>
          {highestRatedProject ? (
            <div>
              <p className="font-medium text-[#1c1a17] text-sm truncate" title={highestRatedProject.title}>
                {highestRatedProject.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-mono text-xs font-semibold text-[#b68d54]">
                  ★ {highestRatedProject.averageRating.toFixed(1)}
                </span>
                <span className="text-[11px] text-[#7c7367]">
                  ({highestRatedProject.reviewsCount} {highestRatedProject.reviewsCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#a8a195] italic mt-2">No rated projects yet</p>
          )}
        </div>

        {/* Most Rated Project */}
        <div className="admin-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[#7c7367]">
            <span className="text-xs font-mono uppercase tracking-wider">Most Reviewed</span>
            <TrendingUp className="w-4 h-4 text-[#b68d54]" />
          </div>
          {mostRatedProject ? (
            <div>
              <p className="font-medium text-[#1c1a17] text-sm truncate" title={mostRatedProject.title}>
                {mostRatedProject.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-mono text-xs font-semibold text-[#1c1a17]">
                  {mostRatedProject.reviewsCount} {mostRatedProject.reviewsCount === 1 ? 'review' : 'reviews'}
                </span>
                <span className="text-[11px] text-[#7c7367]">
                  (★ {mostRatedProject.averageRating.toFixed(1)})
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#a8a195] italic mt-2">No rated projects yet</p>
          )}
        </div>
      </div>

      {/* VISUALIZATIONS SECTION */}
      {totalReviews > 0 && (
        <div className="admin-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#b68d54]" />
                Project Ratings &amp; Volume Comparison
              </h3>
              <p className="text-xs text-[#7c7367] mt-0.5">
                Comparing average rating scores and review volume across studio projects.
              </p>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-3 pt-2">
            {data?.projects
              .filter((p) => p.reviewsCount > 0)
              .sort((a, b) => b.averageRating - a.averageRating)
              .map((project) => {
                const percentage = (project.averageRating / 5) * 100
                return (
                  <div key={project.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#1c1a17] truncate max-w-[240px] sm:max-w-md">
                        {project.title}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-[#b68d54] font-semibold">
                          ★ {project.averageRating.toFixed(1)} / 5.0
                        </span>
                        <span className="text-[#7c7367]">
                          ({project.reviewsCount} {project.reviewsCount === 1 ? 'rating' : 'ratings'})
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="h-2.5 w-full bg-[#f0eae1] rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-[#b68d54] to-[#d9b686] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* CONTROLS (SEARCH, FILTER, SORT) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9e9689]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-input !pl-9"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-[#dfd7c9] rounded-lg px-2.5 py-1.5 text-xs text-[#6b6358]">
            <Filter className="w-3.5 h-3.5 text-[#b68d54]" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="bg-transparent focus:outline-none text-[#1c1a17] cursor-pointer"
            >
              <option value="all">All Projects ({data?.projects.length || 0})</option>
              <option value="rated-only">Rated Projects ({totalRatedProjects})</option>
              <option value="unrated-only">
                Unrated Projects ({(data?.projects.length || 0) - totalRatedProjects})
              </option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 bg-white border border-[#dfd7c9] rounded-lg px-2.5 py-1.5 text-xs text-[#6b6358]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#b68d54]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent focus:outline-none text-[#1c1a17] cursor-pointer"
            >
              <option value="highest-rating">Highest Rating</option>
              <option value="most-reviews">Most Reviews</option>
              <option value="lowest-rating">Lowest Rating</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* PROJECTS LIST / TABLE */}
      <div className="space-y-3">
        {filteredProjects.length === 0 ? (
          <div className="admin-card p-12 text-center text-[#7c7367]">
            <Info className="w-8 h-8 mx-auto text-[#b68d54] mb-2" />
            <p className="text-sm font-medium">No projects match the selected criteria.</p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const hasReviews = project.reviewsCount > 0

            return (
              <div
                key={project.id}
                className="admin-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:border-[#b68d54]/40"
              >
                {/* Project Info */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {project.thumbnail ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#23211e] border border-[#dfd7c9]">
                      <Image
                        src={project.thumbnail}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#f0eae1] flex items-center justify-center font-serif text-[#b68d54] text-xl shrink-0">
                      S
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#b68d54] uppercase tracking-wider">
                        {project.category}
                      </span>
                      {project.year && (
                        <span className="text-[11px] text-[#9e9689] font-mono">
                          &middot; {project.year}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-base text-[#1c1a17] truncate">
                      {project.title}
                    </h3>

                    {/* Rating Stats Summary */}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {hasReviews ? (
                        <>
                          <div className="flex items-center gap-1 font-mono text-xs font-semibold text-[#1c1a17]">
                            <Star className="w-3.5 h-3.5 fill-[#b68d54] text-[#b68d54]" />
                            {project.averageRating.toFixed(1)} / 5.0
                          </div>
                          <span className="text-xs text-[#7c7367]">
                            &middot; {project.reviewsCount} {project.reviewsCount === 1 ? 'review' : 'reviews'}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-[#a8a195] italic">
                          No reviews submitted yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating Distribution Mini Histogram */}
                {hasReviews && (
                  <div className="hidden lg:flex items-center gap-1.5 w-44 shrink-0 bg-[#faf7f2] p-2 rounded-lg border border-[#e8e2d8]">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = project.distribution[star as 1 | 2 | 3 | 4 | 5] || 0
                      const barPercent = project.reviewsCount > 0 ? (count / project.reviewsCount) * 100 : 0
                      return (
                        <div key={star} className="flex-1 flex flex-col items-center gap-1" title={`${star} Stars: ${count}`}>
                          <div className="w-full h-8 bg-[#e8e2d8] rounded-sm flex items-end overflow-hidden">
                            <div
                              className="w-full bg-[#b68d54] rounded-sm transition-all"
                              style={{ height: `${barPercent}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-[#7c7367]">{star}★</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <a
                    href={`/work/${project.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg border border-[#dfd7c9] text-[#7c7367] hover:text-[#1c1a17] hover:bg-[#faf7f2] transition-colors"
                    title="View Work Details Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="admin-btn-secondary flex items-center gap-1.5"
                  >
                    <span>{hasReviews ? `View ${project.reviewsCount} Reviews` : 'Inspect'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* INDIVIDUAL PROJECT REVIEWS MODAL / DRAWER */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white border border-[#dfd7c9] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#dfd7c9] flex items-center justify-between gap-4 bg-[#faf7f2]">
              <div className="flex items-center gap-3 min-w-0">
                {selectedProject.thumbnail && (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#dfd7c9]">
                    <Image
                      src={selectedProject.thumbnail}
                      alt={selectedProject.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-mono text-[#b68d54] uppercase tracking-wider">
                    PROJECT FEEDBACK &middot; {selectedProject.category}
                  </p>
                  <h3 className="admin-serif text-xl sm:text-2xl text-[#1c1a17] truncate">
                    {selectedProject.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#7c7367] mt-0.5">
                    <span className="font-semibold text-[#b68d54] font-mono">
                      ★ {selectedProject.averageRating.toFixed(1)} / 5.0
                    </span>
                    <span>&middot;</span>
                    <span>{selectedProject.reviewsCount} total ratings</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-full text-[#7c7367] hover:text-[#1c1a17] hover:bg-black/5 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Review List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedProject.reviews.length === 0 ? (
                <div className="py-12 text-center text-[#7c7367]">
                  <p className="text-sm">No visitor ratings submitted for this project yet.</p>
                  <p className="text-xs text-[#9e9689] mt-1">
                    When visitors view this project and leave the page, their reviews will appear here.
                  </p>
                </div>
              ) : (
                selectedProject.reviews.map((review) => {
                  const dateFormatted = new Date(review.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <div
                      key={review.id}
                      className="p-4 rounded-xl border border-[#dfd7c9] bg-white space-y-2.5 transition-colors hover:border-[#b68d54]/50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= review.rating
                                    ? 'fill-[#b68d54] text-[#b68d54]'
                                    : 'text-[#dfd7c9]'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-mono font-semibold text-[#1c1a17]">
                            {review.rating}/5
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-[#9e9689]">
                            {dateFormatted}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={deletingId === review.id}
                            className="p-1 rounded text-[#9e9689] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {review.feedback ? (
                        <blockquote className="text-sm text-[#3d372e] bg-[#faf7f2] p-3 rounded-lg border-l-2 border-[#b68d54] italic">
                          &ldquo;{review.feedback}&rdquo;
                        </blockquote>
                      ) : (
                        <p className="text-xs text-[#a8a195] italic">No written comment provided.</p>
                      )}

                      {review.visitorId && (
                        <p className="text-[10px] font-mono text-[#b3aaa0]">
                          Visitor Ref: {review.visitorId.slice(0, 16)}...
                        </p>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#dfd7c9] bg-[#faf7f2] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="admin-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
