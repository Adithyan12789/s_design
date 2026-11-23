/**
 * Image Delivery Optimization for S_Designs
 * Generates responsive, auto-formatted (AVIF/WebP) and compressed derivative URLs
 * from Cloudinary, Unsplash, or local sources without mutating original master files.
 */

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number | 'auto'
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  crop?: 'limit' | 'fill' | 'scale' | 'crop'
}

/**
 * Returns an optimized CDN URL with automatic WebP/AVIF format and perceptual compression.
 */
export function getOptimizedImageUrl(
  src?: string | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!src || typeof src !== 'string') return ''
  const trimmed = src.trim()
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.endsWith('.svg')) {
    return trimmed
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
  } = options

  // 1. Cloudinary asset transformation
  if (trimmed.includes('cloudinary.com') && trimmed.includes('/upload/')) {
    const uploadIndex = trimmed.indexOf('/upload/') + '/upload/'.length
    const prefix = trimmed.slice(0, uploadIndex)
    let rest = trimmed.slice(uploadIndex)

    // Check if URL already has transformation flags
    if (/^f_[^/]+/.test(rest) || /^w_\d+/.test(rest) || /^c_[^/]+/.test(rest) || /^q_[^/]+/.test(rest)) {
      return trimmed
    }

    const transformSegments: string[] = []
    if (format) transformSegments.push(`f_${format}`)
    if (quality) transformSegments.push(`q_${quality}`)
    if (width) transformSegments.push(`w_${width}`)
    if (height) transformSegments.push(`h_${height}`)
    if (crop && (width || height)) transformSegments.push(`c_${crop}`)

    const transformString = transformSegments.join(',')
    return `${prefix}${transformString}/${rest}`
  }

  // 2. Unsplash asset transformation
  if (trimmed.includes('images.unsplash.com')) {
    try {
      const url = new URL(trimmed)
      url.searchParams.set('auto', 'format')
      if (width) url.searchParams.set('w', String(width))
      if (height) url.searchParams.set('h', String(height))
      url.searchParams.set('q', quality === 'auto' ? '82' : String(quality))
      if (crop === 'fill' || height) url.searchParams.set('fit', 'crop')
      return url.toString()
    } catch {
      return trimmed
    }
  }

  // 3. Fallback for static/local images
  return trimmed
}

/**
 * Generates an HTML responsive srcSet string across multiple breakpoint widths.
 */
export function getResponsiveImageSrcSet(
  src?: string | null,
  widths: number[] = [480, 768, 1024, 1440, 1920],
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string {
  if (!src || typeof src !== 'string') return ''
  const trimmed = src.trim()
  if (!trimmed || trimmed.startsWith('data:') || trimmed.endsWith('.svg')) return ''

  return widths
    .map((w) => `${getOptimizedImageUrl(trimmed, { ...options, width: w })} ${w}w`)
    .join(', ')
}
