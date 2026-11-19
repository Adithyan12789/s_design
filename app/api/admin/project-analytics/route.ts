import { NextResponse } from 'next/server'
import { withAdminDb } from '@/lib/cms/api-helpers'
import type { CmsProjectReview, ProjectAnalyticsSummary } from '@/lib/cms/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  try {
    const [projectDocs, reviewDocs] = await Promise.all([
      db.collection('projects').find({}).sort({ displayOrder: 1 }).toArray(),
      db.collection('projectReviews').find({}).sort({ createdAt: -1 }).toArray(),
    ])

    const reviewsByProject = new Map<string, CmsProjectReview[]>()

    let totalReviews = reviewDocs.length
    let totalScoreSum = 0

    for (const doc of reviewDocs) {
      const { _id, ...review } = doc
      void _id
      const pId = String(review.projectId)
      const typedReview = review as unknown as CmsProjectReview
      totalScoreSum += Number(typedReview.rating) || 0

      const list = reviewsByProject.get(pId) || []
      list.push(typedReview)
      reviewsByProject.set(pId, list)
    }

    const overallAverageRating =
      totalReviews > 0 ? Number((totalScoreSum / totalReviews).toFixed(1)) : 0

    let totalRatedProjects = 0
    let highestRatedProject: ProjectAnalyticsSummary['highestRatedProject'] = null
    let mostRatedProject: ProjectAnalyticsSummary['mostRatedProject'] = null

    const projectsAnalytics = projectDocs.map((p) => {
      const pId = String(p.id)
      const reviews = reviewsByProject.get(pId) || []
      const reviewsCount = reviews.length

      const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      }

      let pScoreSum = 0
      for (const r of reviews) {
        const rating = (Number(r.rating) || 0) as 1 | 2 | 3 | 4 | 5
        if (distribution[rating] !== undefined) {
          distribution[rating] += 1
        }
        pScoreSum += rating
      }

      const averageRating =
        reviewsCount > 0 ? Number((pScoreSum / reviewsCount).toFixed(1)) : 0

      if (reviewsCount > 0) {
        totalRatedProjects += 1

        // Track highest rated
        if (
          !highestRatedProject ||
          averageRating > highestRatedProject.averageRating ||
          (averageRating === highestRatedProject.averageRating &&
            reviewsCount > highestRatedProject.reviewsCount)
        ) {
          highestRatedProject = {
            id: pId,
            title: String(p.title),
            slug: String(p.slug),
            thumbnail: String(p.mainImage || ''),
            averageRating,
            reviewsCount,
          }
        }

        // Track most rated
        if (
          !mostRatedProject ||
          reviewsCount > mostRatedProject.reviewsCount
        ) {
          mostRatedProject = {
            id: pId,
            title: String(p.title),
            slug: String(p.slug),
            thumbnail: String(p.mainImage || ''),
            averageRating,
            reviewsCount,
          }
        }
      }

      return {
        id: pId,
        title: String(p.title),
        slug: String(p.slug),
        thumbnail: String(p.mainImage || ''),
        category: String(p.category || 'Architecture'),
        year: String(p.year || ''),
        averageRating,
        reviewsCount,
        distribution,
        reviews,
      }
    })

    const responseData: ProjectAnalyticsSummary = {
      totalReviews,
      overallAverageRating,
      totalRatedProjects,
      totalProjects: projectDocs.length,
      highestRatedProject,
      mostRatedProject,
      projects: projectsAnalytics,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('[API] Error computing project analytics:', error)
    return NextResponse.json(
      { error: 'Failed to load project analytics.' },
      { status: 500 }
    )
  }
}
