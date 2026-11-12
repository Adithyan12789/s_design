'use client'

import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Eye,
  EyeOff,
  Save,
  X,
  Image as ImageIcon,
} from 'lucide-react'
import type { CmsProject, CmsProjectImage, CmsMediaAsset } from '@/lib/cms/types'
import { ImageField } from './media-picker-modal'

interface ProjectsManagerProps {
  projects: CmsProject[]
  onChange: (projects: CmsProject[]) => void
  onPickImage: (cb: (url: string, alt?: string) => void) => void
  onNotify: (msg: string, type?: 'success' | 'error') => void
  onDirtyChange: (dirty: boolean) => void
}

function emptyProject(order: number): CmsProject {
  return {
    id: '',
    slug: '',
    title: '',
    meta: '',
    location: '',
    year: new Date().getFullYear().toString(),
    type: 'Residential',
    category: 'Residential',
    area: '',
    size: 'large',
    shortDescription: '',
    fullDescription: '',
    mainImage: '',
    mainImageAlt: '',
    thumbnailImage: '',
    details: [],
    galleryImages: [],
    displayOrder: order,
    status: 'published',
    featured: false,
    seoTitle: '',
    seoDescription: '',
    updatedAt: new Date().toISOString(),
  }
}

export function ProjectsManager({
  projects,
  onChange,
  onPickImage,
  onNotify,
  onDirtyChange,
}: ProjectsManagerProps) {
  const [editing, setEditing] = useState<CmsProject | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CmsProject | null>(null)
  const [detailsText, setDetailsText] = useState('')

  function openEditor(project: CmsProject) {
    setEditing({ ...project, galleryImages: [...project.galleryImages] })
    setDetailsText((project.details || []).join('\n'))
    onDirtyChange(true)
  }

  function closeEditor() {
    setEditing(null)
    onDirtyChange(false)
  }

  async function handleSaveProject(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setSaving(true)

    const payload = {
      ...editing,
      details: detailsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    }

    try {
      const method = editing.id ? 'PATCH' : 'POST'
      const res = await fetch('/api/admin/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save project')

      const refreshed = await fetch('/api/admin/projects', { cache: 'no-store' })
      const refreshedData = await refreshed.json()
      if (refreshed.ok && Array.isArray(refreshedData.projects)) {
        onChange(refreshedData.projects)
      }

      onNotify(editing.id ? 'Project updated and published.' : 'New project created.')
      closeEditor()
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleReorder(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= projects.length) return

    const reordered = [...projects]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)
    const withOrder = reordered.map((p, idx) => ({ ...p, displayOrder: idx }))
    onChange(withOrder)

    const res = await fetch('/api/admin/projects', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorderIds: withOrder.map((p) => p.id) }),
    })
    if (res.ok) {
      onNotify('Project display order saved.')
    } else {
      onNotify('Failed to persist project order.', 'error')
    }
  }

  async function handleQuickToggle(project: CmsProject, field: 'status' | 'featured') {
    const nextValue =
      field === 'status' ? (project.status === 'published' ? 'draft' : 'published') : !project.featured

    const res = await fetch('/api/admin/projects', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...project,
        [field]: nextValue,
      }),
    })
    if (res.ok) {
      onChange(
        projects.map((p) => (p.id === project.id ? { ...p, [field]: nextValue } : p))
      )
      onNotify(`Project ${field} updated.`)
    } else {
      onNotify('Failed to update project.', 'error')
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/projects?id=${encodeURIComponent(deleteTarget.id)}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      onChange(projects.filter((p) => p.id !== deleteTarget.id))
      onNotify(`Deleted "${deleteTarget.title}".`)
    } else {
      onNotify('Failed to delete project.', 'error')
    }
    setDeleteTarget(null)
  }

  function addGalleryImage() {
    if (!editing) return
    onPickImage((url, alt) => {
      setEditing((prev) =>
        prev
          ? {
              ...prev,
              galleryImages: [
                ...prev.galleryImages,
                {
                  id: `temp-${Date.now()}`,
                  projectId: prev.id,
                  url,
                  altText: alt || prev.title,
                  displayOrder: prev.galleryImages.length,
                },
              ],
            }
          : null
      )
    })
  }

  function moveGalleryImage(index: number, dir: -1 | 1) {
    if (!editing) return
    const target = index + dir
    if (target < 0 || target >= editing.galleryImages.length) return
    const list = [...editing.galleryImages]
    const [item] = list.splice(index, 1)
    list.splice(target, 0, item)
    setEditing({ ...editing, galleryImages: list })
  }

  if (editing) {
    return (
      <form onSubmit={handleSaveProject} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="admin-serif text-3xl font-normal text-[#1c1a17]">
              {editing.id ? `Edit Project: ${editing.title}` : 'Create New Project'}
            </h2>
            <p className="text-xs text-[#7c7367] mt-0.5">
              Changes sync immediately to Selected Work &amp; /work/[slug] upon save.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={closeEditor} className="admin-btn-secondary">
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button type="submit" disabled={saving} className="admin-btn-primary">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="admin-card p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
                Core Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Project Title *</label>
                  <input
                    required
                    type="text"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">URL Slug (auto if blank)</label>
                  <input
                    type="text"
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    placeholder="e.g. casa-loma"
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Location</label>
                  <input
                    type="text"
                    value={editing.location}
                    onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Year</label>
                  <input
                    type="text"
                    value={editing.year}
                    onChange={(e) => setEditing({ ...editing, year: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Category / Type</label>
                  <input
                    type="text"
                    value={editing.category}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value, type: e.target.value })
                    }
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Area / Size Label</label>
                  <input
                    type="text"
                    value={editing.area}
                    onChange={(e) => setEditing({ ...editing, area: e.target.value })}
                    placeholder="e.g. 420 M²"
                    className="admin-input"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Meta Line (e.g. 2024 • Residential • Ibiza)</label>
                <input
                  type="text"
                  value={editing.meta}
                  onChange={(e) => setEditing({ ...editing, meta: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">Short Description</label>
                <textarea
                  rows={2}
                  value={editing.shortDescription}
                  onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })}
                  className="admin-textarea"
                />
              </div>

              <div>
                <label className="admin-label">Full Architectural Story</label>
                <textarea
                  rows={5}
                  value={editing.fullDescription}
                  onChange={(e) => setEditing({ ...editing, fullDescription: e.target.value })}
                  className="admin-textarea"
                />
              </div>

              <div>
                <label className="admin-label">Key Architectural Highlights (one per line)</label>
                <textarea
                  rows={4}
                  value={detailsText}
                  onChange={(e) => setDetailsText(e.target.value)}
                  className="admin-textarea font-mono text-xs"
                />
              </div>
            </div>

            <div className="admin-card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
                  Gallery Images ({editing.galleryImages.length})
                </h3>
                <button type="button" onClick={addGalleryImage} className="admin-btn-secondary text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  Add Gallery Image
                </button>
              </div>

              {editing.galleryImages.length === 0 ? (
                <p className="text-xs text-[#7c7367] py-4 text-center border border-dashed border-[#dfd7c9] rounded-lg">
                  No gallery images yet. Click &ldquo;Add Gallery Image&rdquo; to upload or select from Media Library.
                </p>
              ) : (
                <div className="space-y-3">
                  {editing.galleryImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border border-[#e6dfd3] bg-[#faf8f5]"
                    >
                      <img
                        src={img.url}
                        alt={img.altText || 'Gallery'}
                        className="w-24 h-16 rounded object-cover bg-[#ede8de] shrink-0"
                      />
                      <div className="flex-1 w-full space-y-1.5">
                        <input
                          type="text"
                          value={img.url}
                          onChange={(e) => {
                            const next = [...editing.galleryImages]
                            next[idx] = { ...img, url: e.target.value }
                            setEditing({ ...editing, galleryImages: next })
                          }}
                          className="admin-input text-xs py-1.5"
                          placeholder="Image URL"
                        />
                        <input
                          type="text"
                          value={img.altText}
                          onChange={(e) => {
                            const next = [...editing.galleryImages]
                            next[idx] = { ...img, altText: e.target.value }
                            setEditing({ ...editing, galleryImages: next })
                          }}
                          className="admin-input text-xs py-1.5"
                          placeholder="Alt text for accessibility & SEO"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveGalleryImage(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded border border-[#dfd7c9] bg-white disabled:opacity-40"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGalleryImage(idx, 1)}
                          disabled={idx === editing.galleryImages.length - 1}
                          className="p-1.5 rounded border border-[#dfd7c9] bg-white disabled:opacity-40"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              galleryImages: editing.galleryImages.filter((_, i) => i !== idx),
                            })
                          }
                          className="p-1.5 rounded border border-red-200 bg-red-50 text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="admin-card p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
                Visibility &amp; Layout
              </h3>
              <div>
                <label className="admin-label">Publish Status</label>
                <select
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({ ...editing, status: e.target.value as 'draft' | 'published' })
                  }
                  className="admin-select"
                >
                  <option value="published">Published (Live)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>
              <div>
                <label className="admin-label">Gallery Composition Size</label>
                <select
                  value={editing.size}
                  onChange={(e) =>
                    setEditing({ ...editing, size: e.target.value as 'large' | 'small' })
                  }
                  className="admin-select"
                >
                  <option value="large">Large Hero Card</option>
                  <option value="small">Compact Secondary Card</option>
                </select>
              </div>
              <label className="flex items-center gap-2.5 text-sm text-[#1c1a17] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                  className="w-4 h-4 accent-[#b68d54]"
                />
                Featured Project
              </label>
            </div>

            <div className="admin-card p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
                Primary Images
              </h3>
              <ImageField
                label="Main / Hero Image"
                value={editing.mainImage}
                onChange={(url) => setEditing({ ...editing, mainImage: url })}
                onOpenPicker={() =>
                  onPickImage((url, alt) =>
                    setEditing((prev) =>
                      prev
                        ? {
                            ...prev,
                            mainImage: url,
                            mainImageAlt: prev.mainImageAlt || alt || prev.title,
                          }
                        : null
                    )
                  )
                }
              />
              <div>
                <label className="admin-label">Main Image Alt Text</label>
                <input
                  type="text"
                  value={editing.mainImageAlt}
                  onChange={(e) => setEditing({ ...editing, mainImageAlt: e.target.value })}
                  className="admin-input"
                />
              </div>
              <ImageField
                label="Secondary Inset Thumbnail"
                value={editing.thumbnailImage}
                onChange={(url) => setEditing({ ...editing, thumbnailImage: url })}
                onOpenPicker={() =>
                  onPickImage((url) =>
                    setEditing((prev) => (prev ? { ...prev, thumbnailImage: url } : null))
                  )
                }
              />
            </div>

            <div className="admin-card p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
                Project SEO
              </h3>
              <div>
                <label className="admin-label">SEO Title</label>
                <input
                  type="text"
                  value={editing.seoTitle}
                  onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Meta Description</label>
                <textarea
                  rows={3}
                  value={editing.seoDescription}
                  onChange={(e) => setEditing({ ...editing, seoDescription: e.target.value })}
                  className="admin-textarea"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="admin-serif text-3xl font-normal text-[#1c1a17]">Projects Portfolio</h2>
          <p className="text-xs text-[#7c7367] mt-0.5">
            Manage architectural case studies, gallery order, and publication status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor(emptyProject(projects.length))}
          className="admin-btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add New Project
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e6dfd3] bg-[#faf8f5] text-[11px] uppercase tracking-wider text-[#6b6358]">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Category / Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe9de] text-sm">
              {projects.map((p, idx) => (
                <tr key={p.id || p.slug} className="hover:bg-[#faf8f5]/60">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleReorder(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded border border-[#dfd7c9] disabled:opacity-30"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(idx, 1)}
                        disabled={idx === projects.length - 1}
                        className="p-1 rounded border border-[#dfd7c9] disabled:opacity-30"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 rounded bg-[#ede8de] overflow-hidden shrink-0 flex items-center justify-center">
                        {p.mainImage ? (
                          <img src={p.mainImage} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-[#9b9081]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#1c1a17]">{p.title}</p>
                        <p className="text-xs text-[#7c7367]">/{p.slug} &middot; {p.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#595248]">
                    <p>{p.category}</p>
                    <p className="text-[#8b8174]">{p.location}</p>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleQuickToggle(p, 'status')}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {p.status === 'published' ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      {p.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleQuickToggle(p, 'featured')}
                      className={`p-1.5 rounded-full border ${
                        p.featured
                          ? 'bg-[#b68d54]/15 border-[#b68d54] text-[#9b7239]'
                          : 'border-[#dfd7c9] text-[#a59b8e]'
                      }`}
                      title="Toggle featured"
                    >
                      <Star className={`w-4 h-4 ${p.featured ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditor(p)}
                        className="admin-btn-secondary text-xs py-1.5 px-2.5"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        className="admin-btn-danger text-xs py-1.5 px-2.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md w-full rounded-xl bg-white p-6 shadow-xl border border-[#e6dfd3] space-y-4">
            <h3 className="admin-serif text-2xl text-[#1c1a17]">Delete Project?</h3>
            <p className="text-sm text-[#595248]">
              Are you sure you want to permanently delete <strong>{deleteTarget.title}</strong> and its gallery records?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="admin-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} className="admin-btn-danger">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function mapApiProject(row: Record<string, unknown>): CmsProject {
  const images = Array.isArray(row.project_images)
    ? (row.project_images as Record<string, unknown>[])
        .map((img) => ({
          id: String(img.id),
          projectId: String(img.project_id),
          url: String(img.url || ''),
          altText: String(img.alt_text || ''),
          displayOrder: Number(img.display_order ?? 0),
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder)
    : []

  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    meta: String(row.meta || ''),
    location: String(row.location || ''),
    year: String(row.year || ''),
    type: String(row.type || ''),
    category: String(row.category || ''),
    area: String(row.area || ''),
    size: row.size === 'small' ? 'small' : 'large',
    shortDescription: String(row.short_description || ''),
    fullDescription: String(row.full_description || ''),
    mainImage: String(row.main_image || ''),
    mainImageAlt: String(row.main_image_alt || ''),
    thumbnailImage: String(row.thumbnail_image || ''),
    details: Array.isArray(row.details) ? row.details.map(String) : [],
    galleryImages: images,
    displayOrder: Number(row.display_order ?? 0),
    status: row.status === 'draft' ? 'draft' : 'published',
    featured: Boolean(row.featured),
    seoTitle: String(row.seo_title || ''),
    seoDescription: String(row.seo_description || ''),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  }
}

