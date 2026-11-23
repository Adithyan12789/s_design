import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { withAdminDb } from '@/lib/cms/api-helpers'
import { logAdminActivity } from '@/lib/cms/queries'

export async function GET(request: Request) {
  const { db, errorResponse } = await withAdminDb()
  if (errorResponse || !db) return errorResponse!

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const query = searchParams.get('q')

  const filter: Record<string, unknown> = {}
  if (status && status !== 'all') {
    filter.status = status
  }
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } },
      { location: { $regex: query, $options: 'i' } },
      { projectType: { $regex: query, $options: 'i' } },
      { message: { $regex: query, $options: 'i' } },
    ]
  }

  const docs = await db.collection('inquiries').find(filter).sort({ createdAt: -1 }).toArray()

  const inquiries = docs.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    email: d.email,
    phone: d.phone,
    location: d.location,
    projectType: d.projectType,
    budget: d.budget,
    message: d.message,
    status: d.status || 'new',
    notes: d.notes,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    ip: d.ip,
    userAgent: d.userAgent,
  }))

  return NextResponse.json({ inquiries })
}

export async function PATCH(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const body = await request.json()
  const { id, status, notes } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing inquiry ID' }, { status: 400 })
  }

  const updateFields: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  }
  if (status) updateFields.status = status
  if (typeof notes === 'string') updateFields.notes = notes

  let filter: Record<string, unknown> = {}
  try {
    filter = { _id: new ObjectId(id) }
  } catch {
    filter = { _id: id }
  }

  const result = await db.collection('inquiries').updateOne(filter, { $set: updateFields })

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  await logAdminActivity(actor.email, 'updated', 'inquiry', `Updated inquiry status to ${status || 'edited'}`)

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const { actor, db, errorResponse } = await withAdminDb()
  if (errorResponse || !db || !actor) return errorResponse!

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing inquiry ID' }, { status: 400 })
  }

  let filter: Record<string, unknown> = {}
  try {
    filter = { _id: new ObjectId(id) }
  } catch {
    filter = { _id: id }
  }

  const result = await db.collection('inquiries').deleteOne(filter)

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  await logAdminActivity(actor.email, 'deleted', 'inquiry', `Deleted inquiry ID ${id}`)

  return NextResponse.json({ success: true })
}
