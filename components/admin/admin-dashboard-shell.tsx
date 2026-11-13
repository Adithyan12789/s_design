'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Compass,
  Info,
  MessageSquareQuote,
  Phone,
  Palette,
  Home,
  Menu as MenuIcon,
  Search,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Type,
  Sliders,
} from 'lucide-react'
import type {
  CmsProject,
  CmsService,
  CmsStudioInfo,
  CmsTestimonial,
  CmsWebsiteSettings,
  CmsHomepageContent,
  CmsNavItem,
  CmsMediaAsset,
  CmsSeoSetting,
  CmsActivityLog,
} from '@/lib/cms/types'
import { MediaPickerModal } from './media-picker-modal'
import { ProjectsManager } from './projects-manager'
import { ServicesManager, TestimonialsManager, NavigationManager } from './list-managers'
import {
  StudioManager,
  BrandingManager,
  TypographyManager,
  ContactManager,
  HomepageManager,
  SeoManager,
  MediaLibraryManager,
  AccountSettingsManager,
} from './settings-managers'

type SectionId =
  | 'dashboard'
  | 'typography'
  | 'projects'
  | 'services'
  | 'studio'
  | 'testimonials'
  | 'contact'
  | 'branding'
  | 'homepage'
  | 'navigation'
  | 'seo'
  | 'media'
  | 'settings'
  | 'contact'
  | 'branding'
  | 'homepage'
  | 'navigation'
  | 'seo'
  | 'media'
  | 'settings'

interface AdminDashboardShellProps {
  actor: {
    id: string
    email: string
    fullName: string
    role: string
  }
  initialData: {
    projects: CmsProject[]
    services: CmsService[]
    studioInfo: CmsStudioInfo
    testimonials: CmsTestimonial[]
    settings: CmsWebsiteSettings
    homepage: CmsHomepageContent
    navigation: CmsNavItem[]
    media: CmsMediaAsset[]
    seo: CmsSeoSetting[]
    activity: CmsActivityLog[]
  }
}

const NAV_ITEMS: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'typography', label: 'Typography & Sizing', icon: Type },
  { id: 'projects', label: 'Projects', icon: Building2 },
  { id: 'services', label: 'Services', icon: Compass },
  { id: 'studio', label: 'About Studio', icon: Info },
  { id: 'testimonials', label: 'Testimonials & Reviews', icon: MessageSquareQuote },
  { id: 'contact', label: 'Contact Information', icon: Phone },
  { id: 'branding', label: 'Website Branding', icon: Palette },
  { id: 'homepage', label: 'Homepage Content', icon: Home },
  { id: 'navigation', label: 'Navigation Management', icon: MenuIcon },
  { id: 'seo', label: 'SEO Settings', icon: Search },
  { id: 'media', label: 'Media Library', icon: ImageIcon },
  { id: 'settings', label: 'Admin Settings', icon: Settings },
]

export function AdminDashboardShell({ actor, initialData }: AdminDashboardShellProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SectionId>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const [projects, setProjects] = useState<CmsProject[]>(initialData.projects)
  const [services, setServices] = useState<CmsService[]>(initialData.services)
  const [studioInfo, setStudioInfo] = useState<CmsStudioInfo>(initialData.studioInfo)
  const [testimonials, setTestimonials] = useState<CmsTestimonial[]>(initialData.testimonials)
  const [settings, setSettings] = useState<CmsWebsiteSettings>(initialData.settings)
  const [homepage, setHomepage] = useState<CmsHomepageContent>(initialData.homepage)
  const [navigation, setNavigation] = useState<CmsNavItem[]>(initialData.navigation)
  const [media, setMedia] = useState<CmsMediaAsset[]>(initialData.media)
  const [seo, setSeo] = useState<CmsSeoSetting[]>(initialData.seo)
  const [activity] = useState<CmsActivityLog[]>(initialData.activity)

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [pickerState, setPickerState] = useState<{
    open: boolean
    cb: ((url: string, alt?: string, asset?: CmsMediaAsset) => void) | null
    defaultFilter?: 'all' | 'image' | 'video'
  }>({ open: false, cb: null, defaultFilter: 'all' })

  function notify(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => {
      setToast((prev) => (prev?.msg === msg ? null : prev))
    }, 4000)
  }

  function handleTabSwitch(nextTab: SectionId) {
    if (nextTab === activeTab) {
      setMobileOpen(false)
      return
    }
    if (isDirty) {
      const ok = confirm('You have unsaved changes in this section. Leave without saving?')
      if (!ok) return
    }
    setIsDirty(false)
    setActiveTab(nextTab)
    setMobileOpen(false)
  }

  function openMediaPicker(
    cb: (url: string, alt?: string, asset?: CmsMediaAsset) => void,
    filter: 'all' | 'image' | 'video' = 'all'
  ) {
    setPickerState({ open: true, cb, defaultFilter: filter })
  }

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const publishedProjects = projects.filter((p) => p.status === 'published').length

  return (
    <div className="min-h-screen flex bg-[#f6f3ed]">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Dark Charcoal Sidebar */}
      <aside
        className={`admin-sidebar fixed lg:sticky top-0 left-0 z-50 h-screen w-[264px] shrink-0 flex flex-col transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-6 py-5 border-b border-[#b68d54]/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#d9b686] font-semibold">
              {settings.studioName}
            </p>
            <h1 className="admin-serif text-xl text-[#faf8f5] mt-0.5">Studio CMS</h1>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-[#e7e1d6]/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabSwitch(item.id)}
                className={`admin-nav-btn ${active ? 'is-active' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#b68d54]/20 space-y-2">
          <div className="px-2 pb-1">
            <p className="text-xs font-medium text-[#faf8f5] truncate">
              {actor.fullName || 'Administrator'}
            </p>
            <p className="text-[11px] text-[#e7e1d6]/60 truncate">{actor.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="admin-nav-btn text-red-300/90 hover:text-red-200 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-[#faf8f5]/95 backdrop-blur border-b border-[#e6dfd3] px-5 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#dfd7c9] bg-white text-[#1c1a17]"
              aria-label="Open menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <span className="text-xs uppercase tracking-[0.18em] text-[#7c7367] font-medium">
              {NAV_ITEMS.find((i) => i.id === activeTab)?.label}
            </span>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn-secondary text-xs py-1.5"
          >
            View Live Website
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </header>

        <main className="flex-1 p-5 lg:p-8 max-w-6xl w-full mx-auto">
          {toast && (
            <div
              className={`mb-6 flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm ${
                toast.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              )}
              <span>{toast.msg}</span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h2 className="admin-serif text-4xl text-[#1c1a17] font-normal">
                  Welcome back, {actor.fullName || 'Studio Admin'}
                </h2>
                <p className="text-sm text-[#6b6358] mt-1">
                  Manage portfolio works, editorial copy, branding, and media in real time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="admin-card p-5">
                  <p className="text-xs uppercase tracking-wider text-[#7c7367]">Total Projects</p>
                  <p className="admin-serif text-4xl text-[#1c1a17] mt-2">{projects.length}</p>
                  <p className="text-xs text-[#8f6a37] mt-1">{publishedProjects} published live</p>
                </div>
                <div className="admin-card p-5">
                  <p className="text-xs uppercase tracking-wider text-[#7c7367]">Services</p>
                  <p className="admin-serif text-4xl text-[#1c1a17] mt-2">{services.length}</p>
                  <p className="text-xs text-[#7c7367] mt-1">Studio disciplines</p>
                </div>
                <div className="admin-card p-5">
                  <p className="text-xs uppercase tracking-wider text-[#7c7367]">Client Reviews</p>
                  <p className="admin-serif text-4xl text-[#1c1a17] mt-2">{testimonials.length}</p>
                  <p className="text-xs text-[#7c7367] mt-1">Cinematic testimonials</p>
                </div>
                <div className="admin-card p-5">
                  <p className="text-xs uppercase tracking-wider text-[#7c7367]">Media Assets</p>
                  <p className="admin-serif text-4xl text-[#1c1a17] mt-2">{media.length}</p>
                  <p className="text-xs text-[#7c7367] mt-1">Uploaded via Multer</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="admin-card p-6 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
                    Quick Actions
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('projects')}
                      className="admin-btn-primary justify-start"
                    >
                      <Building2 className="w-4 h-4" />
                      Manage Projects Portfolio
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('homepage')}
                      className="admin-btn-secondary justify-start"
                    >
                      <Home className="w-4 h-4" />
                      Edit Homepage Headlines
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('branding')}
                      className="admin-btn-secondary justify-start"
                    >
                      <Palette className="w-4 h-4" />
                      Update Logos &amp; Branding
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('media')}
                      className="admin-btn-secondary justify-start"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Open Media Library
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 admin-card p-6 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6b6358]">
                    Recent CMS Activity
                  </h3>
                  {activity.length === 0 ? (
                    <p className="text-sm text-[#7c7367] py-6 text-center">
                      No administrative changes recorded yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#efe9de]">
                      {activity.slice(0, 8).map((log) => (
                        <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                          <div className="text-sm text-[#1c1a17]">
                            <span className="font-medium capitalize">{log.action}</span>{' '}
                            <span className="text-[#6b6358]">{log.entityType}</span>{' '}
                            {log.entityLabel && (
                              <strong className="font-medium">&ldquo;{log.entityLabel}&rdquo;</strong>
                            )}
                          </div>
                          <span className="text-xs text-[#8b8174] flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <TypographyManager
              settings={settings}
              onChange={setSettings}
              onNotify={notify}
              onDirtyChange={setIsDirty}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsManager
              projects={projects}
              onChange={setProjects}
              onPickImage={openMediaPicker}
              onNotify={notify}
              onDirtyChange={setIsDirty}
            />
          )}

          {activeTab === 'services' && (
            <ServicesManager
              services={services}
              onChange={setServices}
              onPickImage={openMediaPicker}
              onNotify={notify}
              onDirtyChange={setIsDirty}
            />
          )}

          {activeTab === 'studio' && (
            <StudioManager
              studioInfo={studioInfo}
              onChange={setStudioInfo}
              onPickImage={openMediaPicker}
              onNotify={notify}
              onDirtyChange={setIsDirty}
            />
          )}

          {activeTab === 'testimonials' && (
            <TestimonialsManager
              testimonials={testimonials}
              projects={projects}
              onChange={setTestimonials}
              onPickImage={openMediaPicker}
              onNotify={notify}
              onDirtyChange={setIsDirty}
            />
          )}

          {activeTab === 'contact' && (
            <ContactManager
              settings={settings}
              onChange={setSettings}
              onNotify={notify}
              onDirtyChange={setIsDirty}
            />
          )}

          {activeTab === 'branding' && (
            <BrandingManager
              settings={settings}
              onChange={setSettings}
              onPickImage={openMediaPicker}
              onNotify={notify}
              onDirtyChange={setIsDirty}
            />
          )}

          {activeTab === 'homepage' && (
            <HomepageManager
              homepage={homepage}
              onChange={setHomepage}
              onPickImage={openMediaPicker}
              onNotify={notify}
              onDirtyChange={setIsDirty}
            />
          )}

          {activeTab === 'navigation' && (
            <NavigationManager
              navigation={navigation}
              onChange={setNavigation}
              onPickImage={openMediaPicker}
              onNotify={notify}
              onDirtyChange={setIsDirty}
            />
          )}

          {activeTab === 'seo' && (
            <SeoManager
              seoList={seo}
              onChange={setSeo}
              onPickImage={openMediaPicker}
              onNotify={notify}
              onDirtyChange={setIsDirty}
            />
          )}

          {activeTab === 'media' && (
            <MediaLibraryManager media={media} onChange={setMedia} onNotify={notify} />
          )}

          {activeTab === 'settings' && (
            <AccountSettingsManager actor={actor} onNotify={notify} />
          )}
        </main>
      </div>

      <MediaPickerModal
        open={pickerState.open}
        media={media}
        defaultFilter={pickerState.defaultFilter}
        onClose={() => setPickerState({ open: false, cb: null, defaultFilter: 'all' })}
        onSelect={(url, alt, asset) => pickerState.cb?.(url, alt, asset)}
        onUploaded={(asset) => setMedia((prev) => [asset, ...prev])}
      />
    </div>
  )
}

