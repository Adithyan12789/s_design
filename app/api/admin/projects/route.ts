import { NextResponse } from 'next/server'
import { withAdminDb, slugify } from '@/lib/cms/api-helpers'
import { logAdminActivity, revalidatePublicSite } from '@/lib/cms/queries'
import type { CmsProjectGalleryItem } from '@/lib/cms/types'

function normalizeGallery(
  projectId: string,
  galleryImages: unknown
): CmsProjectGalleryItem[] {
  if (!Array.isArray(galleryImages)) return []
  return galleryImages
    .filter((img): img is Record<string, unknown> => Boolean(img && typeof img === 'object' && img.url))
    .map((img, idx) => ({
      id: typeof img.id === 'string' && !img.id.startsWith('temp-')
        ? img.id
        : `img-${Date.now()}-${idx}`,
      projectId,
      url: String(img.url),
      altText: String(img.altText || ''),
      type: (img.type === 'video' ? 'video' : 'image') as 'image' | 'video',
      posterUrl: img.posterUrl ? String(img.posterUrl) : null,
      duration: typeof img.duration === 'number' ? img.duration : null,
      displayOrder: typeof img.displayOrder === 'number' ? img.displayOrder : idx,
    }))
}

export async function GET() {
  const { db, errorResponse } = await withAdminDb()
  if (errorResponse || !db) return errorResponse!

  const docs = await db.collection('projects').find({}).sort({ displayOrder: 1 }).toArray()
  const projects = docs.map(({ _id, ...rest }) => {
    void _id
    return rest
  })

  return NextResponse.json({ projects })
}

export async function POST(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()
  const title = String(body.title || '').trim()
  if (!title) {
    return NextResponse.json({ error: 'Project title is required.' }, { status: 400 })
  }

  const slug = slugify(String(body.slug || title)) || `project-${Date.now()}`
  const existing = await db.collection('projects').findOne({ slug })
  if (existing) {
    return NextResponse.json(
      { error: `A project with slug "${slug}" already exists.` },
      { status: 409 }
    )
  }

  const count = await db.collection('projects').countDocuments()
  const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const now = new Date().toISOString()

  const doc = {
    id,
    slug,
    title,
    meta: String(body.meta || `${body.category || 'Residential'} · ${body.location || ''} · ${body.year || ''}`),
    location: String(body.location || ''),
    year: String(body.year || new Date().getFullYear()),
    type: String(body.type || body.category || 'Residential'),
    category: String(body.category || 'Residential'),
    area: String(body.area || ''),
    size: body.size === 'small' ? 'small' : 'large',
    shortDescription: String(body.shortDescription || ''),
    fullDescription: String(body.fullDescription || ''),
    mainImage: String(body.mainImage || ''),
    mainImageAlt: String(body.mainImageAlt || title),
    mainMediaType: (body.mainMediaType === 'video' ? 'video' : 'image') as 'image' | 'video',
    mainVideoUrl: String(body.mainVideoUrl || ''),
    mainPosterUrl: String(body.mainPosterUrl || ''),
    thumbnailImage: String(body.thumbnailImage || body.mainImage || ''),
    details: Array.isArray(body.details) ? body.details.map(String) : [],
    galleryImages: normalizeGallery(id, body.galleryImages),
    displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : count,
    status: body.status === 'draft' ? 'draft' : 'published',
    featured: Boolean(body.featured),
    seoTitle: String(body.seoTitle || ''),
    seoDescription: String(body.seoDescription || ''),
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('projects').insertOne(doc)
  await logAdminActivity(actor.email, 'created', 'project', title)
  revalidatePublicSite(slug)

  return NextResponse.json({ project: doc }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()

  if (Array.isArray(body.reorderIds)) {
    const now = new Date().toISOString()
    await Promise.all(
      (body.reorderIds as string[]).map((id, idx) =>
        db.collection('projects').updateOne({ id }, { $set: { displayOrder: idx, updatedAt: now } })
      )
    )
    await logAdminActivity(actor.email, 'reordered', 'project', `${body.reorderIds.length} projects`)
    revalidatePublicSite()
    return NextResponse.json({ success: true })
  }

  const id = String(body.id || '').trim()
  if (!id) {
    return NextResponse.json({ error: 'Project id is required.' }, { status: 400 })
  }

  const title = String(body.title || '').trim()
  if (!title) {
    return NextResponse.json({ error: 'Project title is required.' }, { status: 400 })
  }

  const slug = slugify(String(body.slug || title))
  const duplicate = await db.collection('projects').findOne({ slug, id: { $ne: id } })
  if (duplicate) {
    return NextResponse.json(
      { error: `Another project already uses slug "${slug}".` },
      { status: 409 }
    )
  }

  const now = new Date().toISOString()
  const updateFields = {
    slug,
    title,
    meta: String(body.meta || ''),
    location: String(body.location || ''),
    year: String(body.year || ''),
    type: String(body.type || body.category || 'Residential'),
    category: String(body.category || 'Residential'),
    area: String(body.area || ''),
    size: body.size === 'small' ? 'small' : 'large',
    shortDescription: String(body.shortDescription || ''),
    fullDescription: String(body.fullDescription || ''),
    mainImage: String(body.mainImage || ''),
    mainImageAlt: String(body.mainImageAlt || title),
    mainMediaType: (body.mainMediaType === 'video' ? 'video' : 'image') as 'image' | 'video',
    mainVideoUrl: String(body.mainVideoUrl || ''),
    mainPosterUrl: String(body.mainPosterUrl || ''),
    thumbnailImage: String(body.thumbnailImage || ''),
    details: Array.isArray(body.details) ? body.details.map(String) : [],
    galleryImages: normalizeGallery(id, body.galleryImages),
    status: body.status === 'draft' ? 'draft' : 'published',
    featured: Boolean(body.featured),
    seoTitle: String(body.seoTitle || ''),
    seoDescription: String(body.seoDescription || ''),
    updatedAt: now,
  }

  const result = await db
    .collection('projects')
    .findOneAndUpdate({ id }, { $set: updateFields }, { returnDocument: 'after' })

  if (!result) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  await logAdminActivity(actor.email, 'updated', 'project', title)
  revalidatePublicSite(slug)

  const { _id, ...project } = result
  void _id
  return NextResponse.json({ project })
}

export async function DELETE(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Project id is required.' }, { status: 400 })
  }

  const existing = await db.collection('projects').findOne({ id })
  if (!existing) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  await db.collection('projects').deleteOne({ id })
  await logAdminActivity(actor.email, 'deleted', 'project', String(existing.title || id))
  revalidatePublicSite(String(existing.slug || ''))

  return NextResponse.json({ success: true })
}
