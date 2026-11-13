import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import path from 'node:path'
import fs from 'node:fs/promises'
import fsSync from 'node:fs'

export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
])

export const ALLOWED_VIDEO_MIMES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
  'video/x-matroska',
])

export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  return (
    Boolean(cloudName && apiKey && apiSecret) &&
    cloudName !== 'your-cloud-name' &&
    apiKey !== 'your-cloudinary-api-key' &&
    apiSecret !== 'your-cloudinary-api-secret'
  )
}

function getCloudinary() {
  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })
  }
  return cloudinary
}

export type UploadedMediaResult = {
  url: string
  publicId: string
  storagePath: string
  type: 'image' | 'video'
  mimeType: string
  fileName: string
  fileSize: number
  width: number | null
  height: number | null
  duration: number | null
  posterUrl: string | null
  altText: string
}

function ensureUploadDirSync() {
  if (!fsSync.existsSync(UPLOAD_DIR)) {
    fsSync.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * Upload a media buffer to Cloudinary (or local storage fallback if unconfigured).
 */
export async function uploadMediaBuffer({
  buffer,
  fileName,
  mimeType,
  altText,
}: {
  buffer: Buffer
  fileName: string
  mimeType: string
  altText?: string
}): Promise<UploadedMediaResult> {
  const isVideo = ALLOWED_VIDEO_MIMES.has(mimeType) || mimeType.startsWith('video/')
  const isImage = ALLOWED_IMAGE_MIMES.has(mimeType) || mimeType.startsWith('image/')

  if (!isVideo && !isImage) {
    throw new Error(
      `Unsupported media type "${mimeType}". Allowed images: JPG, PNG, WebP, AVIF, SVG. Allowed videos: MP4, WebM, MOV.`
    )
  }

  const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image'
  const cleanAlt = (altText || fileName.replace(/\.[^.]+$/, '')).trim()

  // 1. Primary: Cloudinary Storage
  if (isCloudinaryConfigured()) {
    const cld = getCloudinary()
    const cleanBaseName = path
      .basename(fileName, path.extname(fileName))
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .slice(0, 40)
    const publicId = `s_designs/${mediaType}s/${Date.now()}-${cleanBaseName || 'asset'}`

    const uploadOptions: Record<string, unknown> = {
      folder: `s_designs/${mediaType}s`,
      resource_type: mediaType,
      public_id: `${Date.now()}-${cleanBaseName || 'asset'}`,
      overwrite: false,
    }

    if (isVideo) {
      uploadOptions.chunk_size = 20 * 1024 * 1024 // 20 MB chunks for videos
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cld.uploader.upload_stream(uploadOptions, (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error || new Error('Cloudinary upload returned empty response.'))
        } else {
          resolve(uploadResult)
        }
      })
      uploadStream.end(buffer)
    })

    let posterUrl: string | null = null
    if (isVideo) {
      // Cloudinary automatically provides JPG snapshot posters from videos
      posterUrl = result.secure_url
        ? result.secure_url.replace(/\.[^.]+$/, '.jpg')
        : cld.url(result.public_id, { resource_type: 'video', format: 'jpg', secure: true })
    }

    return {
      url: result.secure_url || result.url,
      publicId: result.public_id,
      storagePath: result.public_id,
      type: mediaType,
      mimeType,
      fileName,
      fileSize: result.bytes || buffer.length,
      width: typeof result.width === 'number' ? result.width : null,
      height: typeof result.height === 'number' ? result.height : null,
      duration: typeof result.duration === 'number' ? Math.round(result.duration) : null,
      posterUrl,
      altText: cleanAlt,
    }
  }

  // 2. Resilient Fallback: Local uploads directory
  ensureUploadDirSync()
  const ext = path.extname(fileName).toLowerCase()
  const base = path
    .basename(fileName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .slice(0, 40)
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${base || mediaType}${ext}`
  const filePath = path.join(UPLOAD_DIR, uniqueName)

  await fs.writeFile(filePath, buffer)

  return {
    url: `/uploads/${uniqueName}`,
    publicId: uniqueName,
    storagePath: uniqueName,
    type: mediaType,
    mimeType,
    fileName,
    fileSize: buffer.length,
    width: null,
    height: null,
    duration: null,
    posterUrl: null,
    altText: cleanAlt,
  }
}

/**
 * Delete a media file from Cloudinary (or local disk).
 */
export async function deleteMediaAsset(
  publicIdOrPath: string,
  type: 'image' | 'video' = 'image'
): Promise<void> {
  if (!publicIdOrPath) return

  if (isCloudinaryConfigured() && (publicIdOrPath.includes('/') || !publicIdOrPath.includes('.'))) {
    try {
      const cld = getCloudinary()
      await cld.uploader.destroy(publicIdOrPath, { resource_type: type })
      return
    } catch {
      // Continue to local disk check if needed
    }
  }

  // Local storage cleanup
  try {
    const safeName = path.basename(publicIdOrPath)
    const localPath = path.join(UPLOAD_DIR, safeName)
    await fs.unlink(localPath).catch(() => {})
  } catch {
    // Ignore cleanup error
  }
}

