'use client'

import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { CmsService, CmsTestimonial, CmsNavItem, CmsProject } from '@/lib/cms/types'
import { ImageField } from './media-picker-modal'

interface BaseListProps {
  onPickImage: (cb: (url: string, alt?: string) => void) => void
  onNotify: (msg: string, type?: 'success' | 'error') => void
  onDirtyChange: (dirty: boolean) => void
}

/* ===========================
   SERVICES MANAGER
   =========================== */
export function ServicesManager({
  services,
  onChange,
  onPickImage,
  onNotify,
  onDirtyChange,
}: BaseListProps & {
  services: CmsService[]
  onChange: (list: CmsService[]) => void
}) {
  const [editing, setEditing] = useState<CmsService | null>(null)
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditing({
      id: '',
      title: '',
      slug: '',
      shortDescription: '',
      fullDescription: '',
      imageUrl: '',
      iconName: '',
      displayOrder: services.length,
      status: 'published',
      seoTitle: '',
      seoDescription: '',
    })
    onDirtyChange(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/services', {
        method: editing.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save service')

      const refreshed = await fetch('/api/admin/services', { cache: 'no-store' }).then((r) => r.json())
      if (Array.isArray(refreshed.services)) {
        onChange(refreshed.services)
      }
      onNotify(editing.id ? 'Service updated.' : 'Service created.')
      setEditing(null)
      onDirtyChange(false)
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleReorder(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= services.length) return
    const next = [...services]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next.map((s, idx) => ({ ...s, displayOrder: idx })))

    const res = await fetch('/api/admin/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorderIds: next.map((s) => s.id) }),
    })
    if (res.ok) onNotify('Service order saved.')
  }

  async function handleDelete(item: CmsService) {
    if (!confirm(`Delete service "${item.title}"?`)) return
    const res = await fetch(`/api/admin/services?id=${encodeURIComponent(item.id)}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      onChange(services.filter((s) => s.id !== item.id))
      onNotify('Service deleted.')
    } else {
      onNotify('Failed to delete service.', 'error')
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="admin-serif text-3xl text-[#1c1a17]">
            {editing.id ? `Edit Service: ${editing.title}` : 'Add Service'}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                onDirtyChange(false)
              }}
              className="admin-btn-secondary"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button type="submit" disabled={saving} className="admin-btn-primary">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </div>

        <div className="admin-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Service Title *</label>
              <input
                required
                type="text"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Slug</label>
              <input
                type="text"
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Icon Name (optional)</label>
              <input
                type="text"
                value={editing.iconName}
                onChange={(e) => setEditing({ ...editing, iconName: e.target.value })}
                placeholder="e.g. compass, layers"
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Status</label>
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as 'draft' | 'published' })
                }
                className="admin-select"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="admin-label">Short Description (Shown on Homepage)</label>
            <textarea
              rows={2}
              value={editing.shortDescription}
              onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })}
              className="admin-textarea"
            />
          </div>

          <div>
            <label className="admin-label">Full Description</label>
            <textarea
              rows={4}
              value={editing.fullDescription}
              onChange={(e) => setEditing({ ...editing, fullDescription: e.target.value })}
              className="admin-textarea"
            />
          </div>

          <ImageField
            label="Service Image"
            value={editing.imageUrl}
            onChange={(url) => setEditing({ ...editing, imageUrl: url })}
            onOpenPicker={() =>
              onPickImage((url) => setEditing((prev) => (prev ? { ...prev, imageUrl: url } : null)))
            }
          />
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17]">Architectural Services</h2>
          <p className="text-xs text-[#7c7367] mt-0.5">
            Controls the Capabilities &amp; Disciplines section on the homepage.
          </p>
        </div>
        <button type="button" onClick={openNew} className="admin-btn-primary">
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      <div className="space-y-3">
        {services.map((s, idx) => (
          <div key={s.id} className="admin-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleReorder(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded border border-[#dfd7c9] disabled:opacity-30"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(idx, 1)}
                  disabled={idx === services.length - 1}
                  className="p-1 rounded border border-[#dfd7c9] disabled:opacity-30"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#b68d54]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-medium text-[#1c1a17]">{s.title}</h3>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      s.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="text-xs text-[#6b6358] line-clamp-1 mt-0.5">{s.shortDescription}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(s)
                  onDirtyChange(true)
                }}
                className="admin-btn-secondary text-xs py-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s)}
                className="admin-btn-danger text-xs py-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===========================
   TESTIMONIALS MANAGER
   =========================== */
export function TestimonialsManager({
  testimonials,
  projects,
  onChange,
  onPickImage,
  onNotify,
  onDirtyChange,
}: BaseListProps & {
  testimonials: CmsTestimonial[]
  projects: CmsProject[]
  onChange: (list: CmsTestimonial[]) => void
}) {
  const [editing, setEditing] = useState<CmsTestimonial | null>(null)
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditing({
      id: '',
      clientName: '',
      designation: '',
      quote: '',
      clientPhoto: '',
      rating: 5,
      projectId: null,
      displayOrder: testimonials.length,
      status: 'published',
    })
    onDirtyChange(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: editing.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save review')

      const refreshed = await fetch('/api/admin/testimonials', { cache: 'no-store' }).then((r) =>
        r.json()
      )
      if (Array.isArray(refreshed.testimonials)) {
        onChange(refreshed.testimonials)
      }
      onNotify(editing.id ? 'Review updated.' : 'Review added.')
      setEditing(null)
      onDirtyChange(false)
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleReorder(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= testimonials.length) return
    const next = [...testimonials]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next.map((t, idx) => ({ ...t, displayOrder: idx })))

    const res = await fetch('/api/admin/testimonials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorderIds: next.map((t) => t.id) }),
    })
    if (res.ok) onNotify('Review order saved.')
  }

  async function handleDelete(item: CmsTestimonial) {
    if (!confirm(`Delete testimonial from "${item.clientName}"?`)) return
    const res = await fetch(`/api/admin/testimonials?id=${encodeURIComponent(item.id)}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      onChange(testimonials.filter((t) => t.id !== item.id))
      onNotify('Review deleted.')
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="admin-serif text-3xl text-[#1c1a17]">
            {editing.id ? `Edit Review: ${editing.clientName}` : 'Add Client Review'}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                onDirtyChange(false)
              }}
              className="admin-btn-secondary"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button type="submit" disabled={saving} className="admin-btn-primary">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Review'}
            </button>
          </div>
        </div>

        <div className="admin-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Client Name *</label>
              <input
                required
                type="text"
                value={editing.clientName}
                onChange={(e) => setEditing({ ...editing, clientName: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Designation / Role (Optional)</label>
              <input
                type="text"
                value={editing.designation}
                onChange={(e) => setEditing({ ...editing, designation: e.target.value })}
                placeholder="e.g. Private Residence Owner"
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Star Rating (1 - 5)</label>
              <select
                value={editing.rating}
                onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                className="admin-select"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Stars
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label">Linked Project (Optional)</label>
              <select
                value={editing.projectId || ''}
                onChange={(e) => setEditing({ ...editing, projectId: e.target.value || null })}
                className="admin-select"
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label">Visibility</label>
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as 'draft' | 'published' })
                }
                className="admin-select"
              >
                <option value="published">Published</option>
                <option value="draft">Hidden (Draft)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="admin-label">Review Quote *</label>
            <textarea
              required
              rows={3}
              value={editing.quote}
              onChange={(e) => setEditing({ ...editing, quote: e.target.value })}
              className="admin-textarea"
            />
          </div>

          <ImageField
            label="Client Photo (Optional)"
            value={editing.clientPhoto}
            onChange={(url) => setEditing({ ...editing, clientPhoto: url })}
            onOpenPicker={() =>
              onPickImage((url) =>
                setEditing((prev) => (prev ? { ...prev, clientPhoto: url } : null))
              )
            }
          />
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17]">Testimonials &amp; Reviews</h2>
          <p className="text-xs text-[#7c7367] mt-0.5">
            Displayed in the cinematic client review carousel above Begin a Project.
          </p>
        </div>
        <button type="button" onClick={openNew} className="admin-btn-primary">
          <Plus className="w-4 h-4" />
          Add Review
        </button>
      </div>

      <div className="space-y-3">
        {testimonials.map((t, idx) => (
          <div key={t.id} className="admin-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleReorder(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded border border-[#dfd7c9] disabled:opacity-30"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(idx, 1)}
                  disabled={idx === testimonials.length - 1}
                  className="p-1 rounded border border-[#dfd7c9] disabled:opacity-30"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-[#1c1a17]">{t.clientName}</h3>
                  <div className="flex items-center text-[#b68d54]">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      t.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-[#6b6358] line-clamp-1 mt-0.5">&ldquo;{t.quote}&rdquo;</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(t)
                  onDirtyChange(true)
                }}
                className="admin-btn-secondary text-xs py-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(t)}
                className="admin-btn-danger text-xs py-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===========================
   NAVIGATION MANAGER
   =========================== */
export function NavigationManager({
  navigation,
  onChange,
  onPickImage,
  onNotify,
  onDirtyChange,
}: BaseListProps & {
  navigation: CmsNavItem[]
  onChange: (list: CmsNavItem[]) => void
}) {
  const [editing, setEditing] = useState<CmsNavItem | null>(null)
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditing({
      id: '',
      label: '',
      href: '/#',
      subtitle: '',
      previewImage: '',
      displayOrder: navigation.length,
      visible: true,
      isCta: false,
    })
    onDirtyChange(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/navigation', {
        method: editing.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save navigation link')

      const refreshed = await fetch('/api/admin/navigation', { cache: 'no-store' }).then((r) =>
        r.json()
      )
      if (Array.isArray(refreshed.navigation)) {
        onChange(refreshed.navigation)
      }
      onNotify('Navigation saved.')
      setEditing(null)
      onDirtyChange(false)
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleReorder(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= navigation.length) return
    const next = [...navigation]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next.map((n, idx) => ({ ...n, displayOrder: idx })))

    const res = await fetch('/api/admin/navigation', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorderIds: next.map((n) => n.id) }),
    })
    if (res.ok) onNotify('Navigation order saved.')
  }

  async function handleToggleVisible(item: CmsNavItem) {
    const updated = { ...item, visible: !item.visible }
    const res = await fetch('/api/admin/navigation', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    if (res.ok) {
      onChange(navigation.map((n) => (n.id === item.id ? updated : n)))
      onNotify('Visibility updated.')
    }
  }

  async function handleDelete(item: CmsNavItem) {
    if (!confirm(`Delete navigation link "${item.label}"?`)) return
    const res = await fetch(`/api/admin/navigation?id=${encodeURIComponent(item.id)}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      onChange(navigation.filter((n) => n.id !== item.id))
      onNotify('Navigation link deleted.')
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="admin-serif text-3xl text-[#1c1a17]">
            {editing.id ? `Edit Link: ${editing.label}` : 'Add Navigation Link'}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                onDirtyChange(false)
              }}
              className="admin-btn-secondary"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button type="submit" disabled={saving} className="admin-btn-primary">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Link'}
            </button>
          </div>
        </div>

        <div className="admin-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Menu Label *</label>
              <input
                required
                type="text"
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Destination Path / Anchor *</label>
              <input
                required
                type="text"
                value={editing.href}
                onChange={(e) => setEditing({ ...editing, href: e.target.value })}
                placeholder="/#selected-work"
                className="admin-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="admin-label">Overlay Subtitle</label>
              <input
                type="text"
                value={editing.subtitle}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>

          <ImageField
            label="Menu Overlay Hover Image"
            value={editing.previewImage}
            onChange={(url) => setEditing({ ...editing, previewImage: url })}
            onOpenPicker={() =>
              onPickImage((url) =>
                setEditing((prev) => (prev ? { ...prev, previewImage: url } : null))
              )
            }
          />

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-[#1c1a17]">
              <input
                type="checkbox"
                checked={editing.visible}
                onChange={(e) => setEditing({ ...editing, visible: e.target.checked })}
                className="w-4 h-4 accent-[#b68d54]"
              />
              Visible in Menu
            </label>
            <label className="flex items-center gap-2 text-sm text-[#1c1a17]">
              <input
                type="checkbox"
                checked={editing.isCta}
                onChange={(e) => setEditing({ ...editing, isCta: e.target.checked })}
                className="w-4 h-4 accent-[#b68d54]"
              />
              Primary Header CTA Button
            </label>
          </div>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17]">Navigation Management</h2>
          <p className="text-xs text-[#7c7367] mt-0.5">
            Configure links shown in the top bar and full-screen menu overlay.
          </p>
        </div>
        <button type="button" onClick={openNew} className="admin-btn-primary">
          <Plus className="w-4 h-4" />
          Add Link
        </button>
      </div>

      <div className="space-y-3">
        {navigation.map((n, idx) => (
          <div key={n.id} className="admin-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleReorder(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded border border-[#dfd7c9] disabled:opacity-30"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(idx, 1)}
                  disabled={idx === navigation.length - 1}
                  className="p-1 rounded border border-[#dfd7c9] disabled:opacity-30"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-[#1c1a17]">{n.label}</h3>
                  <code className="text-xs px-2 py-0.5 rounded bg-[#faf8f5] border border-[#e6dfd3] text-[#6b6358]">
                    {n.href}
                  </code>
                </div>
                <p className="text-xs text-[#7c7367] mt-0.5">{n.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleVisible(n)}
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
                  n.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {n.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {n.visible ? 'Visible' : 'Hidden'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(n)
                  onDirtyChange(true)
                }}
                className="admin-btn-secondary text-xs py-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(n)}
                className="admin-btn-danger text-xs py-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

