import { NextResponse } from 'next/server'
import { withAdminDb } from '@/lib/cms/api-helpers'
import { logAdminActivity } from '@/lib/cms/queries'
import { deleteMulterUploadedFile, parseMulterImageUpload } from '@/lib/storage/multer'

export async function GET() {
  const { db, errorResponse } = await withAdminDb()
  if (errorResponse || !db) return errorResponse!

  const docs = await db.collection('media').find({}).sort({ createdAt: -1 }).toArray()
  const media = docs.map(({ _id, ...rest }) => {
    void _id
    return rest
  })
  return NextResponse.json({ media })
}

export async function POST(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  try {
    const uploaded = await parseMulterImageUpload(request)
    const now = new Date().toISOString()

    const asset = {
      id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      publicId: uploaded.storagePath,
      storagePath: uploaded.storagePath,
      publicUrl: uploaded.publicUrl,
      fileName: uploaded.originalname,
      mimeType: uploaded.mimetype,
      fileSize: uploaded.size,
      width: null,
      height: null,
      altText: uploaded.altText,
      createdAt: now,
      updatedAt: now,
    }

    await db.collection('media').insertOne(asset)
    await logAdminActivity(actor.email, 'uploaded', 'media', uploaded.originalname)

    return NextResponse.json({ asset })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Image upload failed.'
    const status = message.includes('File too large') || message.includes('Unsupported file type') || message.includes('No image file')
      ? 400
      : 500
    return NextResponse.json({ error: message }, { status })
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

  const result = await db.collection('media').findOneAndUpdate(
    { id },
    { $set: { altText: String(body.altText ?? ''), updatedAt: new Date().toISOString() } },
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

  const [projectsDocs, servicesDocs, testimonialsDocs, navDocs, settingsDoc, homepageDoc, seoDocs] =
    await Promise.all([
      db
        .collection('projects')
        .find({
          $or: [{ mainImage: url }, { thumbnailImage: url }, { 'galleryImages.url': url }],
        })
        .project({ title: 1 })
        .toArray(),
      db.collection('services').find({ imageUrl: url }).project({ title: 1 }).toArray(),
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
      db.collection('navigation').find({ previewImage: url }).project({ label: 1 }).toArray(),
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
      db.collection('homepage').findOne({
        _id: 'default' as unknown as never,
        $or: [{ heroImageUrl: url }, { approachImageUrl: url }],
      }),
      db.collection('seo').find({ ogImage: url }).project({ pageKey: 1 }).toArray(),
    ])

  projectsDocs.forEach((p) => usages.push(`Project: ${String(p.title)}`))
  servicesDocs.forEach((s) => usages.push(`Service: ${String(s.title)}`))
  testimonialsDocs.forEach((t) => usages.push(`Testimonial: ${String(t.clientName)}`))
  navDocs.forEach((n) => usages.push(`Navigation: ${String(n.label)}`))
  if (settingsDoc) usages.push('Website Branding / Logos')
  if (homepageDoc) usages.push('Homepage Content')
  seoDocs.forEach((s) => usages.push(`SEO OG Image (${String(s.pageKey)})`))

  if (usages.length > 0 && !force) {
    return NextResponse.json(
      {
        error:
          'This image is currently used on the website. Remove it from those sections or confirm force delete.',
        usages,
      },
      { status: 409 }
    )
  }

  if (asset.storagePath || asset.publicId) {
    await deleteMulterUploadedFile(String(asset.storagePath || asset.publicId))
  }

  await db.collection('media').deleteOne({ id })
  await logAdminActivity(actor.email, 'deleted', 'media', String(asset.fileName || id))

  return NextResponse.json({ success: true })
}
