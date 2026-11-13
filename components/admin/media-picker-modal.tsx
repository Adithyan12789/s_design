'use client'

import { useState, useRef, DragEvent } from 'react'
import {
  Upload,
  X,
  Search,
  Image as ImageIcon,
  Video as VideoIcon,
  Check,
  Loader2,
  Play,
  Film,
} from 'lucide-react'
import type { CmsMediaAsset, MediaType } from '@/lib/cms/types'

interface MediaPickerModalProps {
  open: boolean
  media: CmsMediaAsset[]
  defaultFilter?: 'all' | 'image' | 'video'
  onClose: () => void
  onSelect: (url: string, altText?: string, asset?: CmsMediaAsset) => void
  onUploaded: (asset: CmsMediaAsset) => void
}

function formatDuration(sec?: number | null) {
  if (!sec || isNaN(sec)) return null
  const mins = Math.floor(sec / 60)
  const remaining = Math.round(sec % 60)
  return `${mins}:${remaining.toString().padStart(2, '0')}`
}

function formatSize(bytes: number) {
  if (!bytes) return ''
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${Math.round(bytes / 1024)} KB`
}

export function MediaPickerModal({
  open,
  media,
  defaultFilter = 'all',
  onClose,
  onSelect,
  onUploaded,
}: MediaPickerModalProps) {
  const [filterTab, setFilterTab] = useState<'all' | 'image' | 'video'>(defaultFilter)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const isVideoAsset = (m: CmsMediaAsset) => {
    return (
      m.type === 'video' ||
      m.mimeType?.startsWith('video/') ||
      /\.(mp4|webm|mov|ogg|m4v)$/i.test(m.publicUrl)
    )
  }

  const filtered = media.filter((m) => {
    const isVid = isVideoAsset(m)
    if (filterTab === 'image' && isVid) return false
    if (filterTab === 'video' && !isVid) return false

    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      m.fileName.toLowerCase().includes(q) ||
      m.altText.toLowerCase().includes(q) ||
      m.publicUrl.toLowerCase().includes(q)
    )
  })

  async function handleUpload(files: FileList | File[] | null) {
    if (!files || files.length === 0) return
    const fileList = Array.from(files)
    setUploading(true)
    setError(null)
    setUploadProgress(`Uploading ${fileList.length} file(s)...`)

    try {
      let lastUploaded: CmsMediaAsset | null = null
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        setUploadProgress(`Uploading (${i + 1}/${fileList.length}): ${file.name}`)
        const fd = new FormData()
        fd.append('file', file)
        fd.append('altText', file.name.replace(/\.[^.]+$/, ''))

        const res = await fetch('/api/admin/media', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Upload failed')
        }
        const row = data.asset
        const mapped: CmsMediaAsset = {
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
        onUploaded(mapped)
        lastUploaded = mapped
      }

      if (lastUploaded) {
        onSelect(lastUploaded.publicUrl, lastUploaded.altText, lastUploaded)
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl bg-[#faf8f5] border border-[#dfd7c9] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161513] text-[#faf8f5]">
          <div>
            <h3 className="admin-serif text-2xl font-normal tracking-tight">Media Library</h3>
            <p className="text-xs text-[#e7e1d6]/70 mt-0.5">
              Select or upload images and videos stored in Cloudinary &amp; Atlas
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#e7e1d6]/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-4 border-b border-[#e6dfd3] bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#f4efe6] rounded-lg border border-[#e2dacf]">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                filterTab === 'all'
                  ? 'bg-white text-[#161513] shadow-sm font-semibold'
                  : 'text-[#6e6456] hover:text-[#161513]'
              }`}
            >
              All Media
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('image')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                filterTab === 'image'
                  ? 'bg-white text-[#161513] shadow-sm font-semibold'
                  : 'text-[#6e6456] hover:text-[#161513]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Images
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('video')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                filterTab === 'video'
                  ? 'bg-white text-[#161513] shadow-sm font-semibold'
                  : 'text-[#6e6456] hover:text-[#161513]'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5" />
              Videos
            </button>
          </div>

          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#8b8174] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename or alt text..."
              className="admin-input pl-9 text-xs"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="admin-btn-bronze text-xs py-2 px-3.5"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Media
              </>
            )}
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mx-4 mt-3 px-4 py-3 border-2 border-dashed rounded-lg transition-all text-center flex items-center justify-center gap-3 ${
            isDragging
              ? 'border-[#b68d54] bg-[#b68d54]/10 text-[#161513]'
              : 'border-[#dfd7c9] bg-[#faf8f5] text-[#7c7367]'
          }`}
        >
          <Film className="w-4 h-4 text-[#9b9081]" />
          <span className="text-xs">
            Drag &amp; drop images or videos anywhere here, or click <strong>Upload Media</strong>.
          </span>
        </div>

        {uploadProgress && (
          <div className="mx-4 mt-2 px-3.5 py-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {uploadProgress}
          </div>
        )}

        {error && (
          <div className="mx-4 mt-2 px-3.5 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[#7c7367]">
              {filterTab === 'video' ? (
                <VideoIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
              ) : (
                <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
              )}
              <p className="text-sm font-medium">No media assets found</p>
              <p className="text-xs mt-1">
                Upload images or videos above to store them permanently.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((item) => {
                const isVid = isVideoAsset(item)
                const durationLabel = formatDuration(item.duration)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item.publicUrl, item.altText, item)
                      onClose()
                    }}
                    className="group text-left rounded-lg border border-[#e6dfd3] bg-white overflow-hidden hover:border-[#b68d54] hover:shadow-md transition-all relative flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-[#ede8de] relative overflow-hidden flex items-center justify-center">
                      {isVid ? (
                        item.posterUrl ? (
                          <img
                            src={item.posterUrl}
                            alt={item.altText || item.fileName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <video
                            src={item.publicUrl}
                            preload="metadata"
                            muted
                            className="w-full h-full object-cover pointer-events-none"
                          />
                        )
                      ) : (
                        <img
                          src={item.publicUrl}
                          alt={item.altText || item.fileName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {/* Video indicator badge */}
                      {isVid && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-medium tracking-wider uppercase">
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Video</span>
                          {durationLabel && <span className="opacity-80">· {durationLabel}</span>}
                        </div>
                      )}

                      {/* Select check badge */}
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#161513]/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <p className="text-xs font-medium text-[#1c1a17] truncate">{item.fileName}</p>
                      <div className="flex items-center justify-between text-[11px] text-[#7c7367] mt-1">
                        <span>{formatSize(item.fileSize)}</span>
                        {item.width && item.height && (
                          <span>
                            {item.width}×{item.height}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ImageFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  onOpenPicker: () => void
  placeholder?: string
  description?: string
}

export function ImageField({
  label,
  value,
  onChange,
  onOpenPicker,
  placeholder = '/images/... or https://...',
  description,
}: ImageFieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="admin-label mb-0">{label}</label>
        <span className="text-[10px] uppercase tracking-wider text-[#9b9081] font-medium">Image Only</span>
      </div>
      {description && <p className="text-xs text-[#7c7367] mb-2">{description}</p>}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="w-28 h-20 rounded-lg border border-[#dfd7c9] bg-[#ede8de] overflow-hidden shrink-0 flex items-center justify-center relative group">
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-[#9b9081]" />
          )}
        </div>
        <div className="flex-1 w-full space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="admin-input"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onOpenPicker} className="admin-btn-secondary admin-btn-sm">
              <Upload className="w-3.5 h-3.5" />
              Upload / Choose Image
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="admin-btn-danger admin-btn-sm"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
