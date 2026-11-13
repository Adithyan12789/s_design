import { NextResponse } from 'next/server'
import { withAdminDb } from '@/lib/cms/api-helpers'
import { logAdminActivity } from '@/lib/cms/queries'
import { uploadMediaBuffer, deleteMediaAsset, type UploadedMediaResult } from '@/lib/storage/cloudinary'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET() {
  const { db, errorResponse } = await withAdminDb()
  if (errorResponse || !db) return errorResponse!

  const docs = await db.collection('media').find({}).sort({ createdAt: -1 }).toArray()
  const media = docs.map(({ _id, ...rest }) => {
    void _id
    const mime = String(rest.mimeType || '').toLowerCase()
    const url = String(rest.publicUrl || '')
    const isVideo =
      rest.type === 'video' ||
      mime.startsWith('video/') ||
      Boolean(url.match(/\.(mp4|webm|mov|mkv|ogg)$/i))
    return {
      ...rest,
      type: isVideo ? 'video' : 'image',
    }
  })
  return NextResponse.json({ media })
}

export async function POST(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const altText = (formData.get('altText') as string | null) || ''
    const customPosterUrl = (formData.get('posterUrl') as string | null) || null

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No media file provided.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploaded: UploadedMediaResult = await uploadMediaBuffer({
      buffer,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      altText,
    })

    const now = new Date().toISOString()
    const asset = {
      id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: uploaded.type,
      publicId: uploaded.publicId,
      storagePath: uploaded.storagePath,
      publicUrl: uploaded.url,
      posterUrl: customPosterUrl || uploaded.posterUrl,
      fileName: uploaded.fileName,
      mimeType: uploaded.mimeType,
      fileSize: uploaded.fileSize,
      width: uploaded.width,
      height: uploaded.height,
      duration: uploaded.duration,
      altText: uploaded.altText,
      createdAt: now,
      updatedAt: now,
    }

    await db.collection('media').insertOne(asset)
    await logAdminActivity(
      actor.email,
      'uploaded',
      'media',
      `${uploaded.type.toUpperCase()}: ${uploaded.fileName}`
    )

    return NextResponse.json({ asset })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Media upload failed.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()
  const id = String(body.id || '').trim()
  if (!id) {
    return NextResponse.json({ error: 'Asset id is required.' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  }
  if (typeof body.altText === 'string') updates.altText = body.altText.trim()
  if (typeof body.fileName === 'string' && body.fileName.trim()) updates.fileName = body.fileName.trim()
  if (typeof body.posterUrl === 'string') updates.posterUrl = body.posterUrl.trim() || null

  const result = await db.collection('media').findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  )

  if (!result) {
    return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 })
  }

  await logAdminActivity(actor.email, 'updated', 'media', String(result.fileName || id))

  const { _id, ...asset } = result
  void _id
  return NextResponse.json({ asset })
}

export async function DELETE(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const force = searchParams.get('force') === 'true'
  if (!id) {
    return NextResponse.json({ error: 'Asset id is required.' }, { status: 400 })
  }

  const asset = await db.collection('media').findOne({ id })
  if (!asset) {
    return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 })
  }

  const url = String(asset.publicUrl || '')
  const usages: string[] = []

  // Check all collections where this image or video could be referenced
  const [
    projectsDocs,
    servicesDocs,
    testimonialsDocs,
    studioDoc,
    homepageDoc,
    settingsDoc,
    navDocs,
    seoDocs,
  ] = await Promise.all([
    db
      .collection('projects')
      .find({
        $or: [
          { mainImage: url },
          { mainVideoUrl: url },
          { mainPosterUrl: url },
          { thumbnailImage: url },
          { 'galleryImages.url': url },
          { 'galleryImages.posterUrl': url },
        ],
      })
      .project({ title: 1 })
      .toArray(),
    db
      .collection('services')
      .find({
        $or: [{ imageUrl: url }, { videoUrl: url }, { posterUrl: url }],
      })
      .project({ title: 1 })
      .toArray(),
    db
      .collection('testimonials')
      .find({
        $or: [
          { clientPhoto: url },
          { videoUrl: url },
          { posterImage: url },
          { backgroundImage: url },
        ],
      })
      .project({ clientName: 1 })
      .toArray(),
    db.collection('studio').findOne({
      _id: 'default' as unknown as never,
      $or: [
        { studioImage: url },
        { studioVideoUrl: url },
        { studioPosterUrl: url },
        { introVideoUrl: url },
        { introVideoPoster: url },
        { studioImages: url },
      ],
    }),
    db.collection('homepage').findOne({
      _id: 'default' as unknown as never,
      $or: [
        { heroImageUrl: url },
        { heroVideoUrl: url },
        { heroPosterUrl: url },
        { approachImageUrl: url },
        { approachVideoUrl: url },
        { approachPosterUrl: url },
      ],
    }),
    db.collection('websiteSettings').findOne({
      _id: 'default' as unknown as never,
      $or: [
        { mainLogoUrl: url },
        { altLogoUrl: url },
        { lightLogoUrl: url },
        { darkLogoUrl: url },
        { faviconUrl: url },
        { footerLogoUrl: url },
      ],
    }),
    db.collection('navigation').find({ previewImage: url }).project({ label: 1 }).toArray(),
    db.collection('seo').find({ ogImage: url }).project({ pageKey: 1 }).toArray(),
  ])

  projectsDocs.forEach((p) => usages.push(`Project: ${String(p.title)}`))
  servicesDocs.forEach((s) => usages.push(`Service: ${String(s.title)}`))
  testimonialsDocs.forEach((t) => usages.push(`Testimonial: ${String(t.clientName)}`))
  if (studioDoc) usages.push('About Studio Section')
  if (homepageDoc) usages.push('Homepage Content (Hero/Approach)')
  if (settingsDoc) usages.push('Website Branding / Logos')
  navDocs.forEach((n) => usages.push(`Navigation: ${String(n.label)}`))
  seoDocs.forEach((s) => usages.push(`SEO OG Image (${String(s.pageKey)})`))

  if (usages.length > 0 && !force) {
    return NextResponse.json(
      {
        error:
          'This media file is currently in use on the website. Remove or replace it in the referenced sections before deleting, or confirm force delete.',
        usages,
      },
      { status: 409 }
    )
  }

  // Delete from Cloudinary or local storage
  const publicId = String(asset.publicId || asset.storagePath || '')
  const type = asset.type === 'video' ? 'video' : 'image'
  await deleteMediaAsset(publicId, type)

  await db.collection('media').deleteOne({ id })
  await logAdminActivity(actor.email, 'deleted', 'media', String(asset.fileName || id))

  return NextResponse.json({ success: true })
}
