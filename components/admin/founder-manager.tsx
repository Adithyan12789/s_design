'use client'

import { useState } from 'react'
import {
  Save,
  Eye,
  EyeOff,
  UserCheck,
  Quote,
  BarChart3,
  ExternalLink,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react'
import type { CmsFounderInfo, CmsMediaAsset, FounderStat } from '@/lib/cms/types'
import { ImageField } from './media-picker-modal'

interface FounderManagerProps {
  founder: CmsFounderInfo
  onChange: (val: CmsFounderInfo) => void
  onPickImage: (
    cb: (url: string, alt?: string, asset?: CmsMediaAsset) => void,
    filter?: 'all' | 'image' | 'video'
  ) => void
  onNotify: (msg: string, type?: 'success' | 'error') => void
  onDirtyChange: (dirty: boolean) => void
}

export function FounderManager({
  founder,
  onChange,
  onPickImage,
  onNotify,
  onDirtyChange,
}: FounderManagerProps) {
  const [form, setForm] = useState<CmsFounderInfo>(founder)
  const [saving, setSaving] = useState(false)

  function updateField<K extends keyof CmsFounderInfo>(key: K, value: CmsFounderInfo[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    onDirtyChange(true)
  }

  function updateStat(index: number, field: keyof FounderStat, value: string) {
    const nextStats = [...form.stats]
    if (!nextStats[index]) {
      nextStats[index] = { value: '', label: '', detail: '' }
    }
    nextStats[index] = { ...nextStats[index], [field]: value }
    updateField('stats', nextStats)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/founder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save Founder section')

      const updated = data.founder || form
      setForm(updated)
      onChange(updated)
      onDirtyChange(false)
      onNotify('Founder / About section updated and published live.')
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="admin-serif text-3xl text-[#1c1a17]">Founder / About the Founder</h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5 ${
                form.visible
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {form.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {form.visible ? 'Published (Visible)' : 'Hidden (Draft)'}
            </span>
          </div>
          <p className="text-xs text-[#7c7367] mt-1">
            Controls the (06) The Founder section on the public website, including portrait, name, designation, biography, philosophy, quote, and metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/#founder"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn-secondary text-xs"
          >
            Preview on Site
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button type="submit" disabled={saving} className="admin-btn-primary">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Visibility and Display Order */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#8f6a37]" />
          Section Display &amp; Visibility
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Section Visibility</label>
            <select
              value={form.visible ? 'true' : 'false'}
              onChange={(e) => updateField('visible', e.target.value === 'true')}
              className="admin-select"
            >
              <option value="true">Published — Display on Public Website</option>
              <option value="false">Hidden — Do Not Display (Draft)</option>
            </select>
            <p className="text-[11px] text-[#8b8174] mt-1">
              When hidden, the Founder section is completely omitted from the public homepage.
            </p>
          </div>

          <div>
            <label className="admin-label">Display Order Sequence</label>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => updateField('displayOrder', Number(e.target.value) || 6)}
              className="admin-input"
            />
            <p className="text-[11px] text-[#8b8174] mt-1">
              Sequence index relative to other sections (default is 6, positioned between Reviews and Contact).
            </p>
          </div>
        </div>
      </div>

      {/* Section Typography & Labels */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#8f6a37]" />
          Section Labels &amp; Headings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="admin-label">Section Kicker Number</label>
            <input
              type="text"
              value={form.kicker}
              onChange={(e) => updateField('kicker', e.target.value)}
              placeholder="( 06 )"
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Section Label</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => updateField('label', e.target.value)}
              placeholder="THE FOUNDER"
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Section Heading / Headline (Optional)</label>
            <input
              type="text"
              value={form.heading}
              onChange={(e) => updateField('heading', e.target.value)}
              placeholder="Behind the Vision"
              className="admin-input"
            />
          </div>
        </div>
      </div>

      {/* Founder Profile Details */}
      <div className="admin-card p-6 space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#8f6a37]" />
          Founder Profile &amp; Portrait
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Founder Name *</label>
            <input
              required
              type="text"
              value={form.founderName}
              onChange={(e) => updateField('founderName', e.target.value)}
              placeholder="e.g. Henrique Almeida"
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Professional Designation / Role *</label>
            <input
              required
              type="text"
              value={form.founderRole}
              onChange={(e) => updateField('founderRole', e.target.value)}
              placeholder="e.g. Principal Architect & Founder"
              className="admin-input"
            />
          </div>
        </div>

        {/* Founder Portrait with Media Picker */}
        <ImageField
          label="Founder Portrait Photograph"
          description="High-resolution editorial photograph displayed at compact portrait proportions on the left side."
          value={form.founderPhoto}
          onChange={(url) => updateField('founderPhoto', url)}
          onOpenPicker={() =>
            onPickImage((url) => updateField('founderPhoto', url), 'image')
          }
        />

        <div>
          <label className="admin-label">Founder Introduction / Biography *</label>
          <textarea
            required
            rows={4}
            value={form.founderBio}
            onChange={(e) => updateField('founderBio', e.target.value)}
            placeholder="Detailed founder introduction describing vision, spatial approach, and studio background..."
            className="admin-textarea"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Architectural Philosophy</label>
            <textarea
              rows={3}
              value={form.philosophy}
              onChange={(e) => updateField('philosophy', e.target.value)}
              placeholder="Studio core philosophy regarding materiality, light, and timelessness..."
              className="admin-textarea"
            />
          </div>

          <div>
            <label className="admin-label">Personal Quote (Editorial Blockquote)</label>
            <textarea
              rows={3}
              value={form.quote}
              onChange={(e) => updateField('quote', e.target.value)}
              placeholder="“Architecture is not merely about form or enclosure...”"
              className="admin-textarea"
            />
          </div>
        </div>
      </div>

      {/* Statistics Management */}
      <div className="admin-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#8f6a37]" />
              Architectural Metrics &amp; Statistics
            </h3>
            <p className="text-xs text-[#7c7367] mt-0.5">
              Three key figures highlighting practice tenure, completed commissions, and designed area.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-[#1c1a17] cursor-pointer bg-[#faf8f5] px-3 py-1.5 rounded-md border border-[#dfd7c9]">
            <input
              type="checkbox"
              checked={Boolean(form.showStats)}
              onChange={(e) => updateField('showStats', e.target.checked)}
              className="rounded text-[#8f6a37] focus:ring-[#8f6a37]"
            />
            Display Statistics on Website
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {[0, 1, 2].map((idx) => {
            const stat = form.stats?.[idx] || { value: '', label: '', detail: '' }
            return (
              <div
                key={idx}
                className="p-4 rounded-lg border border-[#e6dfd3] bg-[#faf8f5] space-y-2.5"
              >
                <div className="text-xs font-semibold text-[#8b8174]">Statistic #{idx + 1}</div>
                <div>
                  <label className="admin-label text-[10px]">Value (e.g. 14+)</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(idx, 'value', e.target.value)}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label text-[10px]">Label (e.g. Years of Experience)</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(idx, 'label', e.target.value)}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label text-[10px]">Detail (e.g. Studio Practice)</label>
                  <input
                    type="text"
                    value={stat.detail}
                    onChange={(e) => updateStat(idx, 'detail', e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Button and Background Illustration */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#8f6a37]" />
          About Button &amp; Architectural Illustration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-[#e6dfd3] bg-[#faf8f5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1c1a17]">About Us / Philosophy Button</span>
              <label className="flex items-center gap-2 text-xs text-[#1c1a17] cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form.showButton)}
                  onChange={(e) => updateField('showButton', e.target.checked)}
                  className="rounded text-[#8f6a37] focus:ring-[#8f6a37]"
                />
                Show Button
              </label>
            </div>
            <div>
              <label className="admin-label text-[10px]">Button Label</label>
              <input
                type="text"
                value={form.buttonText}
                onChange={(e) => updateField('buttonText', e.target.value)}
                placeholder="Our Philosophy"
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label text-[10px]">Button Destination URL / Anchor</label>
              <input
                type="text"
                value={form.buttonHref}
                onChange={(e) => updateField('buttonHref', e.target.value)}
                placeholder="#studio"
                className="admin-input"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg border border-[#e6dfd3] bg-[#faf8f5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1c1a17]">Background Illustration</span>
              <label className="flex items-center gap-2 text-xs text-[#1c1a17] cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form.showIllustration)}
                  onChange={(e) => updateField('showIllustration', e.target.checked)}
                  className="rounded text-[#8f6a37] focus:ring-[#8f6a37]"
                />
                Show Illustration
              </label>
            </div>
            <ImageField
              label="Illustration Graphic"
              value={form.illustrationUrl || ''}
              onChange={(url) => updateField('illustrationUrl', url)}
              onOpenPicker={() =>
                onPickImage((url) => updateField('illustrationUrl', url), 'image')
              }
            />
          </div>
        </div>
      </div>

      {/* Live Editorial UI Preview */}
      <div className="admin-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
            Live Editorial UI Preview
          </h3>
          <span className="text-[11px] text-[#8b8174]">Dark architectural theme (#141311)</span>
        </div>

        <div className="p-6 md:p-8 rounded-xl bg-[#141311] text-[#efebe2] border border-[#2a2824] shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-8 items-start">
            {/* Left Column Preview */}
            <div className="w-full max-w-[220px] space-y-3">
              <div className="text-[10px] tracking-[0.15em] uppercase text-[#d9b686]">
                {form.kicker || '( 06 )'}{' '}
                <span className="text-[#8c857b]">{form.label || 'THE FOUNDER'}</span>
              </div>

              <div className="aspect-[4/5.2] rounded-xl overflow-hidden border border-[rgba(244,239,230,0.12)] bg-[#181614] relative shadow-lg">
                {form.founderPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.founderPhoto}
                    alt={form.founderName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#7c7367]">
                    No Photo
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-serif text-base text-[#fbf9f4] font-normal leading-tight">
                  {form.founderName || 'Founder Name'}
                </h4>
                <div className="text-[10px] uppercase tracking-[0.12em] text-[#f1cf9e] font-medium mt-1">
                  {form.founderRole || 'Principal Architect & Founder'}
                </div>
              </div>
            </div>

            {/* Right Column Preview */}
            <div className="space-y-4">
              <h3 className="font-serif text-2xl text-[#fbf9f4] font-normal leading-snug">
                {form.heading || 'Behind the Vision'}
              </h3>

              <p className="text-xs text-[#dfdbd2] leading-relaxed max-w-xl">
                {form.founderBio || 'Founder introduction...'}
              </p>

              {form.quote && (
                <blockquote className="pl-3.5 border-l-2 border-[#d9b686] italic text-xs text-[#c7c2b6] max-w-lg">
                  “{form.quote}”
                </blockquote>
              )}

              {(form.showButton !== false) && (
                <div>
                  <span className="inline-block px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#fbf9f4] border border-[rgba(244,239,230,0.28)] rounded">
                    {form.buttonText || 'Our Philosophy'} ↗
                  </span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[rgba(244,239,230,0.1)] max-w-lg mt-6">
                {(form.stats && form.stats.length >= 3
                  ? form.stats.slice(0, 3)
                  : [
                      { value: '10+', label: 'Years Experience' },
                      { value: '500+', label: 'Projects Realized' },
                      { value: '99K', label: 'SQ Meters Realized' },
                    ]
                ).map((st, i) => (
                  <div
                    key={i}
                    className={i > 0 ? 'pl-3 border-l border-[rgba(244,239,230,0.1)]' : ''}
                  >
                    <div className="font-serif font-bold text-lg text-[#fbf9f4] leading-tight">
                      {st.value || '-'}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-[#8c857b] leading-tight mt-1">
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
