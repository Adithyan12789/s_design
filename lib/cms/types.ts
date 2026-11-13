export type ProjectStatus = 'draft' | 'published'

export type CmsProjectImage = {
  id: string
  projectId: string
  url: string
  altText: string
  displayOrder: number
}

export type CmsProject = {
  id: string
  slug: string
  title: string
  meta: string
  location: string
  year: string
  type: string
  category: string
  area: string
  size: 'large' | 'small'
  shortDescription: string
  fullDescription: string
  mainImage: string
  mainImageAlt: string
  thumbnailImage: string
  details: string[]
  galleryImages: CmsProjectImage[]
  displayOrder: number
  status: ProjectStatus
  featured: boolean
  seoTitle: string
  seoDescription: string
  updatedAt: string
}

export type CmsService = {
  id: string
  title: string
  slug: string
  shortDescription: string
  fullDescription: string
  imageUrl: string
  iconName: string
  displayOrder: number
  status: ProjectStatus
  seoTitle: string
  seoDescription: string
}

export type StudioTeamMember = {
  id: string
  name: string
  role: string
  bio: string
  photoUrl: string
}

export type StudioExtraSection = {
  id: string
  title: string
  content: string
}

export type CmsStudioInfo = {
  kicker: string
  heading: string
  accentHeading: string
  introText: string
  description: string
  philosophy: string
  vision: string
  mission: string
  history: string
  studioImages: string[]
  studioImage?: string
  teamMembers: StudioTeamMember[]
  extraSections: StudioExtraSection[]
}

export type CmsTestimonial = {
  id: string
  clientName: string
  projectName?: string
  projectDescription?: string
  designation: string
  headline: string
  quote: string
  clientPhoto: string
  videoUrl: string
  posterImage: string
  backgroundImage: string
  rating: number
  projectId: string | null
  featured: boolean
  displayOrder: number
  status: ProjectStatus
}

export type CmsTypographySettings = {
  display: string
  body: string
  heroTitleSize?: string
  heroSubtitleSize?: string
  studioHeadingSize?: string
  studioBodySize?: string
  workTitleSize?: string
  workDescSize?: string
  workDescGap?: string
  workSlideGap?: string
  workImageScale?: string
  approachHeadingSize?: string
  approachBodySize?: string
  servicesTitleSize?: string
  reviewsHeadingSize?: string
  reviewsClientHeadingSize?: string
  reviewsDescSize?: string
  reviewsCenterCardScale?: string
  contactHeadingSize?: string
  contactBodySize?: string
  kickerSize?: string
}

export type CmsWebsiteSettings = {
  studioName: string
  studioSubtitle: string
  tagline: string
  mainLogoUrl: string
  altLogoUrl: string
  lightLogoUrl: string
  darkLogoUrl: string
  faviconUrl: string
  footerLogoUrl: string
  brandColors: {
    ivory: string
    paper: string
    ink: string
    bronze: string
    bronzeLight: string
  }
  typography: CmsTypographySettings
  email: string
  phone: string
  whatsapp: string
  officeAddress: string
  mapsUrl: string
  businessHours: string
  instagramUrl: string
  facebookUrl: string
  pinterestUrl: string
  linkedinUrl: string
  otherSocials: { label: string; url: string }[]
  footerCopyright: string
}

export type CmsHomepageContent = {
  heroEyebrow: string
  heroTitleLine1: string
  heroTitleLine2: string
  heroDescription: string
  heroImageUrl: string
  heroIndexText: string
  heroStudioName: string
  heroStudioSubtitle: string
  selectedWorkKicker: string
  selectedWorkHeading: string
  approachKicker: string
  approachHeading1: string
  approachHeading2: string
  approachDescription: string
  approachImageUrl: string
  initiateKicker: string
  initiateHeading: string
  initiateSubtitle: string
  initiateDescription: string
  initiateCtaLabel: string
  initiateCtaHref: string
  servicesKicker: string
  servicesNote: string
  reviewsKicker: string
  reviewsHeading1: string
  reviewsHeading2: string
  contactKicker: string
  contactHeading1: string
  contactHeading2: string
  contactDescription: string
}

export type CmsNavItem = {
  id: string
  label: string
  href: string
  subtitle: string
  previewImage: string
  displayOrder: number
  visible: boolean
  isCta: boolean
}

export type CmsMediaAsset = {
  id: string
  storagePath: string
  publicUrl: string
  fileName: string
  mimeType: string
  fileSize: number
  width: number | null
  height: number | null
  altText: string
  createdAt: string
}

export type CmsSeoSetting = {
  pageKey: string
  seoTitle: string
  metaDescription: string
  ogImage: string
  ogTitle: string
  ogDescription: string
  canonicalUrl: string
}

export type CmsActivityLog = {
  id: string
  actorEmail: string
  action: string
  entityType: string
  entityLabel: string
  createdAt: string
}

export type PublicSiteData = {
  projects: CmsProject[]
  services: CmsService[]
  studioInfo: CmsStudioInfo
  testimonials: CmsTestimonial[]
  settings: CmsWebsiteSettings
  homepage: CmsHomepageContent
  navigation: CmsNavItem[]
  seo: Record<string, CmsSeoSetting>
}

