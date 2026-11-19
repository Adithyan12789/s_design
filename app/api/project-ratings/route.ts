import { NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb/client'

function sanitizeText(val: unknown, maxLength = 1000): string {
  if (typeof val !== 'string') return ''
  return val
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, maxLength)
}

export async function POST(request: Request) {
  try {
    const db = await getMongoDb()
    if (!db) {
      return NextResponse.json(
        { error: 'Database is currently unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const projectId = String(body.projectId || '').trim()
    const ratingRaw = Number(body.rating)
    const visitorId = String(body.visitorId || '').trim().slice(0, 100)
    const feedback = sanitizeText(body.feedback, 1000)

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required.' }, { status: 400 })
    }

    // Validate rating value: must be an integer between 1 and 5
    if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5.' },
        { status: 400 }
      )
    }

    // Validate project existence against existing projects in database
    const project = await db.collection('projects').findOne({
      $or: [{ id: projectId }, { slug: projectId }],
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Specified project could not be found.' },
        { status: 404 }
      )
    }

    const canonicalProjectId = String(project.id)
    const canonicalProjectSlug = String(project.slug)
    const canonicalProjectName = String(project.title)

    const now = new Date().toISOString()

    // Deduplication check: if visitorId exists, check for existing review
    if (visitorId) {
      const existingReview = await db.collection('projectReviews').findOne({
        projectId: canonicalProjectId,
        visitorId,
      })

      if (existingReview) {
        // Update the existing review instead of creating a duplicate
        await db.collection('projectReviews').updateOne(
          { _id: existingReview._id },
          {
            $set: {
              rating: ratingRaw,
              feedback,
              projectName: canonicalProjectName,
              projectSlug: canonicalProjectSlug,
              updatedAt: now,
            },
          }
        )

        return NextResponse.json({
          success: true,
          updated: true,
          message: 'Review updated successfully.',
          reviewId: existingReview.id,
        })
      }
    }

    // Insert new review
    const newReview = {
      id: `pr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      projectId: canonicalProjectId,
      projectSlug: canonicalProjectSlug,
      projectName: canonicalProjectName,
      rating: ratingRaw,
      feedback,
      visitorId: visitorId || undefined,
      createdAt: now,
      updatedAt: now,
    }

    await db.collection('projectReviews').insertOne(newReview)

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your feedback.',
        review: {
          id: newReview.id,
          projectId: canonicalProjectId,
          rating: ratingRaw,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API] Error submitting project review:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving your review.' },
      { status: 500 }
    )
  }
}
