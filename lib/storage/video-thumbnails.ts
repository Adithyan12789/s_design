/**
 * Video Thumbnail Utilities for S_Designs
 * Automatically extracts representative frames from Cloudinary or browser video streams.
 */

// In-memory cache for client-side generated video frame data URLs
const clientThumbnailCache = new Map<string, string>()

/**
 * Detects whether a source URL or type represents a video.
 * Safe to call from both Server Components and Client Components.
 */
export function isVideoSource(src?: string | null, type?: 'image' | 'video'): boolean {
  if (type === 'video') return true
  if (type === 'image') return false
  if (!src || typeof src !== 'string') return false
  return Boolean(
    src.match(/\.(mp4|webm|mov|mkv|ogg|m4v)($|\?)/i) ||
      src.includes('/video/upload/') ||
      src.startsWith('data:video/')
  )
}

/**
 * Extracts a Cloudinary video thumbnail at the specified offset (default 1.5s).
 * Transforms .mp4/.webm/.mov to .jpg with `so_<seconds>,f_jpg,q_auto`.
 */
export function getCloudinaryVideoThumbnail(videoUrl?: string | null, offsetSeconds = 1.5): string {
  if (!videoUrl || typeof videoUrl !== 'string') return ''
  if (!videoUrl.includes('cloudinary.com')) return ''

  const uploadIdx = videoUrl.indexOf('/upload/')
  if (uploadIdx === -1) return ''

  const prefix = videoUrl.slice(0, uploadIdx + '/upload/'.length)
  let rest = videoUrl.slice(uploadIdx + '/upload/'.length)

  // Replace video extension with .jpg
  rest = rest.replace(/\.(mp4|webm|mov|mkv|ogg|m4v)(\?.*)?$/i, '.jpg$2')
  if (!rest.match(/\.jpg(\?.*)?$/i)) {
    rest = `${rest}.jpg`
  }

  // If already transformed with start_offset (so_), return as-is
  if (rest.includes('so_')) {
    return `${prefix}${rest}`
  }

  return `${prefix}so_${offsetSeconds},f_jpg,q_auto/${rest}`
}

/**
 * Client-side video frame capture using HTML5 <video> and <canvas>.
 * Captures a crisp representative frame at offsetSeconds (1–2s).
 * Safely handles crossOrigin, duration bounds, and browser caching.
 */
export async function generateVideoThumbnailFromUrl(
  videoUrl: string,
  offsetSeconds = 1.5
): Promise<string | null> {
  if (typeof window === 'undefined' || !videoUrl) return null

  // Check cache first
  const cacheKey = `${videoUrl}#t=${offsetSeconds}`
  if (clientThumbnailCache.has(cacheKey)) {
    return clientThumbnailCache.get(cacheKey)!
  }

  // If it's a Cloudinary video, use the Cloudinary CDN snapshot directly
  const cldThumb = getCloudinaryVideoThumbnail(videoUrl, offsetSeconds)
  if (cldThumb) {
    clientThumbnailCache.set(cacheKey, cldThumb)
    return cldThumb
  }

  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.src = videoUrl

    let hasHandled = false
    const cleanup = () => {
      hasHandled = true
      video.removeAttribute('src')
      video.load()
    }

    const timer = setTimeout(() => {
      if (!hasHandled) {
        cleanup()
        resolve(null)
      }
    }, 4500)

    video.onloadedmetadata = () => {
      const targetTime = Math.min(
        offsetSeconds,
        Math.max(0.1, (video.duration || 2) - 0.1)
      )
      video.currentTime = targetTime
    }

    video.onseeked = () => {
      if (hasHandled) return
      clearTimeout(timer)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 360
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
          clientThumbnailCache.set(cacheKey, dataUrl)
          cleanup()
          resolve(dataUrl)
          return
        }
      } catch {
        // Cross-origin tainted canvas fallback
      }
      cleanup()
      resolve(null)
    }

    video.onerror = () => {
      clearTimeout(timer)
      cleanup()
      resolve(null)
    }
  })
}

/**
 * Captures a frame from a local video File before upload.
 */
export async function captureVideoFileThumbnailBlob(
  file: File,
  offsetSeconds = 1.5
): Promise<{ blob: Blob; dataUrl: string } | null> {
  if (typeof window === 'undefined' || !file) return null

  return new Promise((resolve) => {
    const video = document.createElement('video')
    const objectUrl = URL.createObjectURL(file)
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.src = objectUrl

    let hasHandled = false
    const cleanup = () => {
      hasHandled = true
      URL.revokeObjectURL(objectUrl)
      video.removeAttribute('src')
      video.load()
    }

    const timer = setTimeout(() => {
      if (!hasHandled) {
        cleanup()
        resolve(null)
      }
    }, 5000)

    video.onloadedmetadata = () => {
      const targetTime = Math.min(
        offsetSeconds,
        Math.max(0.1, (video.duration || 2) - 0.1)
      )
      video.currentTime = targetTime
    }

    video.onseeked = () => {
      if (hasHandled) return
      clearTimeout(timer)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 360
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
          canvas.toBlob(
            (blob) => {
              cleanup()
              if (blob) {
                resolve({ blob, dataUrl })
              } else {
                resolve(null)
              }
            },
            'image/jpeg',
            0.88
          )
          return
        }
      } catch {
        // Ignore canvas error
      }
      cleanup()
      resolve(null)
    }

    video.onerror = () => {
      clearTimeout(timer)
      cleanup()
      resolve(null)
    }
  })
}
