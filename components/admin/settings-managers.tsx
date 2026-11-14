'use client'

import { useState, useRef, DragEvent } from 'react'
import {
  Save,
  Plus,
  Trash2,
  Upload,
  Search,
  Loader2,
  ShieldCheck,
  Sliders,
  Type,
  Video as VideoIcon,
  Image as ImageIcon,
  Play,
  Film,
  Edit3,
  X,
  Check,
  Copy,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import type {
  CmsStudioInfo,
  CmsWebsiteSettings,
  CmsTypographySettings,
  CmsHomepageContent,
  CmsSeoSetting,
  CmsMediaAsset,
} from '@/lib/cms/types'
import { ImageField } from './media-picker-modal'
import { MediaField } from './media-field'

interface CommonProps {
  onPickImage: (
    cb: (url: string, alt?: string, asset?: CmsMediaAsset) => void,
    filter?: 'all' | 'image' | 'video'
  ) => void
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

        <MediaField
          label="Studio Note Media (Left Side Card)"
          description="Display either a high-resolution architectural photograph or a looping cinematic video."
          mediaType={form.studioMediaType || 'image'}
          imageUrl={form.studioImage || ''}
          videoUrl={form.studioVideoUrl || ''}
          posterUrl={form.studioPosterUrl || ''}
          onMediaTypeChange={(type) => updateField('studioMediaType', type)}
          onImageUrlChange={(url) => updateField('studioImage', url)}
          onVideoUrlChange={(url) => updateField('studioVideoUrl', url)}
          onPosterUrlChange={(url) => updateField('studioPosterUrl', url)}
          onOpenPicker={onPickImage}
        />

        <MediaField
          label="Studio Presentation / Introduction Video"
          description="Editorial studio introduction video with custom poster thumbnail."
          mediaType="video"
          videoUrl={form.introVideoUrl || ''}
          posterUrl={form.introVideoPoster || ''}
          onVideoUrlChange={(url) => updateField('introVideoUrl', url)}
          onPosterUrlChange={(url) => updateField('introVideoPoster', url)}
          onOpenPicker={onPickImage}
        />

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

function SizingControl({
  label,
  sublabel,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  unit = 'px',
  onChange,
}: {
  label: string
  sublabel?: string
  value?: string
  defaultValue: string
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (val: string) => void
}) {
  const currentVal = value || defaultValue
  const numeric = parseFloat(currentVal)
  const sliderVal = Number.isFinite(numeric) ? Math.min(Math.max(numeric, min), max) : min

  return (
    <div className="bg-[#faf8f5] p-3.5 rounded-lg border border-[#e6dfd3] flex flex-col justify-between gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <label className="text-xs font-semibold text-[#1c1a17] leading-tight block">{label}</label>
          {sublabel && (
            <span className="text-[11px] text-[#7c7367] leading-tight block mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(defaultValue)}
          className="text-[10px] text-[#b68d54] hover:underline shrink-0"
          title="Reset to default"
        >
          Reset
        </button>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderVal}
          onChange={(e) =>
            onChange(unit === '' ? String(e.target.value) : `${e.target.value}${unit}`)
          }
          className="flex-1 accent-[#b68d54] cursor-pointer h-1.5 bg-[#dfd7c9] rounded-lg"
        />
        <input
          type="text"
          value={currentVal}
          onChange={(e) => onChange(e.target.value)}
          className="admin-input text-xs w-28 text-center font-mono py-1 px-1.5"
          placeholder={defaultValue}
        />
      </div>
    </div>
  )
}

/* ===========================
   TYPOGRAPHY & SIZING MANAGER
   =========================== */
export function TypographyManager({
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

  const typo = form.typography || {}

  function updateTypo<K extends keyof CmsTypographySettings>(key: K, value: string) {
    const nextTypo = { ...form.typography, [key]: value }
    setForm((prev) => ({ ...prev, typography: nextTypo }))
    onDirtyChange(true)
  }

  function applyPreset(preset: 'default' | 'compact' | 'bold') {
    let nextTypo: CmsTypographySettings
    if (preset === 'default') {
      nextTypo = {
        ...form.typography,
        heroTitleSize: 'clamp(62px, 9.5vw, 145px)',
        heroSubtitleSize: '14px',
        studioHeadingSize: 'clamp(42px, 5.3vw, 78px)',
        studioBodySize: '14px',
        workTitleSize: 'clamp(25px, 2.4vw, 36px)',
        workDescSize: 'clamp(13px, 1.05vw, 15px)',
        workDescGap: '44px',
        workSlideGap: 'clamp(140px, 18vw, 270px)',
        workImageScale: '1',
        approachHeadingSize: 'clamp(54px, 6.2vw, 96px)',
        approachBodySize: '14px',
        servicesTitleSize: 'clamp(25px, 3.3vw, 46px)',
        reviewsHeadingSize: 'clamp(36px, 4.8vw, 68px)',
        reviewsClientHeadingSize: 'clamp(28px, 3.8vw, 54px)',
        reviewsDescSize: '14.5px',
        reviewsCenterCardScale: '1',
        contactHeadingSize: 'clamp(62px, 8vw, 118px)',
        contactBodySize: '14px',
        kickerSize: '10px',
      }
    } else if (preset === 'compact') {
      nextTypo = {
        ...form.typography,
        heroTitleSize: 'clamp(48px, 7vw, 108px)',
        heroSubtitleSize: '13px',
        studioHeadingSize: 'clamp(34px, 4.2vw, 60px)',
        studioBodySize: '13px',
        workTitleSize: 'clamp(20px, 1.9vw, 28px)',
        workDescSize: '13px',
        workDescGap: '32px',
        workSlideGap: 'clamp(36px, 4.5vw, 68px)',
        workImageScale: '0.9',
        approachHeadingSize: 'clamp(42px, 5vw, 76px)',
        approachBodySize: '13px',
        servicesTitleSize: 'clamp(22px, 2.8vw, 38px)',
        reviewsHeadingSize: 'clamp(30px, 4vw, 54px)',
        reviewsClientHeadingSize: 'clamp(24px, 3vw, 42px)',
        reviewsDescSize: '13px',
        reviewsCenterCardScale: '0.88',
        contactHeadingSize: 'clamp(50px, 6.5vw, 92px)',
        contactBodySize: '13px',
        kickerSize: '9px',
      }
    } else {
      nextTypo = {
        ...form.typography,
        heroTitleSize: 'clamp(72px, 11vw, 168px)',
        heroSubtitleSize: '16px',
        studioHeadingSize: 'clamp(50px, 6.4vw, 92px)',
        studioBodySize: '15.5px',
        workTitleSize: 'clamp(30px, 3vw, 46px)',
        workDescSize: '15.5px',
        workDescGap: '58px',
        workSlideGap: 'clamp(64px, 7.5vw, 110px)',
        workImageScale: '1.1',
        approachHeadingSize: 'clamp(64px, 7.5vw, 115px)',
        approachBodySize: '15.5px',
        servicesTitleSize: 'clamp(30px, 3.8vw, 54px)',
        reviewsHeadingSize: 'clamp(44px, 5.8vw, 84px)',
        reviewsClientHeadingSize: 'clamp(34px, 4.6vw, 64px)',
        reviewsDescSize: '16px',
        reviewsCenterCardScale: '1.12',
        contactHeadingSize: 'clamp(74px, 9.5vw, 138px)',
        contactBodySize: '15.5px',
        kickerSize: '11px',
      }
    }
    setForm((prev) => ({ ...prev, typography: nextTypo }))
    onDirtyChange(true)
    onNotify(`Applied ${preset} typography preset. Click Save to persist.`)
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
      if (!res.ok) throw new Error(data.error || 'Failed to save typography settings')
      onChange(form)
      onDirtyChange(false)
      onNotify('Typography and section sizing settings saved.')
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17]">Typography &amp; Sizing Engine</h2>
          <p className="text-xs text-[#7c7367] mt-0.5">
            Full granular control over typography, font sizes, work image scale, section gaps, and review card dimensions across the site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" disabled={saving} className="admin-btn-primary">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Typography'}
          </button>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="admin-card p-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#faf8f5] to-[#f4eee4] border border-[#dfd7c9]">
        <div>
          <span className="text-xs font-semibold text-[#1c1a17] uppercase tracking-wider">
            Quick Presets:
          </span>
          <span className="text-xs text-[#7c7367] ml-2">
            Instantly apply balanced typographic scales
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => applyPreset('compact')}
            className="px-3 py-1.5 text-xs rounded border border-[#dfd7c9] bg-white text-[#1c1a17] hover:bg-[#ede7dc] transition-colors"
          >
            Compact Minimal
          </button>
          <button
            type="button"
            onClick={() => applyPreset('default')}
            className="px-3 py-1.5 text-xs rounded border border-[#b68d54] bg-[#b68d54]/10 text-[#7a5a2d] font-medium hover:bg-[#b68d54]/20 transition-colors"
          >
            Editorial Luxury (Default)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('bold')}
            className="px-3 py-1.5 text-xs rounded border border-[#dfd7c9] bg-white text-[#1c1a17] hover:bg-[#ede7dc] transition-colors"
          >
            Large / Bold
          </button>
        </div>
      </div>

      {/* SECTION 1: GLOBAL TYPOGRAPHY & FONTS */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
          <Type className="w-4 h-4 text-[#b68d54]" />
          Global Typography &amp; Font Families
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="admin-label">Serif Display Font (Headings)</label>
            <input
              type="text"
              value={typo.display || "Georgia, 'Times New Roman', serif"}
              onChange={(e) => updateTypo('display', e.target.value)}
              className="admin-input text-xs"
              placeholder="Georgia, serif"
            />
          </div>
          <div>
            <label className="admin-label">Sans Body Font (Paragraphs)</label>
            <input
              type="text"
              value={typo.body || 'Arial, Helvetica, sans-serif'}
              onChange={(e) => updateTypo('body', e.target.value)}
              className="admin-input text-xs"
              placeholder="Arial, sans-serif"
            />
          </div>
          <div>
            <SizingControl
              label="Global Kicker / Index Size"
              sublabel="e.g. ( 01 ) Studio note, ( 03 ) Our approach"
              value={typo.kickerSize}
              defaultValue="10px"
              min={8}
              max={16}
              step={0.5}
              unit="px"
              onChange={(val) => updateTypo('kickerSize', val)}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: HERO SECTION */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#b68d54]" />
          Hero Section Typography
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SizingControl
            label="Hero Main Title Size"
            sublabel="'Spaces with quiet presence'"
            value={typo.heroTitleSize}
            defaultValue="clamp(62px, 9.5vw, 145px)"
            min={48}
            max={160}
            step={2}
            unit="px"
            onChange={(val) => updateTypo('heroTitleSize', val)}
          />
          <SizingControl
            label="Hero Subtitle / Description Size"
            sublabel="Paragraph at bottom left of hero"
            value={typo.heroSubtitleSize}
            defaultValue="14px"
            min={11}
            max={22}
            step={0.5}
            unit="px"
            onChange={(val) => updateTypo('heroSubtitleSize', val)}
          />
        </div>
      </div>

      {/* SECTION 3: ( 01 ) STUDIO NOTE */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#b68d54]" />
          ( 01 ) Studio Note Typography
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SizingControl
            label="Studio Heading Font Size"
            sublabel="Editorial title on right side"
            value={typo.studioHeadingSize}
            defaultValue="clamp(42px, 5.3vw, 78px)"
            min={32}
            max={96}
            step={2}
            unit="px"
            onChange={(val) => updateTypo('studioHeadingSize', val)}
          />
          <SizingControl
            label="Studio Description Text Size"
            sublabel="Paragraph below heading"
            value={typo.studioBodySize}
            defaultValue="14px"
            min={11}
            max={22}
            step={0.5}
            unit="px"
            onChange={(val) => updateTypo('studioBodySize', val)}
          />
        </div>
      </div>

      {/* SECTION 4: ( 02 ) SELECTED WORKS HORIZONTAL EXHIBITION */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#b68d54]" />
          ( 02 ) Selected Works Exhibition (Card Sizing &amp; Spacing)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SizingControl
            label="Work Name / Title Size"
            sublabel="Work title displayed on top of image"
            value={typo.workTitleSize}
            defaultValue="clamp(25px, 2.4vw, 36px)"
            min={18}
            max={56}
            step={1}
            unit="px"
            onChange={(val) => updateTypo('workTitleSize', val)}
          />
          <SizingControl
            label="Work Description Size"
            sublabel="Short summary displayed below image"
            value={typo.workDescSize}
            defaultValue="clamp(13px, 1.05vw, 15px)"
            min={11}
            max={22}
            step={0.5}
            unit="px"
            onChange={(val) => updateTypo('workDescSize', val)}
          />
          <SizingControl
            label="Gap: Image to Description"
            sublabel="Vertical space between image &amp; description"
            value={typo.workDescGap}
            defaultValue="clamp(32px, 4vw, 56px)"
            min={16}
            max={90}
            step={2}
            unit="px"
            onChange={(val) => updateTypo('workDescGap', val)}
          />
          <SizingControl
            label="Gap Between Works"
            sublabel="Horizontal spacing between cards"
            value={typo.workSlideGap}
            defaultValue="clamp(140px, 18vw, 270px)"
            min={20}
            max={320}
            step={4}
            unit="px"
            onChange={(val) => updateTypo('workSlideGap', val)}
          />
          <SizingControl
            label="Work Image Scale Factor"
            sublabel="Overall card multiplier (e.g. 1.0 = standard, 1.1 = larger)"
            value={typo.workImageScale}
            defaultValue="1"
            min={0.7}
            max={1.35}
            step={0.05}
            unit=""
            onChange={(val) => updateTypo('workImageScale', val)}
          />
          <SizingControl
            label="Secondary Detail Image Size"
            sublabel="Floating offset detail thumbnail width"
            value={typo.workSecondaryImageSize}
            defaultValue="clamp(165px, 16.5vw, 255px)"
            min={120}
            max={320}
            step={5}
            unit="px"
            onChange={(val) => updateTypo('workSecondaryImageSize', val)}
          />
        </div>
      </div>

      {/* SECTION 5: ( 03 ) OUR APPROACH */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#b68d54]" />
          ( 03 ) Our Approach Section
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SizingControl
            label="Approach Heading Size"
            sublabel="'Less, but better'"
            value={typo.approachHeadingSize}
            defaultValue="clamp(54px, 6.2vw, 96px)"
            min={36}
            max={110}
            step={2}
            unit="px"
            onChange={(val) => updateTypo('approachHeadingSize', val)}
          />
          <SizingControl
            label="Approach Description Size"
            sublabel="Paragraph text"
            value={typo.approachBodySize}
            defaultValue="14px"
            min={11}
            max={22}
            step={0.5}
            unit="px"
            onChange={(val) => updateTypo('approachBodySize', val)}
          />
        </div>
      </div>

      {/* SECTION 6: ( 04 ) SERVICES SECTION */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#b68d54]" />
          ( 04 ) Services Section Typography
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SizingControl
            label="Service Title Size"
            sublabel="Row titles (e.g. Residential architecture)"
            value={typo.servicesTitleSize}
            defaultValue="clamp(25px, 3.3vw, 46px)"
            min={20}
            max={56}
            step={1}
            unit="px"
            onChange={(val) => updateTypo('servicesTitleSize', val)}
          />
        </div>
      </div>

      {/* SECTION 7: ( 05 ) CLIENT REVIEWS */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#b68d54]" />
          ( 05 ) Client Reviews Section (Card &amp; Typography)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SizingControl
            label="Section Heading Size"
            sublabel="'Client reviews'"
            value={typo.reviewsHeadingSize}
            defaultValue="clamp(36px, 4.8vw, 68px)"
            min={24}
            max={80}
            step={2}
            unit="px"
            onChange={(val) => updateTypo('reviewsHeadingSize', val)}
          />
          <SizingControl
            label="Client Name Size"
            sublabel="Client name on left card"
            value={typo.reviewsClientHeadingSize}
            defaultValue="clamp(28px, 3.8vw, 54px)"
            min={18}
            max={64}
            step={2}
            unit="px"
            onChange={(val) => updateTypo('reviewsClientHeadingSize', val)}
          />
          <SizingControl
            label="Review Description Size"
            sublabel="Project summary / quote paragraph"
            value={typo.reviewsDescSize}
            defaultValue="14.5px"
            min={11}
            max={22}
            step={0.5}
            unit="px"
            onChange={(val) => updateTypo('reviewsDescSize', val)}
          />
          <SizingControl
            label="Center Video Card Scale"
            sublabel="Middle floating testimonial card size"
            value={typo.reviewsCenterCardScale}
            defaultValue="1"
            min={0.7}
            max={1.3}
            step={0.02}
            unit=""
            onChange={(val) => updateTypo('reviewsCenterCardScale', val)}
          />
        </div>
      </div>

      {/* SECTION 8: ( 06 ) CONTACT SECTION */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#b68d54]" />
          ( 06 ) Contact Section Typography
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SizingControl
            label="Contact Heading Size"
            sublabel="'Have a place in mind?'"
            value={typo.contactHeadingSize}
            defaultValue="clamp(62px, 8vw, 118px)"
            min={40}
            max={130}
            step={2}
            unit="px"
            onChange={(val) => updateTypo('contactHeadingSize', val)}
          />
          <SizingControl
            label="Contact Description &amp; Details Size"
            sublabel="Intro copy &amp; email/address lines"
            value={typo.contactBodySize}
            defaultValue="14px"
            min={11}
            max={22}
            step={0.5}
            unit="px"
            onChange={(val) => updateTypo('contactBodySize', val)}
          />
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

  function updateField<K extends keyof CmsHomepageContent>(key: K, value: any) {
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
      const updated = data.homepage || form
      setForm(updated)
      onChange(updated)
      onDirtyChange(false)
      onNotify('Homepage content and media updated successfully.')
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

      {/* HERO SECTION */}
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
          <div>
            <label className="admin-label">Studio Name Watermark</label>
            <input
              type="text"
              value={form.heroStudioName}
              onChange={(e) => updateField('heroStudioName', e.target.value)}
              className="admin-input"
              placeholder="S_DE_SIGN"
            />
          </div>
          <div>
            <label className="admin-label">Studio Subtitle</label>
            <input
              type="text"
              value={form.heroStudioSubtitle}
              onChange={(e) => updateField('heroStudioSubtitle', e.target.value)}
              className="admin-input"
              placeholder="ARCHITECTURE & SPATIAL PRACTICE"
            />
          </div>
          <div>
            <label className="admin-label">Index Counter Text</label>
            <input
              type="text"
              value={form.heroIndexText}
              onChange={(e) => updateField('heroIndexText', e.target.value)}
              className="admin-input"
              placeholder="01 / 04"
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
        <MediaField
          label="Hero Background Media"
          description="High-resolution architecture image or cinematic looping background video. Hero cinematic layout is fully preserved."
          mediaType={form.heroMediaType || 'image'}
          imageUrl={form.heroImageUrl || ''}
          videoUrl={form.heroVideoUrl || ''}
          posterUrl={form.heroPosterUrl || ''}
          onMediaTypeChange={(type) => updateField('heroMediaType', type)}
          onImageUrlChange={(url) => updateField('heroImageUrl', url)}
          onVideoUrlChange={(url) => updateField('heroVideoUrl', url)}
          onPosterUrlChange={(url) => updateField('heroPosterUrl', url)}
          onOpenPicker={onPickImage}
        />
      </div>

      {/* SELECTED WORKS ARCHIVE HEADER */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
          Selected Works Exhibition Header
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Section Kicker / Title</label>
            <input
              type="text"
              value={form.selectedWorkKicker}
              onChange={(e) => updateField('selectedWorkKicker', e.target.value)}
              className="admin-input"
              placeholder="SELECTED WORKS ARCHIVE"
            />
          </div>
          <div>
            <label className="admin-label">Subheading / Years</label>
            <input
              type="text"
              value={form.selectedWorkHeading}
              onChange={(e) => updateField('selectedWorkHeading', e.target.value)}
              className="admin-input"
              placeholder="2021 — 2024"
            />
          </div>
        </div>
      </div>

      {/* ( 03 ) OUR APPROACH */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
          ( 03 ) Our Approach Section
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="admin-label">Section Kicker</label>
            <input
              type="text"
              value={form.approachKicker}
              onChange={(e) => updateField('approachKicker', e.target.value)}
              className="admin-input"
              placeholder="Our approach"
            />
          </div>
          <div>
            <label className="admin-label">Heading Line 1</label>
            <input
              type="text"
              value={form.approachHeading1}
              onChange={(e) => updateField('approachHeading1', e.target.value)}
              className="admin-input"
              placeholder="Less, but"
            />
          </div>
          <div>
            <label className="admin-label">Heading Line 2 (Accent)</label>
            <input
              type="text"
              value={form.approachHeading2}
              onChange={(e) => updateField('approachHeading2', e.target.value)}
              className="admin-input"
              placeholder="better."
            />
          </div>
        </div>
        <div>
          <label className="admin-label">Approach Description</label>
          <textarea
            rows={3}
            value={form.approachDescription}
            onChange={(e) => updateField('approachDescription', e.target.value)}
            className="admin-textarea"
          />
        </div>
        <MediaField
          label="Approach Left-Side Media"
          description="Portrait architectural photograph or looping video for the approach showcase."
          mediaType={form.approachMediaType || 'image'}
          imageUrl={form.approachImageUrl || ''}
          videoUrl={form.approachVideoUrl || ''}
          posterUrl={form.approachPosterUrl || ''}
          onMediaTypeChange={(type) => updateField('approachMediaType', type)}
          onImageUrlChange={(url) => updateField('approachImageUrl', url)}
          onVideoUrlChange={(url) => updateField('approachVideoUrl', url)}
          onPosterUrlChange={(url) => updateField('approachPosterUrl', url)}
          onOpenPicker={onPickImage}
        />
      </div>

      {/* INITIATE A PROJECT STRIP */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
          Initiate a Project Banner
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Kicker</label>
            <input
              type="text"
              value={form.initiateKicker}
              onChange={(e) => updateField('initiateKicker', e.target.value)}
              className="admin-input"
              placeholder="( INITIATE A PROJECT )"
            />
          </div>
          <div>
            <label className="admin-label">Heading</label>
            <input
              type="text"
              value={form.initiateHeading}
              onChange={(e) => updateField('initiateHeading', e.target.value)}
              className="admin-input"
              placeholder="INITIATE A PROJECT"
            />
          </div>
          <div>
            <label className="admin-label">Subtitle</label>
            <input
              type="text"
              value={form.initiateSubtitle}
              onChange={(e) => updateField('initiateSubtitle', e.target.value)}
              className="admin-input"
              placeholder="Have a site or idea in mind?"
            />
          </div>
          <div>
            <label className="admin-label">Button Label</label>
            <input
              type="text"
              value={form.initiateCtaLabel}
              onChange={(e) => updateField('initiateCtaLabel', e.target.value)}
              className="admin-input"
              placeholder="Begin a conversation"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Button Href (e.g. #contact)</label>
            <input
              type="text"
              value={form.initiateCtaHref}
              onChange={(e) => updateField('initiateCtaHref', e.target.value)}
              className="admin-input"
              placeholder="#contact"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Description</label>
            <textarea
              rows={2}
              value={form.initiateDescription}
              onChange={(e) => updateField('initiateDescription', e.target.value)}
              className="admin-textarea"
            />
          </div>
        </div>
      </div>

      {/* SERVICES & REVIEWS SECTION HEADERS */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
          Services &amp; Reviews Headers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Services Kicker</label>
            <input
              type="text"
              value={form.servicesKicker}
              onChange={(e) => updateField('servicesKicker', e.target.value)}
              className="admin-input"
              placeholder="What we do"
            />
          </div>
          <div>
            <label className="admin-label">Services Subtitle Note</label>
            <input
              type="text"
              value={form.servicesNote}
              onChange={(e) => updateField('servicesNote', e.target.value)}
              className="admin-input"
              placeholder="From first sketch to final detail."
            />
          </div>
          <div>
            <label className="admin-label">Reviews Kicker</label>
            <input
              type="text"
              value={form.reviewsKicker}
              onChange={(e) => updateField('reviewsKicker', e.target.value)}
              className="admin-input"
              placeholder="Client reviews"
            />
          </div>
          <div>
            <label className="admin-label">Reviews Heading Line 1</label>
            <input
              type="text"
              value={form.reviewsHeading1}
              onChange={(e) => updateField('reviewsHeading1', e.target.value)}
              className="admin-input"
              placeholder="Quiet"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Reviews Heading Line 2 (Accent)</label>
            <input
              type="text"
              value={form.reviewsHeading2}
              onChange={(e) => updateField('reviewsHeading2', e.target.value)}
              className="admin-input"
              placeholder="appreciation."
            />
          </div>
        </div>
      </div>

      {/* CONTACT SECTION */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
          Contact Section
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="admin-label">Contact Kicker</label>
            <input
              type="text"
              value={form.contactKicker}
              onChange={(e) => updateField('contactKicker', e.target.value)}
              className="admin-input"
              placeholder="Begin a project"
            />
          </div>
          <div>
            <label className="admin-label">Heading Line 1</label>
            <input
              type="text"
              value={form.contactHeading1}
              onChange={(e) => updateField('contactHeading1', e.target.value)}
              className="admin-input"
              placeholder="Have a place"
            />
          </div>
          <div>
            <label className="admin-label">Heading Line 2 (Accent)</label>
            <input
              type="text"
              value={form.contactHeading2}
              onChange={(e) => updateField('contactHeading2', e.target.value)}
              className="admin-input"
              placeholder="in mind?"
            />
          </div>
          <div className="sm:col-span-3">
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
  const [filterTab, setFilterTab] = useState<'all' | 'image' | 'video'>('all')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [editingAsset, setEditingAsset] = useState<CmsMediaAsset | null>(null)
  const [replaceTarget, setReplaceTarget] = useState<CmsMediaAsset | null>(null)
  const [deleteWarning, setDeleteWarning] = useState<{
    asset: CmsMediaAsset
    usages: string[]
  } | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)
  const replaceFileRef = useRef<HTMLInputElement>(null)

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
    setUploadProgress(`Uploading ${fileList.length} file(s)...`)

    try {
      const added: CmsMediaAsset[] = []
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        setUploadProgress(`Uploading (${i + 1}/${fileList.length}): ${file.name}`)
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
          type: row.type ?? (row.mimeType?.startsWith('video/') ? 'video' : 'image'),
          publicId: row.publicId ?? null,
          posterUrl: row.posterUrl ?? null,
          duration: row.duration ?? null,
          createdAt: row.createdAt ?? row.created_at,
        })
      }
      onChange([...added, ...media])
      onNotify(`Uploaded ${added.length} media asset(s).`)
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Upload failed', 'error')
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  async function handleReplace(files: FileList | null) {
    if (!replaceTarget || !files || files.length === 0) return
    const file = files[0]
    setUploading(true)
    setUploadProgress(`Replacing ${replaceTarget.fileName}...`)

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('altText', replaceTarget.altText || file.name.replace(/\.[^.]+$/, ''))

      const res = await fetch('/api/admin/media', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Replace upload failed')
      const row = data.asset
      const replacement: CmsMediaAsset = {
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

      // Delete the previous asset now that it is replaced
      await fetch(`/api/admin/media?id=${encodeURIComponent(replaceTarget.id)}&force=true`, {
        method: 'DELETE',
      }).catch(() => null)

      onChange([replacement, ...media.filter((m) => m.id !== replaceTarget.id)])
      onNotify(`Replaced asset "${replaceTarget.fileName}".`)
      setReplaceTarget(null)
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Replace failed', 'error')
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  async function handleSaveMetadata(asset: CmsMediaAsset) {
    try {
      const res = await fetch('/api/admin/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: asset.id,
          fileName: asset.fileName,
          altText: asset.altText,
          posterUrl: asset.posterUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update metadata')
      onChange(media.map((m) => (m.id === asset.id ? { ...m, ...asset } : m)))
      onNotify('Media metadata updated.')
      setEditingAsset(null)
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Update failed', 'error')
    }
  }

  async function handleDelete(item: CmsMediaAsset, force = false) {
    const res = await fetch(
      `/api/admin/media?id=${encodeURIComponent(item.id)}${force ? '&force=true' : ''}`,
      { method: 'DELETE' }
    )
    const data = await res.json().catch(() => ({}))
    if (res.status === 409 && !force) {
      setDeleteWarning({
        asset: item,
        usages: Array.isArray(data.usages) ? data.usages : ['Unknown content'],
      })
      return
    }

    if (res.ok) {
      onChange(media.filter((m) => m.id !== item.id))
      onNotify('Media asset permanently deleted.')
      setDeleteWarning(null)
    } else {
      onNotify(data.error || 'Failed to delete asset.', 'error')
    }
  }

  function formatDuration(sec?: number | null) {
    if (!sec || isNaN(sec)) return null
    const mins = Math.floor(sec / 60)
    const remaining = Math.round(sec % 60)
    return `${mins}:${remaining.toString().padStart(2, '0')}`
  }

  function formatSize(bytes: number) {
    if (!bytes) return '0 KB'
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${Math.round(bytes / 1024)} KB`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17]">Media Library</h2>
          <p className="text-xs text-[#7c7367] mt-0.5">
            Cloudinary &amp; Atlas persistent media management with video support and safe-delete verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
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
                Upload Images / Videos
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden file input for Replace action */}
      <input
        ref={replaceFileRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
        className="hidden"
        onChange={(e) => handleReplace(e.target.files)}
      />

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files) handleUpload(e.dataTransfer.files)
        }}
        className={`p-6 border-2 border-dashed rounded-xl text-center transition-all ${
          isDragging
            ? 'border-[#b68d54] bg-[#b68d54]/10'
            : 'border-[#dfd7c9] bg-white hover:border-[#b68d54]/60'
        }`}
      >
        <Film className="w-8 h-8 mx-auto mb-2 text-[#9b9081]" />
        <p className="text-sm font-medium text-[#1c1a17]">Drag &amp; drop media files here</p>
        <p className="text-xs text-[#7c7367] mt-0.5">
          Supports JPG, PNG, WebP, AVIF, SVG, MP4, WebM, and MOV up to 100MB
        </p>
      </div>

      {uploadProgress && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#ede8de] rounded-lg border border-[#dfd7c9]">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterTab === 'all'
                ? 'bg-white text-[#161513] shadow-sm font-semibold'
                : 'text-[#6e6456] hover:text-[#161513]'
            }`}
          >
            All Media ({media.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterTab === 'image'
                ? 'bg-white text-[#161513] shadow-sm font-semibold'
                : 'text-[#6e6456] hover:text-[#161513]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Images ({media.filter((m) => !isVideoAsset(m)).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterTab === 'video'
                ? 'bg-white text-[#161513] shadow-sm font-semibold'
                : 'text-[#6e6456] hover:text-[#161513]'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            Videos ({media.filter((m) => isVideoAsset(m)).length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#8b8174] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filename or alt text..."
            className="admin-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Grid of Media Items */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 admin-card">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-[#9b9081] opacity-50" />
          <p className="text-sm font-medium text-[#1c1a17]">No media assets found</p>
          <p className="text-xs text-[#7c7367] mt-1">Upload assets above to display them in this library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const isVid = isVideoAsset(item)
            const durationLabel = formatDuration(item.duration)
            return (
              <div key={item.id} className="admin-card overflow-hidden flex flex-col group">
                <div className="aspect-[4/3] bg-[#161513] relative overflow-hidden flex items-center justify-center">
                  {isVid ? (
                    <video
                      src={item.publicUrl}
                      poster={item.posterUrl || undefined}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.publicUrl}
                      alt={item.altText || item.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  <span
                    className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${
                      isVid ? 'bg-amber-600 text-white' : 'bg-black/70 text-white'
                    }`}
                  >
                    {isVid ? (
                      <span className="flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-current" />
                        Video {durationLabel && `(${durationLabel})`}
                      </span>
                    ) : (
                      'Image'
                    )}
                  </span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between gap-2.5 bg-white">
                  <div>
                    <p className="text-xs font-semibold text-[#1c1a17] truncate" title={item.fileName}>
                      {item.fileName}
                    </p>
                    {item.altText && (
                      <p className="text-[11px] text-[#7c7367] truncate mt-0.5 italic">
                        &ldquo;{item.altText}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-[#8b8174] mt-1.5 pt-1.5 border-t border-[#f0eae1]">
                      <span>{formatSize(item.fileSize)}</span>
                      {item.width && item.height && (
                        <span>
                          {item.width}×{item.height}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#f0eae1]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(item.publicUrl)
                          onNotify('Media URL copied to clipboard.')
                        }}
                        className="p-1.5 rounded hover:bg-[#ede8de] text-[#6e6456] transition-colors"
                        title="Copy direct URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAsset(item)}
                        className="p-1.5 rounded hover:bg-[#ede8de] text-[#6e6456] transition-colors"
                        title="Edit metadata"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceTarget(item)
                          replaceFileRef.current?.click()
                        }}
                        className="p-1.5 rounded hover:bg-[#ede8de] text-[#6e6456] transition-colors"
                        title="Replace media asset"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white border border-[#dfd7c9] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e6dfd3] pb-3">
              <h3 className="admin-serif text-xl text-[#1c1a17]">Edit Media Details</h3>
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="p-1 text-[#7c7367] hover:text-[#1c1a17]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="admin-label">File Display Name</label>
                <input
                  type="text"
                  value={editingAsset.fileName}
                  onChange={(e) =>
                    setEditingAsset({ ...editingAsset, fileName: e.target.value })
                  }
                  className="admin-input text-xs"
                />
              </div>

              <div>
                <label className="admin-label">Alt Text / Description</label>
                <input
                  type="text"
                  value={editingAsset.altText}
                  onChange={(e) =>
                    setEditingAsset({ ...editingAsset, altText: e.target.value })
                  }
                  placeholder="Architectural exterior, minimalist interior..."
                  className="admin-input text-xs"
                />
              </div>

              {isVideoAsset(editingAsset) && (
                <div>
                  <label className="admin-label">Video Poster URL (Thumbnail)</label>
                  <input
                    type="text"
                    value={editingAsset.posterUrl || ''}
                    onChange={(e) =>
                      setEditingAsset({ ...editingAsset, posterUrl: e.target.value })
                    }
                    placeholder="https://res.cloudinary.com/.../poster.jpg"
                    className="admin-input text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e6dfd3]">
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="admin-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveMetadata(editingAsset)}
                className="admin-btn-primary text-xs"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Delete Warning Modal */}
      {deleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white border border-red-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="admin-serif text-xl text-[#1c1a17]">Cannot Delete in-use Media</h3>
            </div>

            <p className="text-xs text-[#6e6456]">
              <strong>&ldquo;{deleteWarning.asset.fileName}&rdquo;</strong> is currently referenced across the studio website in the following locations:
            </p>

            <ul className="text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
              {deleteWarning.usages.map((u, i) => (
                <li key={i}>{u}</li>
              ))}
            </ul>

            <p className="text-[11px] text-[#7c7367]">
              Deleting this asset now may cause broken images or missing videos on public pages.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e6dfd3]">
              <button
                type="button"
                onClick={() => setDeleteWarning(null)}
                className="admin-btn-secondary text-xs"
              >
                Keep Asset Safe
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteWarning.asset, true)}
                className="admin-btn-danger text-xs"
              >
                Force Delete Anyway
              </button>
            </div>
          </div>
        </div>
      )}
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

