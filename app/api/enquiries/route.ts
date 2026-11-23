import { NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb/client'
import { sendEnquiryNotificationEmail } from '@/lib/email/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const phone = String(body.phone || '').trim()
    const location = String(body.location || '').trim()
    const projectType = String(body.projectType || '').trim()
    const budget = String(body.budget || '').trim()
    const message = String(body.message || '').trim()

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Please provide your name.' }, { status: 400 })
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }
    if (!message) {
      return NextResponse.json({ error: 'Please provide a brief message about your project.' }, { status: 400 })
    }

    const db = await getMongoDb()
    const now = new Date().toISOString()

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const enquiryDoc = {
      name,
      email,
      phone: phone || undefined,
      location: location || undefined,
      projectType: projectType || undefined,
      budget: budget || undefined,
      message,
      status: 'new' as const,
      createdAt: now,
      updatedAt: now,
      ip,
      userAgent,
    }

    let insertedId = 'local-' + Date.now()

    if (db) {
      const result = await db.collection('inquiries').insertOne(enquiryDoc)
      insertedId = result.insertedId.toString()
    }

    // Lookup recipient studio email from env, website settings, or default fallback
    let studioEmail = process.env.STUDIO_NOTIFICATION_EMAIL || ''
    if (!studioEmail && db) {
      try {
        const settingsDoc = await db.collection('websiteSettings').findOne({ _id: 'default' as unknown as never })
        if (settingsDoc?.email && settingsDoc.email !== 'hello@sdesigns.studio') {
          studioEmail = settingsDoc.email
        }
      } catch {
        // Fallback to default
      }
    }
    if (!studioEmail) {
      studioEmail = 'adithiruthiparambil12@gmail.com'
    }

    // Trigger email notification asynchronously via Resend
    sendEnquiryNotificationEmail({
      name,
      email,
      phone,
      location,
      projectType,
      budget,
      message,
      recipientEmail: studioEmail,
    }).catch((err) => {
      console.warn('[Enquiry Email Delivery Exception]:', err)
    })

    return NextResponse.json({
      success: true,
      id: insertedId,
      message: 'Thank you. Your enquiry has been received and our studio will be in touch shortly.',
    })
  } catch (err) {
    console.error('[Enquiry API Error]:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to submit enquiry. Please try again.' },
      { status: 500 }
    )
  }
}
