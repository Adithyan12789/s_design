'use client'

import React, { useState } from 'react'
import {
  Save,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { CmsWebsiteSettings, ContactBotSettings } from '@/lib/cms/types'
import { DEFAULT_CONTACT_BOT_SETTINGS } from '@/lib/cms/defaults'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
    </svg>
  )
}

interface ContactBotManagerProps {
  settings: CmsWebsiteSettings
  onChange: (settings: CmsWebsiteSettings) => void
  onNotify: (msg: string, type?: 'success' | 'error') => void
  onDirtyChange: (dirty: boolean) => void
}

function isValidUrl(val: string): boolean {
  if (!val.trim()) return true
  try {
    const toTest =
      val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`
    const url = new URL(toTest)
    return Boolean(url.hostname && url.hostname.includes('.'))
  } catch {
    return false
  }
}

function isValidEmail(val: string): boolean {
  if (!val.trim()) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
}

function isValidWhatsApp(val: string): boolean {
  if (!val.trim()) return true
  if (val.startsWith('http://') || val.startsWith('https://')) {
    return isValidUrl(val)
  }
  const digits = val.replace(/[^0-9]/g, '')
  return digits.length >= 6
}

export function ContactBotManager({
  settings,
  onChange,
  onNotify,
  onDirtyChange,
}: ContactBotManagerProps) {
  const [form, setForm] = useState<ContactBotSettings>(() => {
    return {
      instagram: {
        enabled: settings.contactBot?.instagram?.enabled !== false,
        url:
          settings.contactBot?.instagram?.url ??
          settings.instagramUrl ??
          DEFAULT_CONTACT_BOT_SETTINGS.instagram.url,
      },
      whatsapp: {
        enabled: settings.contactBot?.whatsapp?.enabled !== false,
        value:
          settings.contactBot?.whatsapp?.value ??
          settings.whatsapp ??
          settings.phone ??
          DEFAULT_CONTACT_BOT_SETTINGS.whatsapp.value,
      },
      email: {
        enabled: settings.contactBot?.email?.enabled !== false,
        value:
          settings.contactBot?.email?.value ??
          settings.email ??
          DEFAULT_CONTACT_BOT_SETTINGS.email.value,
      },
      facebook: {
        enabled: settings.contactBot?.facebook?.enabled !== false,
        url:
          settings.contactBot?.facebook?.url ??
          settings.facebookUrl ??
          DEFAULT_CONTACT_BOT_SETTINGS.facebook.url,
      },
      linkedin: {
        enabled: settings.contactBot?.linkedin?.enabled !== false,
        url:
          settings.contactBot?.linkedin?.url ??
          settings.linkedinUrl ??
          DEFAULT_CONTACT_BOT_SETTINGS.linkedin.url,
      },
    }
  })

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function updateItem(
    channel: keyof ContactBotSettings,
    field: 'enabled' | 'value' | 'url',
    val: boolean | string
  ) {
    setForm((prev) => {
      const current = prev[channel]
      return {
        ...prev,
        [channel]: {
          ...current,
          [field]: val,
        },
      }
    })
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy[channel]
      return copy
    })
    onDirtyChange(true)
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}

    if (form.instagram.url && !isValidUrl(form.instagram.url)) {
      errs.instagram = 'Please enter a valid Instagram URL (e.g. https://instagram.com/sdesigns.studio)'
    }
    if (form.whatsapp.value && !isValidWhatsApp(form.whatsapp.value)) {
      errs.whatsapp = 'Please enter a valid phone number (e.g. +351 912 345 678) or a wa.me link'
    }
    if (form.email.value && !isValidEmail(form.email.value)) {
      errs.email = 'Please enter a valid email address (e.g. hello@sdesigns.studio)'
    }
    if (form.facebook.url && !isValidUrl(form.facebook.url)) {
      errs.facebook = 'Please enter a valid Facebook URL (e.g. https://facebook.com/sdesigns.studio)'
    }
    if (form.linkedin.url && !isValidUrl(form.linkedin.url)) {
      errs.linkedin = 'Please enter a valid LinkedIn URL (e.g. https://linkedin.com/company/sdesigns)'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      onNotify('Please correct the validation errors before saving.', 'error')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/contact-bot', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactBot: form }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save Contact Bot links')
      }

      const updatedBot = data.contactBot || form
      setForm(updatedBot)

      // Sync settings in parent dashboard shell
      const updatedSettings: CmsWebsiteSettings = {
        ...settings,
        contactBot: updatedBot,
        instagramUrl: updatedBot.instagram.url,
        whatsapp: updatedBot.whatsapp.value,
        email: updatedBot.email.value,
        facebookUrl: updatedBot.facebook.url,
        linkedinUrl: updatedBot.linkedin.url,
      }
      onChange(updatedSettings)
      onDirtyChange(false)
      onNotify('Contact Bot / Social Links updated successfully.')
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Determine active count for live preview
  const channels = [
    {
      key: 'instagram' as const,
      label: 'Instagram',
      icon: InstagramIcon,
      urlOrValue: form.instagram.url,
      enabled: form.instagram.enabled,
      placeholder: 'https://instagram.com/sdesigns.studio',
      helper: 'Opens official Instagram profile in a new tab.',
      type: 'url',
      valueProp: 'url' as const,
    },
    {
      key: 'whatsapp' as const,
      label: 'WhatsApp',
      icon: Phone,
      urlOrValue: form.whatsapp.value,
      enabled: form.whatsapp.enabled,
      placeholder: '+351 912 345 678 or https://wa.me/...',
      helper: 'Opens WhatsApp with a prefilled inquiry message.',
      type: 'text',
      valueProp: 'value' as const,
    },
    {
      key: 'email' as const,
      label: 'Email',
      icon: Mail,
      urlOrValue: form.email.value,
      enabled: form.email.enabled,
      placeholder: 'hello@sdesigns.studio',
      helper: 'Launches visitor email client with a prefilled inquiry.',
      type: 'email',
      valueProp: 'value' as const,
    },
    {
      key: 'facebook' as const,
      label: 'Facebook',
      icon: FacebookIcon,
      urlOrValue: form.facebook.url,
      enabled: form.facebook.enabled,
      placeholder: 'https://facebook.com/sdesigns.studio',
      helper: 'Opens Facebook page in a new tab.',
      type: 'url',
      valueProp: 'url' as const,
    },
    {
      key: 'linkedin' as const,
      label: 'LinkedIn',
      icon: LinkedinIcon,
      urlOrValue: form.linkedin.url,
      enabled: form.linkedin.enabled,
      placeholder: 'https://linkedin.com/company/sdesigns',
      helper: 'Opens LinkedIn profile in a new tab.',
      type: 'url',
      valueProp: 'url' as const,
    },
  ]

  const activeCount = channels.filter(
    (c) => c.enabled && c.urlOrValue && c.urlOrValue.trim() !== '' && c.urlOrValue !== '#top'
  ).length

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Title & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17]">Contact Bot / Social Links</h2>
          <p className="text-xs text-[#7c7367] mt-1">
            Configure the floating Contact Bot on the bottom-right of the website. Manage links,
            enable or disable individual icons, or leave a field empty to hide it.
          </p>
        </div>
        <button type="submit" disabled={saving} className="admin-btn-primary self-start sm:self-auto">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Contact Bot'}
        </button>
      </div>

      {/* Live Preview Summary Bar */}
      <div className="admin-card p-4 bg-[#f8f6f0] border-[#e2dcd2]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6b6358]">
              Live Contact Bot Icons Preview ({activeCount} of 5 visible)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {channels.map((c) => {
              const isVisible =
                c.enabled && c.urlOrValue && c.urlOrValue.trim() !== '' && c.urlOrValue !== '#top'
              const Icon = c.icon
              return (
                <div
                  key={c.key}
                  title={`${c.label}: ${isVisible ? 'Visible' : 'Hidden'}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
                    isVisible
                      ? 'bg-[#181614] text-[#f1cf9e] border border-[rgba(217,182,134,0.4)] shadow-sm'
                      : 'bg-[#ece7de] text-[#9b9487] line-through opacity-60'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="font-medium text-[11px]">{c.label}</span>
                  {isVisible ? (
                    <CheckCircle2 className="w-3 h-3 text-[#5cb85c]" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-[#9b9487]" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Five Channel Cards */}
      <div className="space-y-4">
        {channels.map((channel, idx) => {
          const Icon = channel.icon
          const hasError = Boolean(errors[channel.key])
          const isEnabled = channel.enabled
          const isFilled = Boolean(channel.urlOrValue && channel.urlOrValue.trim() !== '')

          return (
            <div
              key={channel.key}
              className={`admin-card p-5 transition-all ${
                isEnabled ? 'border-[#d9b686]/40' : 'border-[#e4ded5] bg-[#faf8f5]/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      isEnabled && isFilled
                        ? 'bg-[#181614] text-[#f1cf9e] border border-[#d9b686]/40'
                        : 'bg-[#e9e4dc] text-[#8e8578]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[#1c1a17]">
                        {idx + 1}. {channel.label}
                      </span>
                      {isEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#eef7ee] text-[#2e7d32]">
                          <Eye className="w-2.5 h-2.5" /> Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f5f2ed] text-[#7c7367]">
                          <EyeOff className="w-2.5 h-2.5" /> Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#7c7367] mt-0.5">{channel.helper}</p>
                  </div>
                </div>

                {/* Enable / Disable Toggle Switch */}
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs text-[#524b42] font-medium">Show in Bot</span>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => updateItem(channel.key, 'enabled', e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                      isEnabled ? 'bg-[#b68d54]' : 'bg-[#d5cebf]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        isEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </label>
              </div>

              {/* Input Field */}
              <div className="space-y-1">
                <label className="admin-label flex items-center justify-between">
                  <span>
                    {channel.label} {channel.key === 'whatsapp' ? 'Number or Link' : channel.key === 'email' ? 'Address' : 'URL'}
                  </span>
                  <span className="text-[10px] text-[#9b9487] font-normal">
                    Leave empty to hide icon
                  </span>
                </label>
                <input
                  type={channel.type}
                  value={channel.urlOrValue}
                  onChange={(e) => updateItem(channel.key, channel.valueProp, e.target.value)}
                  placeholder={channel.placeholder}
                  className={`admin-input ${hasError ? '!border-red-500 focus:!ring-red-400' : ''}`}
                />
                {hasError && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors[channel.key]}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={saving} className="admin-btn-primary">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Contact Bot / Social Links'}
        </button>
      </div>
    </form>
  )
}
