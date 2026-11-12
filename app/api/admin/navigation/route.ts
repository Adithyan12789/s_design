import { NextResponse } from 'next/server'
import { withAdminDb } from '@/lib/cms/api-helpers'
import { logAdminActivity, revalidatePublicSite } from '@/lib/cms/queries'

export async function GET() {
  const { db, errorResponse } = await withAdminDb()
  if (errorResponse || !db) return errorResponse!

  const docs = await db.collection('navigation').find({}).sort({ displayOrder: 1 }).toArray()
  const navigation = docs.map(({ _id, ...rest }) => {
    void _id
    return rest
  })
  return NextResponse.json({ navigation })
}

export async function POST(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()
  const label = String(body.label || '').trim()
  const href = String(body.href || '').trim()
  if (!label || !href) {
    return NextResponse.json({ error: 'Label and destination href are required.' }, { status: 400 })
  }

  const count = await db.collection('navigation').countDocuments()
  const now = new Date().toISOString()
  const doc = {
    id: `nav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    href,
    subtitle: String(body.subtitle || ''),
    previewImage: String(body.previewImage || ''),
    displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : count,
    visible: body.visible !== false,
    isCta: Boolean(body.isCta),
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('navigation').insertOne(doc)
  await logAdminActivity(actor.email, 'created', 'navigation', label)
  revalidatePublicSite()

  return NextResponse.json({ navItem: doc }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()

  if (Array.isArray(body.reorderIds)) {
    const now = new Date().toISOString()
    await Promise.all(
      (body.reorderIds as string[]).map((id, idx) =>
        db.collection('navigation').updateOne({ id }, { $set: { displayOrder: idx, updatedAt: now } })
      )
    )
    await logAdminActivity(
      actor.email,
      'reordered',
      'navigation',
      `${body.reorderIds.length} links`
    )
    revalidatePublicSite()
    return NextResponse.json({ success: true })
  }

  const id = String(body.id || '').trim()
  const label = String(body.label || '').trim()
  const href = String(body.href || '').trim()
  if (!id || !label || !href) {
    return NextResponse.json({ error: 'id, label, and href are required.' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const result = await db.collection('navigation').findOneAndUpdate(
    { id },
    {
      $set: {
        label,
        href,
        subtitle: String(body.subtitle || ''),
        previewImage: String(body.previewImage || ''),
        visible: Boolean(body.visible),
        isCta: Boolean(body.isCta),
        updatedAt: now,
      },
    },
    { returnDocument: 'after' }
  )

  if (!result) {
    return NextResponse.json({ error: 'Navigation item not found.' }, { status: 404 })
  }

  await logAdminActivity(actor.email, 'updated', 'navigation', label)
  revalidatePublicSite()

  const { _id, ...navItem } = result
  void _id
  return NextResponse.json({ navItem })
}

export async function DELETE(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Navigation id is required.' }, { status: 400 })
  }

  const existing = await db.collection('navigation').findOne({ id })
  await db.collection('navigation').deleteOne({ id })
  await logAdminActivity(actor.email, 'deleted', 'navigation', String(existing?.label || id))
  revalidatePublicSite()

  return NextResponse.json({ success: true })
}
