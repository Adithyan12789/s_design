import { NextResponse } from 'next/server'
import { withAdminDb, slugify } from '@/lib/cms/api-helpers'
import { logAdminActivity, revalidatePublicSite } from '@/lib/cms/queries'

export async function GET() {
  const { db, errorResponse } = await withAdminDb()
  if (errorResponse || !db) return errorResponse!

  const docs = await db.collection('services').find({}).sort({ displayOrder: 1 }).toArray()
  const services = docs.map(({ _id, ...rest }) => {
    void _id
    return rest
  })
  return NextResponse.json({ services })
}

export async function POST(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()
  const title = String(body.title || '').trim()
  if (!title) {
    return NextResponse.json({ error: 'Service title is required.' }, { status: 400 })
  }

  const count = await db.collection('services').countDocuments()
  const now = new Date().toISOString()
  const doc = {
    id: `svc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    slug: slugify(String(body.slug || title)) || `service-${Date.now()}`,
    shortDescription: String(body.shortDescription || ''),
    fullDescription: String(body.fullDescription || ''),
    imageUrl: String(body.imageUrl || ''),
    iconName: String(body.iconName || ''),
    displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : count,
    status: body.status === 'draft' ? 'draft' : 'published',
    seoTitle: String(body.seoTitle || ''),
    seoDescription: String(body.seoDescription || ''),
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('services').insertOne(doc)
  await logAdminActivity(actor.email, 'created', 'service', title)
  revalidatePublicSite()

  return NextResponse.json({ service: doc }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()

  if (Array.isArray(body.reorderIds)) {
    const now = new Date().toISOString()
    await Promise.all(
      (body.reorderIds as string[]).map((id, idx) =>
        db.collection('services').updateOne({ id }, { $set: { displayOrder: idx, updatedAt: now } })
      )
    )
    await logAdminActivity(actor.email, 'reordered', 'service', `${body.reorderIds.length} services`)
    revalidatePublicSite()
    return NextResponse.json({ success: true })
  }

  const id = String(body.id || '').trim()
  const title = String(body.title || '').trim()
  if (!id || !title) {
    return NextResponse.json({ error: 'Service id and title are required.' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const result = await db.collection('services').findOneAndUpdate(
    { id },
    {
      $set: {
        title,
        slug: slugify(String(body.slug || title)),
        shortDescription: String(body.shortDescription || ''),
        fullDescription: String(body.fullDescription || ''),
        imageUrl: String(body.imageUrl || ''),
        iconName: String(body.iconName || ''),
        status: body.status === 'draft' ? 'draft' : 'published',
        seoTitle: String(body.seoTitle || ''),
        seoDescription: String(body.seoDescription || ''),
        updatedAt: now,
      },
    },
    { returnDocument: 'after' }
  )

  if (!result) {
    return NextResponse.json({ error: 'Service not found.' }, { status: 404 })
  }

  await logAdminActivity(actor.email, 'updated', 'service', title)
  revalidatePublicSite()

  const { _id, ...service } = result
  void _id
  return NextResponse.json({ service })
}

export async function DELETE(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Service id is required.' }, { status: 400 })
  }

  const existing = await db.collection('services').findOne({ id })
  await db.collection('services').deleteOne({ id })
  await logAdminActivity(actor.email, 'deleted', 'service', String(existing?.title || id))
  revalidatePublicSite()

  return NextResponse.json({ success: true })
}
