import type { CmsMediaAsset } from '@/lib/cms/types'

export interface UploadProgressInfo {
  percent: number
  loaded: number
  total: number
}

const VERCEL_MAX_BUFFER_BYTES = 4.5 * 1024 * 1024 // 4.5 MB platform limit for serverless functions

/**
 * Upload a media file (image or video) seamlessly.
 *
 * 1. Checks if Cloudinary direct signed upload is available.
 *    If available: uploads directly from browser to Cloudinary (bypassing Vercel's 4.5MB function limit).
 *    Supports large videos up to 100MB+.
 *
 * 2. If Cloudinary is unconfigured:
 *    - For files <= 4.5MB: uploads via internal server route /api/admin/media.
 *    - For files > 4.5MB: warns the admin clearly with instructions on Cloudinary credentials or URL import.
 */
export async function uploadClientMedia({
  file,
  altText = '',
  onProgress,
}: {
  file: File
  altText?: string
  onProgress?: (info: UploadProgressInfo) => void
}): Promise<CmsMediaAsset> {
  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|ogg)$/i.test(file.name)
  const resourceType = isVideo ? 'video' : 'image'
  const cleanAlt = altText || file.name.replace(/\.[^.]+$/, '')

  // Step 1: Check for Cloudinary direct upload signature
  let signData: {
    configured: boolean
    cloudName?: string
    apiKey?: string
    timestamp?: number
    folder?: string
    signature?: string
    resourceType?: string
  } | null = null

  try {
    const signRes = await fetch(`/api/admin/media/sign?type=${resourceType}`)
    if (signRes.ok) {
      signData = await signRes.json()
    }
  } catch {
    // Continue to server fallback
  }

  // Path A: Cloudinary Direct Upload (Bypasses Vercel's 4.5MB limit entirely!)
  if (signData && signData.configured && signData.cloudName && signData.signature) {
    const cldEndpoint = `https://api.cloudinary.com/v1_1/${signData.cloudName}/${signData.resourceType || 'auto'}/upload`

    const fd = new FormData()
    fd.append('file', file)
    fd.append('api_key', signData.apiKey || '')
    fd.append('timestamp', String(signData.timestamp || ''))
    fd.append('folder', signData.folder || `s_designs/${resourceType}s`)
    fd.append('signature', signData.signature)

    const cldResult = await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', cldEndpoint)

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100)
            onProgress({ percent, loaded: e.loaded, total: e.total })
          }
        }
      }

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(res)
          } else {
            reject(new Error(res.error?.message || `Cloudinary upload failed (${xhr.status})`))
          }
        } catch {
          reject(new Error(`Failed to parse Cloudinary response (${xhr.status})`))
        }
      }

      xhr.onerror = () => {
        reject(new Error('Network error during direct Cloudinary upload.'))
      }

      xhr.send(fd)
    })

    const videoPoster =
      isVideo && cldResult.secure_url
        ? cldResult.secure_url.replace(/\.[^.]+$/, '.jpg')
        : null

    // Register asset in MongoDB Atlas via small JSON payload
    const registerRes = await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: cldResult.secure_url || cldResult.url,
        publicId: cldResult.public_id,
        storagePath: cldResult.public_id,
        type: isVideo ? 'video' : 'image',
        mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        fileName: file.name,
        fileSize: cldResult.bytes || file.size,
        width: typeof cldResult.width === 'number' ? cldResult.width : null,
        height: typeof cldResult.height === 'number' ? cldResult.height : null,
        duration: typeof cldResult.duration === 'number' ? Math.round(cldResult.duration) : null,
        posterUrl: videoPoster,
        altText: cleanAlt,
      }),
    })

    const regData = await safeParseJson(registerRes)
    if (!registerRes.ok) {
      throw new Error(regData.error || 'Failed to register media asset.')
    }
    return mapAsset(regData.asset)
  }

  // Path B: Cloudinary is NOT configured.
  // Check if file exceeds Vercel Serverless Function 4.5MB limit
  if (file.size > VERCEL_MAX_BUFFER_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    throw new Error(
      `File size (${sizeMb} MB) exceeds Vercel's 4.5 MB serverless limit for direct uploads. To upload large videos on your hosted site, please configure Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) in your Vercel Environment Variables, or use the "Add via URL" option.`
    )
  }

  // Path C: File <= 4.5MB -> Upload through internal API route
  const fd = new FormData()
  fd.append('file', file)
  fd.append('altText', cleanAlt)

  const res = await fetch('/api/admin/media', {
    method: 'POST',
    body: fd,
  })

  const data = await safeParseJson(res)
  if (!res.ok) {
    throw new Error(data.error || 'Upload failed')
  }

  return mapAsset(data.asset)
}

/**
 * Register any external media URL (e.g. Cloudinary, Vimeo, S3, CDN) directly into the library.
 */
export async function registerMediaUrl({
  url,
  altText = '',
  type,
  posterUrl,
}: {
  url: string
  altText?: string
  type?: 'image' | 'video'
  posterUrl?: string
}): Promise<CmsMediaAsset> {
  const cleanUrl = url.trim()
  if (!cleanUrl) {
    throw new Error('Media URL is required.')
  }

  const isVideo =
    type === 'video' ||
    Boolean(cleanUrl.match(/\.(mp4|webm|mov|mkv|ogg)(\?.*)?$/i)) ||
    cleanUrl.includes('/video/upload/')

  const res = await fetch('/api/admin/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: cleanUrl,
      altText,
      type: isVideo ? 'video' : 'image',
      posterUrl,
    }),
  })

  const data = await safeParseJson(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to add media via URL.')
  }

  return mapAsset(data.asset)
}

/**
 * Safely parse JSON response and catch 413 Request Entity Too Large or plain text errors.
 */
async function safeParseJson(res: Response): Promise<any> {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    if (res.status === 413 || text.toLowerCase().includes('entity too large')) {
      throw new Error(
        'Upload failed: Request Entity Too Large (HTTP 413). Hosted servers like Vercel have a 4.5MB limit for direct server functions. Configure Cloudinary environment variables on Vercel to enable direct uploads, or paste a video URL.'
      )
    }
    throw new Error(text || `Server returned status ${res.status}`)
  }
}

function mapAsset(row: any): CmsMediaAsset {
  return {
    id: row.id,
    storagePath: row.storagePath ?? row.storage_path,
    publicUrl: row.publicUrl ?? row.public_url,
    fileName: row.fileName ?? row.file_name,
    mimeType: row.mimeType ?? row.mime_type,
    fileSize: row.fileSize ?? row.file_size,
    width: row.width ?? null,
    height: row.height ?? null,
    altText: row.altText ?? row.alt_text ?? '',
    type: row.type ?? (row.mimeType?.startsWith('video/') ? 'video' : 'image'),
    publicId: row.publicId ?? null,
    posterUrl: row.posterUrl ?? null,
    duration: row.duration ?? null,
    createdAt: row.createdAt ?? row.created_at,
  }
}
