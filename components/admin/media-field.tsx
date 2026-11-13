'use client'

import {
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  Trash2,
  Film,
} from 'lucide-react'
import type { CmsMediaAsset, MediaType } from '@/lib/cms/types'

export interface MediaFieldProps {
  label: string
  description?: string
  mediaType?: MediaType
  imageUrl?: string
  videoUrl?: string
  posterUrl?: string
  onMediaTypeChange?: (type: MediaType) => void
  onImageUrlChange?: (url: string) => void
  onVideoUrlChange?: (url: string) => void
  onPosterUrlChange?: (url: string) => void
  onOpenPicker: (
    cb: (url: string, alt?: string, asset?: CmsMediaAsset) => void,
    filter?: 'all' | 'image' | 'video'
  ) => void
  allowVideo?: boolean
}

export function MediaField({
  label,
  description,
  mediaType = 'image',
  imageUrl = '',
  videoUrl = '',
  posterUrl = '',
  onMediaTypeChange,
  onImageUrlChange,
  onVideoUrlChange,
  onPosterUrlChange,
  onOpenPicker,
  allowVideo = true,
}: MediaFieldProps) {
  const currentType = allowVideo ? mediaType : 'image'

  const isVideoExt = (url: string) =>
    Boolean(url && (/\.(mp4|webm|mov|ogg|m4v|mkv)($|\?)/i.test(url) || url.includes('/video/upload/')))

  return (
    <div className="space-y-3.5 p-4 sm:p-5 rounded-xl border border-[#e6dfd3] bg-[#faf8f5] transition-all">
      {/* Header with Type Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="admin-label mb-0 font-medium text-[#1c1a17]">{label}</label>
          {description && <p className="text-xs text-[#7c7367] mt-0.5">{description}</p>}
        </div>

        {allowVideo && onMediaTypeChange && (
          <div className="flex items-center gap-1 p-0.5 bg-[#ede8de] rounded-lg border border-[#dfd7c9] shrink-0">
            <button
              type="button"
              onClick={() => onMediaTypeChange('image')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                currentType === 'image'
                  ? 'bg-white text-[#1c1a17] shadow-sm font-semibold'
                  : 'text-[#6e6456] hover:text-[#1c1a17]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Image
            </button>
            <button
              type="button"
              onClick={() => onMediaTypeChange('video')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                currentType === 'video'
                  ? 'bg-white text-[#1c1a17] shadow-sm font-semibold'
                  : 'text-[#6e6456] hover:text-[#1c1a17]'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5" />
              Video
            </button>
          </div>
        )}
      </div>

      {/* Mode: Image */}
      {currentType === 'image' && (
        <div className="flex flex-col sm:flex-row gap-4 items-start pt-1">
          <div className="w-full sm:w-36 h-24 rounded-lg border border-[#dfd7c9] bg-[#ede8de] overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm">
            {imageUrl ? (
              <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-2 text-[#9b9081]">
                <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <span className="text-[10px]">No image</span>
              </div>
            )}
          </div>

          <div className="flex-1 w-full min-w-0 space-y-2.5">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => {
                const val = e.target.value
                if (isVideoExt(val) && onVideoUrlChange) {
                  onMediaTypeChange?.('video')
                  onVideoUrlChange(val)
                } else {
                  onImageUrlChange?.(val)
                }
              }}
              placeholder="https://res.cloudinary.com/... or /images/..."
              className="admin-input text-xs"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onOpenPicker(
                    (url, _alt, asset) => {
                      const isVid =
                        asset?.type === 'video' ||
                        asset?.mimeType?.startsWith('video/') ||
                        isVideoExt(url)
                      if (isVid && onVideoUrlChange) {
                        onMediaTypeChange?.('video')
                        onVideoUrlChange(url)
                        if (asset?.posterUrl && onPosterUrlChange && !posterUrl) {
                          onPosterUrlChange(asset.posterUrl)
                        }
                      } else {
                        onImageUrlChange?.(url)
                      }
                    },
                    'image'
                  )
                }
                className="admin-btn-secondary admin-btn-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                Choose / Upload Image
              </button>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => onImageUrlChange?.('')}
                  className="admin-btn-danger admin-btn-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode: Video */}
      {currentType === 'video' && (
        <div className="space-y-4 pt-1">
          {/* Video Preview & Video Source URL */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full sm:w-52 aspect-video rounded-lg border border-[#dfd7c9] bg-[#161513] overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  poster={posterUrl || undefined}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-3 text-[#7c7367]">
                  <Film className="w-6 h-6 mx-auto mb-1 opacity-50 text-white/50" />
                  <span className="text-[10px] text-white/70">No video selected</span>
                </div>
              )}
            </div>

            <div className="flex-1 w-full min-w-0 space-y-2.5">
              <div>
                <label className="text-[11px] font-medium text-[#6e6456] uppercase tracking-wider block mb-1">
                  Video URL (Cloudinary MP4, WebM or /uploads/...)
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => {
                    onMediaTypeChange?.('video')
                    onVideoUrlChange?.(e.target.value)
                  }}
                  placeholder="https://res.cloudinary.com/.../video.mp4 or /uploads/..."
                  className="admin-input text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() =>
                    onOpenPicker(
                      (url, _alt, asset) => {
                        onMediaTypeChange?.('video')
                        onVideoUrlChange?.(url)
                        if (asset?.posterUrl && !posterUrl) {
                          onPosterUrlChange?.(asset.posterUrl)
                        }
                      },
                      'video'
                    )
                  }
                  className="admin-btn-secondary admin-btn-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Choose / Upload Video
                </button>
                {videoUrl && (
                  <button
                    type="button"
                    onClick={() => onVideoUrlChange?.('')}
                    className="admin-btn-danger admin-btn-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Video
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Video Poster Thumbnail Option */}
          {onPosterUrlChange && (
            <div className="pt-3 border-t border-[#e8e2d8] flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-24 h-16 rounded-lg border border-[#dfd7c9] bg-[#ede8de] overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm">
                {posterUrl ? (
                  <img src={posterUrl} alt="Poster" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-[#9b9081]" />
                )}
              </div>

              <div className="flex-1 w-full min-w-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-[#6e6456] uppercase tracking-wider">
                    Video Poster / Thumbnail (Image shown before playback)
                  </label>
                  {posterUrl && (
                    <button
                      type="button"
                      onClick={() => onPosterUrlChange?.('')}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Clear Poster
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={posterUrl}
                    onChange={(e) => onPosterUrlChange?.(e.target.value)}
                    placeholder="Poster image URL..."
                    className="admin-input text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onOpenPicker(
                        (url) => onPosterUrlChange?.(url),
                        'image'
                      )
                    }
                    className="admin-btn-secondary admin-btn-sm shrink-0"
                  >
                    Select Poster
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
