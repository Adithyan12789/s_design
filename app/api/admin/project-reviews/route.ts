import { NextResponse } from 'next/server'
import { withAdminDb } from '@/lib/cms/api-helpers'
import { logAdminActivity } from '@/lib/cms/queries'

export async function DELETE(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Review ID is required.' }, { status: 400 })
  }

  const existing = await db.collection('projectReviews').findOne({ id })
  if (!existing) {
    return NextResponse.json({ error: 'Review not found.' }, { status: 404 })
  }

  await db.collection('projectReviews').deleteOne({ id })
  await logAdminActivity(
    actor.email,
    'deleted',
    'project review',
    `Review for ${existing.projectName || existing.projectId}`
  )

  return NextResponse.json({ success: true, message: 'Review deleted successfully.' })
}
