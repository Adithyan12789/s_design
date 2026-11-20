import { NextResponse } from 'next/server'
import { withAdminDb } from '@/lib/cms/api-helpers'
import { isCloudinaryConfigured } from '@/lib/storage/cloudinary'
import { v2 as cloudinary } from 'cloudinary'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { actor, errorResponse } = await withAdminDb()
  if (errorResponse || !actor) return errorResponse!

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({
      configured: false,
      message: 'Cloudinary is not configured in environment variables.',
    })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') === 'video' ? 'video' : 'image'
  const folder = `s_designs/${type}s`
  const timestamp = Math.floor(Date.now() / 1000)

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  )

  return NextResponse.json({
    configured: true,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
    resourceType: type === 'video' ? 'video' : 'auto',
  })
}
