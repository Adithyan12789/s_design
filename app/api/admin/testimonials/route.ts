import { NextResponse } from 'next/server'
import { withAdminDb } from '@/lib/cms/api-helpers'
import { logAdminActivity, revalidatePublicSite } from '@/lib/cms/queries'

export async function GET() {
  const { db, errorResponse } = await withAdminDb()
  if (errorResponse || !db) return errorResponse!

  const docs = await db.collection('testimonials').find({}).sort({ displayOrder: 1 }).toArray()
  const testimonials = docs.map(({ _id, ...rest }) => {
    void _id
    return rest
  })
  return NextResponse.json({ testimonials })
}

export async function POST(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()
  const clientName = String(body.clientName || '').trim()
  const quote = String(body.quote || '').trim()
  if (!clientName || !quote) {
    return NextResponse.json(
      { error: 'Client name and review quote are required.' },
      { status: 400 }
    )
  }

  const count = await db.collection('testimonials').countDocuments()
  const now = new Date().toISOString()
  const rating = Math.min(5, Math.max(1, Number(body.rating ?? 5) || 5))

  const doc = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    clientName,
    designation: String(body.designation || ''),
    quote,
    clientPhoto: String(body.clientPhoto || ''),
    rating,
    projectId: body.projectId ? String(body.projectId) : null,
    displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : count,
    status: body.status === 'draft' ? 'draft' : 'published',
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('testimonials').insertOne(doc)
  await logAdminActivity(actor.email, 'created', 'testimonial', clientName)
  revalidatePublicSite()

  return NextResponse.json({ testimonial: doc }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()

  if (Array.isArray(body.reorderIds)) {
    const now = new Date().toISOString()
    await Promise.all(
      (body.reorderIds as string[]).map((id, idx) =>
        db.collection('testimonials').updateOne({ id }, { $set: { displayOrder: idx, updatedAt: now } })
      )
    )
    await logAdminActivity(
      actor.email,
      'reordered',
      'testimonial',
      `${body.reorderIds.length} reviews`
    )
    revalidatePublicSite()
    return NextResponse.json({ success: true })
  }

  const id = String(body.id || '').trim()
  const clientName = String(body.clientName || '').trim()
  const quote = String(body.quote || '').trim()
  if (!id || !clientName || !quote) {
    return NextResponse.json(
      { error: 'Testimonial id, client name, and quote are required.' },
      { status: 400 }
    )
  }

  const rating = Math.min(5, Math.max(1, Number(body.rating ?? 5) || 5))
  const now = new Date().toISOString()

  const result = await db.collection('testimonials').findOneAndUpdate(
    { id },
    {
      $set: {
        clientName,
        designation: String(body.designation || ''),
        quote,
        clientPhoto: String(body.clientPhoto || ''),
        rating,
        projectId: body.projectId ? String(body.projectId) : null,
        status: body.status === 'draft' ? 'draft' : 'published',
        updatedAt: now,
      },
    },
    { returnDocument: 'after' }
  )

  if (!result) {
    return NextResponse.json({ error: 'Testimonial not found.' }, { status: 404 })
  }

  await logAdminActivity(actor.email, 'updated', 'testimonial', clientName)
  revalidatePublicSite()

  const { _id, ...testimonial } = result
  void _id
  return NextResponse.json({ testimonial })
}

export async function DELETE(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Testimonial id is required.' }, { status: 400 })
  }

  const existing = await db.collection('testimonials').findOne({ id })
  await db.collection('testimonials').deleteOne({ id })
  await logAdminActivity(actor.email, 'deleted', 'testimonial', String(existing?.clientName || id))
  revalidatePublicSite()

  return NextResponse.json({ success: true })
}
