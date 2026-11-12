'use client'

import { useState, useRef } from 'react'
import { Save, Plus, Trash2, Upload, Search, Loader2, ShieldCheck } from 'lucide-react'
import type {
  CmsStudioInfo,
  CmsWebsiteSettings,
  CmsHomepageContent,
  CmsSeoSetting,
  CmsMediaAsset,
} from '@/lib/cms/types'
import { ImageField } from './media-picker-modal'

interface CommonProps {
  onPickImage: (cb: (url: string, alt?: string) => void) => void
  onNotify: (msg: string, type?: 'success' | 'error') => void
  onDirtyChange: (dirty: boolean) => void
}

/* ===========================
   ABOUT STUDIO MANAGER
   =========================== */
export function StudioManager({
  studioInfo,
  onChange,
  onPickImage,
  onNotify,
  onDirtyChange,
}: CommonProps & {
  studioInfo: CmsStudioInfo
  onChange: (val: CmsStudioInfo) => void
}) {
  const [form, setForm] = useState<CmsStudioInfo>(studioInfo)
  const [saving, setSaving] = useState(false)

  function updateField<K extends keyof CmsStudioInfo>(key: K, value: CmsStudioInfo[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    onDirtyChange(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/studio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save studio info')
      onChange(form)
      onDirtyChange(false)
      onNotify('About Studio information updated.')
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17]">About Studio</h2>
          <p className="text-xs text-[#7c7367] mt-0.5">
            Controls the Studio Note section, philosophy, vision, team members, and custom blocks.
          </p>
        </div>
        <button type="submit" disabled={saving} className="admin-btn-primary">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Studio Info'}
        </button>
      </div>

      <div className="admin-card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="admin-label">Section Kicker</label>
            <input
              type="text"
              value={form.kicker}
              onChange={(e) => updateField('kicker', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Heading Line 1</label>
            <input
              type="text"
              value={form.heading}
              onChange={(e) => updateField('heading', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Accent Heading Line 2</label>
            <input
              type="text"
              value={form.accentHeading}
              onChange={(e) => updateField('accentHeading', e.target.value)}
              className="admin-input"
            />
          </div>
        </div>

        <div>
          <label className="admin-label">Studio Note / Intro Quote</label>
          <textarea
            rows={2}
            value={form.introText}
            onChange={(e) => updateField('introText', e.target.value)}
            className="admin-textarea"
          />
        </div>

        <div>
          <label className="admin-label">Studio Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="admin-textarea"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Philosophy</label>
            <textarea
              rows={3}
              value={form.philosophy}
              onChange={(e) => updateField('philosophy', e.target.value)}
              className="admin-textarea"
            />
          </div>
          <div>
            <label className="admin-label">Vision</label>
            <textarea
              rows={3}
              value={form.vision}
              onChange={(e) => updateField('vision', e.target.value)}
              className="admin-textarea"
            />
          </div>
          <div>
            <label className="admin-label">Mission</label>
            <textarea
              rows={3}
              value={form.mission}
              onChange={(e) => updateField('mission', e.target.value)}
              className="admin-textarea"
            />
          </div>
          <div>
            <label className="admin-label">Studio History</label>
            <textarea
              rows={3}
              value={form.history}
              onChange={(e) => updateField('history', e.target.value)}
              className="admin-textarea"
            />
          </div>
        </div>
      </div>

      <div className="admin-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
            Team Members ({form.teamMembers.length})
          </h3>
          <button
            type="button"
            onClick={() =>
              updateField('teamMembers', [
                ...form.teamMembers,
                { id: `tm-${Date.now()}`, name: '', role: '', bio: '', photoUrl: '' },
              ])
            }
            className="admin-btn-secondary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Team Member
          </button>
        </div>

        {form.teamMembers.map((member, idx) => (
          <div key={member.id} className="p-4 rounded-lg border border-[#e6dfd3] bg-[#faf8f5] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Full Name"
                value={member.name}
                onChange={(e) => {
                  const next = [...form.teamMembers]
                  next[idx] = { ...member, name: e.target.value }
                  updateField('teamMembers', next)
                }}
                className="admin-input"
              />
              <input
                type="text"
                placeholder="Role / Title"
                value={member.role}
                onChange={(e) => {
                  const next = [...form.teamMembers]
                  next[idx] = { ...member, role: e.target.value }
                  updateField('teamMembers', next)
                }}
                className="admin-input"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Short bio"
              value={member.bio}
              onChange={(e) => {
                const next = [...form.teamMembers]
                next[idx] = { ...member, bio: e.target.value }
                updateField('teamMembers', next)
              }}
              className="admin-textarea"
            />
            <div className="flex items-end justify-between gap-3">
              <div className="flex-1">
                <ImageField
                  label="Member Photo"
                  value={member.photoUrl}
                  onChange={(url) => {
                    const next = [...form.teamMembers]
                    next[idx] = { ...member, photoUrl: url }
                    updateField('teamMembers', next)
                  }}
                  onOpenPicker={() =>
                    onPickImage((url) => {
                      const next = [...form.teamMembers]
                      next[idx] = { ...member, photoUrl: url }
                      updateField('teamMembers', next)
                    })
                  }
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  updateField(
                    'teamMembers',
                    form.teamMembers.filter((_, i) => i !== idx)
                  )
                }
                className="admin-btn-danger text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </form>
  )
}

/* ===========================
   WEBSITE BRANDING MANAGER
   =========================== */
export function BrandingManager({
  settings,
  onChange,
  onPickImage,
  onNotify,
  onDirtyChange,
}: CommonProps & {
  settings: CmsWebsiteSettings
  onChange: (val: CmsWebsiteSettings) => void
}) {
  const [form, setForm] = useState<CmsWebsiteSettings>(settings)
  const [saving, setSaving] = useState(false)

  function updateField<K extends keyof CmsWebsiteSettings>(key: K, value: CmsWebsiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    onDirtyChange(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save branding')
      onChange(form)
      onDirtyChange(false)
      onNotify('Website branding & logo settings saved.')
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17]">Website Branding</h2>
          <p className="text-xs text-[#7c7367] mt-0.5">
            Update studio name, logos, favicon, and theme palette across the public site.
          </p>
        </div>
        <button type="submit" disabled={saving} className="admin-btn-primary">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Branding'}
        </button>
      </div>

      <div className="admin-card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="admin-label">Studio Name</label>
            <input
              type="text"
              value={form.studioName}
              onChange={(e) => updateField('studioName', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Studio Subtitle</label>
            <input
              type="text"
              value={form.studioSubtitle}
              onChange={(e) => updateField('studioSubtitle', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              className="admin-input"
            />
          </div>
        </div>
      </div>

      <div className="admin-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageField
          label="Light Logo (Used on Dark Backgrounds)"
          value={form.lightLogoUrl}
          onChange={(url) => updateField('lightLogoUrl', url)}
          onOpenPicker={() => onPickImage((url) => updateField('lightLogoUrl', url))}
        />
        <ImageField
          label="Dark Logo (Used on Light Backgrounds)"
          value={form.darkLogoUrl}
          onChange={(url) => updateField('darkLogoUrl', url)}
          onOpenPicker={() => onPickImage((url) => updateField('darkLogoUrl', url))}
        />
        <ImageField
          label="Main Studio Logo"
          value={form.mainLogoUrl}
          onChange={(url) => updateField('mainLogoUrl', url)}
          onOpenPicker={() => onPickImage((url) => updateField('mainLogoUrl', url))}
        />
        <ImageField
          label="Favicon"
          value={form.faviconUrl}
          onChange={(url) => updateField('faviconUrl', url)}
          onOpenPicker={() => onPickImage((url) => updateField('faviconUrl', url))}
        />
      </div>

      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
          Brand Colors &amp; Typography
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {(['ivory', 'paper', 'ink', 'bronze', 'bronzeLight'] as const).map((key) => (
            <div key={key}>
              <label className="admin-label">{key}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.brandColors[key]}
                  onChange={(e) =>
                    updateField('brandColors', { ...form.brandColors, [key]: e.target.value })
                  }
                  className="w-10 h-9 rounded border border-[#dfd7c9] cursor-pointer"
                />
                <input
                  type="text"
                  value={form.brandColors[key]}
                  onChange={(e) =>
                    updateField('brandColors', { ...form.brandColors, [key]: e.target.value })
                  }
                  className="admin-input text-xs font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}

/* ===========================
   CONTACT INFORMATION MANAGER
   =========================== */
export function ContactManager({
  settings,
  onChange,
  onNotify,
  onDirtyChange,
}: Omit<CommonProps, 'onPickImage'> & {
  settings: CmsWebsiteSettings
  onChange: (val: CmsWebsiteSettings) => void
}) {
  const [form, setForm] = useState<CmsWebsiteSettings>(settings)
  const [saving, setSaving] = useState(false)

  function updateField<K extends keyof CmsWebsiteSettings>(key: K, value: CmsWebsiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    onDirtyChange(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save contact settings')
      onChange(form)
      onDirtyChange(false)
      onNotify('Contact & social links updated.')
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17]">Contact Information</h2>
          <p className="text-xs text-[#7c7367] mt-0.5">
            Synced across the footer, menu overlay, and project inquiry section.
          </p>
        </div>
        <button type="submit" disabled={saving} className="admin-btn-primary">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Contact Info'}
        </button>
      </div>

      <div className="admin-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Studio Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Phone Number</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">WhatsApp</label>
          <input
            type="text"
            value={form.whatsapp}
            onChange={(e) => updateField('whatsapp', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Business Hours</label>
          <input
            type="text"
            value={form.businessHours}
            onChange={(e) => updateField('businessHours', e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Office Address</label>
          <input
            type="text"
            value={form.officeAddress}
            onChange={(e) => updateField('officeAddress', e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Google Maps Link</label>
          <input
            type="text"
            value={form.mapsUrl}
            onChange={(e) => updateField('mapsUrl', e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      <div className="admin-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Instagram URL</label>
          <input
            type="text"
            value={form.instagramUrl}
            onChange={(e) => updateField('instagramUrl', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">LinkedIn URL</label>
          <input
            type="text"
            value={form.linkedinUrl}
            onChange={(e) => updateField('linkedinUrl', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Pinterest URL</label>
          <input
            type="text"
            value={form.pinterestUrl}
            onChange={(e) => updateField('pinterestUrl', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Facebook URL</label>
          <input
            type="text"
            value={form.facebookUrl}
            onChange={(e) => updateField('facebookUrl', e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Footer Copyright Text</label>
          <input
            type="text"
            value={form.footerCopyright}
            onChange={(e) => updateField('footerCopyright', e.target.value)}
            className="admin-input"
          />
        </div>
      </div>
    </form>
  )
}

/* ===========================
   HOMEPAGE CONTENT MANAGER
   =========================== */
export function HomepageManager({
  homepage,
  onChange,
  onPickImage,
  onNotify,
  onDirtyChange,
}: CommonProps & {
  homepage: CmsHomepageContent
  onChange: (val: CmsHomepageContent) => void
}) {
  const [form, setForm] = useState<CmsHomepageContent>(homepage)
  const [saving, setSaving] = useState(false)

  function updateField<K extends keyof CmsHomepageContent>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    onDirtyChange(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save homepage content')
      onChange(form)
      onDirtyChange(false)
      onNotify('Homepage copy and images updated.')
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17]">Homepage Content</h2>
          <p className="text-xs text-[#7c7367] mt-0.5">
            Edit hero headlines, banners, Selected Work kickers, Initiate CTA, and section copy.
          </p>
        </div>
        <button type="submit" disabled={saving} className="admin-btn-primary">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Homepage'}
        </button>
      </div>

      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
          Hero Section
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="admin-label">Eyebrow</label>
            <input
              type="text"
              value={form.heroEyebrow}
              onChange={(e) => updateField('heroEyebrow', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Hero Title Line 1</label>
            <input
              type="text"
              value={form.heroTitleLine1}
              onChange={(e) => updateField('heroTitleLine1', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Hero Title Line 2 (Accent)</label>
            <input
              type="text"
              value={form.heroTitleLine2}
              onChange={(e) => updateField('heroTitleLine2', e.target.value)}
              className="admin-input"
            />
          </div>
        </div>
        <div>
          <label className="admin-label">Hero Description</label>
          <textarea
            rows={2}
            value={form.heroDescription}
            onChange={(e) => updateField('heroDescription', e.target.value)}
            className="admin-textarea"
          />
        </div>
        <ImageField
          label="Hero Background Image"
          value={form.heroImageUrl}
          onChange={(url) => updateField('heroImageUrl', url)}
          onOpenPicker={() => onPickImage((url) => updateField('heroImageUrl', url))}
        />
      </div>

      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
          Initiate a Project CTA &amp; Contact Section
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Initiate Heading</label>
            <input
              type="text"
              value={form.initiateHeading}
              onChange={(e) => updateField('initiateHeading', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Initiate Button Label</label>
            <input
              type="text"
              value={form.initiateCtaLabel}
              onChange={(e) => updateField('initiateCtaLabel', e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Initiate Description</label>
            <textarea
              rows={2}
              value={form.initiateDescription}
              onChange={(e) => updateField('initiateDescription', e.target.value)}
              className="admin-textarea"
            />
          </div>
          <div>
            <label className="admin-label">Contact Heading Line 1</label>
            <input
              type="text"
              value={form.contactHeading1}
              onChange={(e) => updateField('contactHeading1', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Contact Heading Line 2</label>
            <input
              type="text"
              value={form.contactHeading2}
              onChange={(e) => updateField('contactHeading2', e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Contact Description</label>
            <textarea
              rows={2}
              value={form.contactDescription}
              onChange={(e) => updateField('contactDescription', e.target.value)}
              className="admin-textarea"
            />
          </div>
        </div>
      </div>

      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
          Approach &amp; Section Headings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Selected Work Kicker</label>
            <input
              type="text"
              value={form.selectedWorkKicker}
              onChange={(e) => updateField('selectedWorkKicker', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Services Kicker</label>
            <input
              type="text"
              value={form.servicesKicker}
              onChange={(e) => updateField('servicesKicker', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Reviews Kicker</label>
            <input
              type="text"
              value={form.reviewsKicker}
              onChange={(e) => updateField('reviewsKicker', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Reviews Heading 1</label>
            <input
              type="text"
              value={form.reviewsHeading1}
              onChange={(e) => updateField('reviewsHeading1', e.target.value)}
              className="admin-input"
            />
          </div>
        </div>
        <ImageField
          label="Approach Section Image"
          value={form.approachImageUrl}
          onChange={(url) => updateField('approachImageUrl', url)}
          onOpenPicker={() => onPickImage((url) => updateField('approachImageUrl', url))}
        />
      </div>
    </form>
  )
}

/* ===========================
   SEO SETTINGS MANAGER
   =========================== */
export function SeoManager({
  seoList,
  onChange,
  onPickImage,
  onNotify,
  onDirtyChange,
}: CommonProps & {
  seoList: CmsSeoSetting[]
  onChange: (list: CmsSeoSetting[]) => void
}) {
  const [selectedKey, setSelectedKey] = useState(seoList[0]?.pageKey || 'home')
  const current =
    seoList.find((s) => s.pageKey === selectedKey) ||
    ({
      pageKey: selectedKey,
      seoTitle: '',
      metaDescription: '',
      ogImage: '',
      ogTitle: '',
      ogDescription: '',
      canonicalUrl: '',
    } as CmsSeoSetting)

  const [form, setForm] = useState<CmsSeoSetting>(current)
  const [saving, setSaving] = useState(false)

  function selectPage(key: string) {
    setSelectedKey(key)
    const found = seoList.find((s) => s.pageKey === key)
    setForm(
      found || {
        pageKey: key,
        seoTitle: '',
        metaDescription: '',
        ogImage: '',
        ogTitle: '',
        ogDescription: '',
        canonicalUrl: '',
      }
    )
    onDirtyChange(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save SEO settings')

      const exists = seoList.some((s) => s.pageKey === form.pageKey)
      const next = exists
        ? seoList.map((s) => (s.pageKey === form.pageKey ? form : s))
        : [...seoList, form]
      onChange(next)
      onDirtyChange(false)
      onNotify(`SEO settings for "${form.pageKey}" saved.`)
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17]">SEO Settings</h2>
          <p className="text-xs text-[#7c7367] mt-0.5">
            Manage metadata, Open Graph social previews, and canonical URLs per page.
          </p>
        </div>
        <button type="submit" disabled={saving} className="admin-btn-primary">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save SEO'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['home', 'work', 'services', 'about', 'contact'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => selectPage(key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize border ${
              selectedKey === key
                ? 'bg-[#161513] text-[#faf8f5] border-[#161513]'
                : 'bg-white text-[#595248] border-[#dfd7c9]'
            }`}
          >
            {key} Page
          </button>
        ))}
      </div>

      <div className="admin-card p-6 space-y-4">
        <div>
          <label className="admin-label">SEO Title</label>
          <input
            type="text"
            value={form.seoTitle}
            onChange={(e) => {
              setForm({ ...form, seoTitle: e.target.value })
              onDirtyChange(true)
            }}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Meta Description</label>
          <textarea
            rows={3}
            value={form.metaDescription}
            onChange={(e) => {
              setForm({ ...form, metaDescription: e.target.value })
              onDirtyChange(true)
            }}
            className="admin-textarea"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Open Graph Title</label>
            <input
              type="text"
              value={form.ogTitle}
              onChange={(e) => {
                setForm({ ...form, ogTitle: e.target.value })
                onDirtyChange(true)
              }}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Canonical URL</label>
            <input
              type="text"
              value={form.canonicalUrl}
              onChange={(e) => {
                setForm({ ...form, canonicalUrl: e.target.value })
                onDirtyChange(true)
              }}
              className="admin-input"
            />
          </div>
        </div>
        <ImageField
          label="Open Graph Share Image"
          value={form.ogImage}
          onChange={(url) => {
            setForm({ ...form, ogImage: url })
            onDirtyChange(true)
          }}
          onOpenPicker={() =>
            onPickImage((url) => {
              setForm((prev) => ({ ...prev, ogImage: url }))
              onDirtyChange(true)
            })
          }
        />
      </div>
    </form>
  )
}

/* ===========================
   MEDIA LIBRARY MANAGER
   =========================== */
export function MediaLibraryManager({
  media,
  onChange,
  onNotify,
}: {
  media: CmsMediaAsset[]
  onChange: (list: CmsMediaAsset[]) => void
  onNotify: (msg: string, type?: 'success' | 'error') => void
}) {
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = media.filter((m) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return m.fileName.toLowerCase().includes(q) || m.altText.toLowerCase().includes(q)
  })

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const added: CmsMediaAsset[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('altText', file.name.replace(/\.[^.]+$/, ''))
        const res = await fetch('/api/admin/media', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        const row = data.asset
        added.push({
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
        })
      }
      onChange([...added, ...media])
      onNotify(`Uploaded ${added.length} image(s) via Multer.`)
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(item: CmsMediaAsset) {
    const res = await fetch(`/api/admin/media?id=${encodeURIComponent(item.id)}`, {
      method: 'DELETE',
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 409) {
      const proceed = confirm(
        `This image is currently used in:\n- ${(data.usages || []).join('\n- ')}\n\nDelete anyway?`
      )
      if (!proceed) return
      const forced = await fetch(`/api/admin/media?id=${encodeURIComponent(item.id)}&force=true`, {
        method: 'DELETE',
      })
      if (forced.ok) {
        onChange(media.filter((m) => m.id !== item.id))
        onNotify('Media asset deleted.')
      }
      return
    }
    if (res.ok) {
      onChange(media.filter((m) => m.id !== item.id))
      onNotify('Media asset deleted.')
    } else {
      onNotify(data.error || 'Failed to delete asset.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17]">Media Library</h2>
          <p className="text-xs text-[#7c7367] mt-0.5">
            Persistent Supabase Storage uploads with safe-delete reference checks.
          </p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="admin-btn-primary"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Images
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#8b8174] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search media..."
          className="admin-input pl-9"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="admin-card overflow-hidden flex flex-col">
            <div className="aspect-[4/3] bg-[#ede8de]">
              <img
                src={item.publicUrl}
                alt={item.altText || item.fileName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-[#1c1a17] truncate">{item.fileName}</p>
                <p className="text-[11px] text-[#7c7367]">
                  {(item.fileSize / 1024).toFixed(0)} KB
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(item.publicUrl)
                    onNotify('Image URL copied to clipboard.')
                  }}
                  className="text-[11px] text-[#8f6a37] hover:underline"
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===========================
   ADMIN ACCOUNT SETTINGS
   =========================== */
export function AccountSettingsManager({
  actor,
}: {
  actor: { email: string; fullName: string; role: string }
  onNotify?: (msg: string, type?: 'success' | 'error') => void
}) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="admin-serif text-3xl text-[#1c1a17]">Admin Security Settings</h2>
        <p className="text-xs text-[#7c7367] mt-0.5">
          Secret-code session status and environment configuration details.
        </p>
      </div>

      <div className="admin-card p-6 space-y-5">
        <div className="flex items-center gap-2.5 text-xs text-[#595248] bg-[#faf8f5] border border-[#e6dfd3] rounded-lg px-3.5 py-2.5">
          <ShieldCheck className="w-4 h-4 text-[#b68d54]" />
          <span>
            Authenticated as <strong>{actor.fullName}</strong> ({actor.role}) via 6-digit access code
          </span>
        </div>

        <div className="space-y-2 text-sm text-[#4a443c]">
          <p className="font-medium text-[#1c1a17]">Active Security Protections</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[#6b6358]">
            <li>Server-side verification against <code>ADMIN_ACCESS_CODE</code> (constant-time SHA-256 comparison).</li>
            <li>HMAC-SHA256 signed, HTTP-only, SameSite=Lax session cookie (<code>sd_admin_session</code>).</li>
            <li>Brute-force rate limiting (5 failed attempts triggers a 15-minute temporary lockout).</li>
            <li>Same-origin CSRF checks on all protected <code>/api/admin/*</code> mutations.</li>
          </ul>
        </div>

        <div className="rounded-lg border border-[#e6dfd3] bg-[#faf8f5] p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6b6358]">
            How to Rotate Your 6-Digit Access Code
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-xs text-[#595248]">
            <li>Open your Vercel Project &rarr; <strong>Settings &rarr; Environment Variables</strong> (or <code>.env.local</code> locally).</li>
            <li>Update <code>ADMIN_ACCESS_CODE</code> to your new 6-digit numeric secret.</li>
            <li>Optionally rotate <code>ADMIN_SESSION_SECRET</code> to invalidate all existing sessions immediately.</li>
            <li>Redeploy (or restart the local server) for the new code to take effect.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

