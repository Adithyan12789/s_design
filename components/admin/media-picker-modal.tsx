'use client'

import { useState, useRef } from 'react'
import { Upload, X, Search, Image as ImageIcon, Check, Loader2 } from 'lucide-react'
import type { CmsMediaAsset } from '@/lib/cms/types'

interface MediaPickerModalProps {
  open: boolean
  media: CmsMediaAsset[]
  onClose: () => void
  onSelect: (url: string, altText?: string) => void
  onUploaded: (asset: CmsMediaAsset) => void
}

export function MediaPickerModal({
  open,
  media,
  onClose,
  onSelect,
  onUploaded,
}: MediaPickerModalProps) {
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const filtered = media.filter((m) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      m.fileName.toLowerCase().includes(q) ||
      m.altText.toLowerCase().includes(q) ||
      m.publicUrl.toLowerCase().includes(q)
    )
  })

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
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
          createdAt: row.createdAt ?? row.created_at,
        }
        onUploaded(mapped)
        onSelect(mapped.publicUrl, mapped.altText)
        onClose()
        break
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-xl bg-[#faf8f5] border border-[#dfd7c9] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#161513] text-[#faf8f5]">
          <div>
            <h3 className="admin-serif text-2xl font-normal">Media Library</h3>
            <p className="text-xs text-[#e7e1d6]/70">
              Upload a new image or select an existing asset from storage
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#e7e1d6]/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-[#e6dfd3] bg-white flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#8b8174] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename or alt text..."
              className="admin-input pl-9"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,image/x-icon"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="admin-btn-bronze"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload New Image
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-3 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <div className="text-center py-14 text-[#7c7367]">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No uploaded media assets yet</p>
              <p className="text-xs mt-1">
                Upload an image above to store it permanently in Supabase Storage.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.publicUrl, item.altText)
                    onClose()
                  }}
                  className="group text-left rounded-lg border border-[#e6dfd3] bg-white overflow-hidden hover:border-[#b68d54] transition-all"
                >
                  <div className="aspect-[4/3] bg-[#ede8de] relative overflow-hidden">
                    <img
                      src={item.publicUrl}
                      alt={item.altText || item.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#161513]/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-[#1c1a17] truncate">{item.fileName}</p>
                    <p className="text-[11px] text-[#7c7367] truncate mt-0.5">
                      {(item.fileSize / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </button>
              ))}
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
}

export function ImageField({
  label,
  value,
  onChange,
  onOpenPicker,
  placeholder = '/images/... or https://...',
}: ImageFieldProps) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="w-28 h-20 rounded-lg border border-[#dfd7c9] bg-[#ede8de] overflow-hidden shrink-0 flex items-center justify-center">
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
            <button type="button" onClick={onOpenPicker} className="admin-btn-secondary text-xs py-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload / Choose Image
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="admin-btn-danger text-xs py-1.5"
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

