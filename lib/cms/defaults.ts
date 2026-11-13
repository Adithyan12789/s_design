import { projects as staticProjects } from '@/lib/projects'
import type {
  CmsHomepageContent,
  CmsNavItem,
  CmsProject,
  CmsSeoSetting,
  CmsService,
  CmsStudioInfo,
  CmsTestimonial,
  CmsWebsiteSettings,
  PublicSiteData,
} from './types'

export const DEFAULT_PROJECTS: CmsProject[] = staticProjects.map((p, idx) => ({
  id: `default-${p.slug}`,
  slug: p.slug,
  title: p.title,
  meta: p.meta,
  location: p.location,
  year: p.year,
  type: p.type,
  category: p.category,
  area: p.area,
  size: p.size,
  shortDescription: p.description,
  fullDescription:
    'Every detail was developed through physical mockups and light studies on site, ensuring a seamless dialogue between built geometry and the surrounding landscape.',
  mainImage: p.image,
  mainImageAlt: `${p.title} — ${p.location}`,
  thumbnailImage: p.image,
  details: p.details,
  galleryImages: p.gallery.map((url, gIdx) => ({
    id: `default-${p.slug}-img-${gIdx}`,
    projectId: `default-${p.slug}`,
    url,
    altText: `${p.title} plate ${gIdx + 1}`,
    displayOrder: gIdx,
  })),
  displayOrder: idx,
  status: 'published',
  featured: true,
  seoTitle: `${p.title} — S_Designs Architecture`,
  seoDescription: p.description,
  updatedAt: '2026-01-01T00:00:00.000Z',
}))

export const DEFAULT_SERVICES: CmsService[] = [
  {
    id: 'default-service-1',
    title: 'Residential architecture',
    slug: 'residential-architecture',
    shortDescription: 'Private residences shaped around light, landscape, and quiet daily rituals.',
    fullDescription: 'Full-scope architectural design from early site feasibility through bespoke construction detailing.',
    imageUrl: '',
    iconName: 'home',
    displayOrder: 0,
    status: 'published',
    seoTitle: '',
    seoDescription: '',
  },
  {
    id: 'default-service-2',
    title: 'Interior environments',
    slug: 'interior-environments',
    shortDescription: 'Calm, tactile interiors crafted from natural stone, timber, and custom joinery.',
    fullDescription: 'Complete spatial curation, custom millwork, lighting design, and material specification.',
    imageUrl: '',
    iconName: 'layers',
    displayOrder: 1,
    status: 'published',
    seoTitle: '',
    seoDescription: '',
  },
  {
    id: 'default-service-3',
    title: 'Renovation & adaptive reuse',
    slug: 'renovation-adaptive-reuse',
    shortDescription: 'Thoughtful transformation of historic structures into contemporary spaces.',
    fullDescription: 'Sensitive structural interventions preserving heritage character while introducing modern comfort.',
    imageUrl: '',
    iconName: 'compass',
    displayOrder: 2,
    status: 'published',
    seoTitle: '',
    seoDescription: '',
  },
  {
    id: 'default-service-4',
    title: 'Visualization & consultation',
    slug: 'visualization-consultation',
    shortDescription: 'Physical models, daylight studies, and early architectural advisory.',
    fullDescription: 'Site evaluation, spatial massing studies, and atmospheric architectural visualization.',
    imageUrl: '',
    iconName: 'eye',
    displayOrder: 3,
    status: 'published',
    seoTitle: '',
    seoDescription: '',
  },
]

export const DEFAULT_STUDIO_INFO: CmsStudioInfo = {
  kicker: 'Studio note',
  heading: 'Architecture is the art of',
  accentHeading: 'making room for life.',
  introText:
    'S_Designs is a small, independent practice working across architecture, interiors and objects.',
  description:
    'S_Designs is a small, independent practice working across architecture, interiors and objects. We believe the most lasting spaces begin with careful attention — to how light moves, how materials age, and how people belong.',
  philosophy:
    'We work slowly and collaboratively, building a clear idea before adding anything else. The result is architecture that feels inevitable — generous, tactile and made to last.',
  vision: 'To shape quiet, enduring architecture grounded in local craft, natural light, and timeless materiality.',
  mission: 'Designing deeply considered residential, cultural, and hospitality environments across Portugal and worldwide.',
  history: 'Founded in Lisbon as an independent architectural and spatial studio.',
  studioImages: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
  ],
  studioImage:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
  teamMembers: [],
  extraSections: [],
}

export const DEFAULT_TESTIMONIALS: CmsTestimonial[] = [
  {
    id: 'almeida',
    clientName: 'Henrique & Sofia Almeida',
    projectName: 'Casa Loma Residence',
    projectDescription:
      'A serene hillside courtyard home shaped in limewashed plaster, oak, and filtered daylight.',
    designation: 'Private Homeowners',
    headline: 'A home shaped by stillness and warm light.',
    quote:
      'A serene hillside courtyard home shaped in limewashed plaster, oak, and filtered daylight.',
    clientPhoto: '',
    videoUrl: '',
    posterImage:
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85',
    backgroundImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    rating: 5,
    projectId: 'casa-loma',
    featured: true,
    displayOrder: 0,
    status: 'published',
  },
  {
    id: 'takahashi',
    clientName: 'Kenji Takahashi',
    projectName: 'Atelier Marais',
    projectDescription:
      'An intimate timber-and-stone gallery residence balancing quiet proportion with natural shadow.',
    designation: 'Commission Patron',
    headline: 'Material restraint that surprises every morning.',
    quote:
      'An intimate timber-and-stone gallery residence balancing quiet proportion with natural shadow.',
    clientPhoto: '',
    videoUrl: '',
    posterImage:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85',
    backgroundImage:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85',
    rating: 5,
    projectId: 'atelier-marais',
    featured: true,
    displayOrder: 1,
    status: 'published',
  },
  {
    id: 'meier-keller',
    clientName: 'Elena Meier-Keller',
    projectName: 'The Mineral House',
    projectDescription:
      'A monolithic travertine sanctuary designed around framed landscape views and tactile stillness.',
    designation: 'Foundation Director',
    headline: 'Clarity and precision from first sketch to handoff.',
    quote:
      'A monolithic travertine sanctuary designed around framed landscape views and tactile stillness.',
    clientPhoto: '',
    videoUrl: '',
    posterImage:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85',
    backgroundImage:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
    rating: 5,
    projectId: 'the-mineral-house',
    featured: false,
    displayOrder: 2,
    status: 'published',
  },
]

export const DEFAULT_SETTINGS: CmsWebsiteSettings = {
  studioName: 'S_DE_SIGN',
  studioSubtitle: 'ARCHITECTURE / STUDIO',
  tagline: 'Architecture / Objects',
  mainLogoUrl: '/s-design-emblem-white.png',
  altLogoUrl: '/s-design-emblem-clean.png',
  lightLogoUrl: '/s-design-emblem-clean.png',
  darkLogoUrl: '/s-design-emblem-white.png',
  faviconUrl: '/s-design-logo.jpg',
  footerLogoUrl: '/s-design-emblem-white.png',
  brandColors: {
    ivory: '#121110',
    paper: '#181614',
    ink: '#f4efe6',
    bronze: '#d9b686',
    bronzeLight: '#f1cf9e',
  },
  typography: {
    display: "Georgia, 'Times New Roman', serif",
    body: 'Arial, Helvetica, sans-serif',
    heroTitleSize: 'clamp(62px, 9.5vw, 145px)',
    heroSubtitleSize: '14px',
    studioHeadingSize: 'clamp(42px, 5.3vw, 78px)',
    studioBodySize: '14px',
    workTitleSize: 'clamp(25px, 2.4vw, 36px)',
    workDescSize: 'clamp(13px, 1.05vw, 15px)',
    workDescGap: 'clamp(32px, 4vw, 56px)',
    workSlideGap: 'calc(50vw - 380px)',
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
  },
  email: 'hello@sdesigns.studio',
  phone: '',
  whatsapp: '',
  officeAddress: 'Lisbon · Portugal',
  mapsUrl: '',
  businessHours: 'Mon – Fri · 09:00 – 18:00 WET',
  instagramUrl: '#top',
  facebookUrl: '',
  pinterestUrl: '',
  linkedinUrl: '#top',
  otherSocials: [],
  footerCopyright: '© 2024 S_Designs',
}

export const DEFAULT_HOMEPAGE: CmsHomepageContent = {
  heroEyebrow: 'Independent architecture studio · Portugal / Worldwide',
  heroTitleLine1: 'Spaces with',
  heroTitleLine2: 'quiet presence.',
  heroDescription:
    'We shape considered places for living, working and gathering — grounded in material, light and context.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=90',
  heroIndexText: '01 / 04',
  heroStudioName: 'S_DE_SIGN',
  heroStudioSubtitle: 'ARCHITECTURE & SPATIAL PRACTICE',
  selectedWorkKicker: 'SELECTED WORKS ARCHIVE',
  selectedWorkHeading: '2021 — 2024',
  approachKicker: 'Our approach',
  approachHeading1: 'Less, but',
  approachHeading2: 'better.',
  approachDescription:
    'We work slowly and collaboratively, building a clear idea before adding anything else. The result is architecture that feels inevitable — generous, tactile and made to last.',
  approachImageUrl:
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85',
  initiateKicker: '( INITIATE A PROJECT )',
  initiateHeading: 'INITIATE A PROJECT',
  initiateSubtitle: 'Have a site or idea in mind?',
  initiateDescription:
    'We work with discerning clients globally on new builds, renovations, and interior architecture.',
  initiateCtaLabel: 'Begin a conversation',
  initiateCtaHref: '#contact',
  servicesKicker: 'What we do',
  servicesNote: 'From first sketch to final detail.',
  reviewsKicker: 'Client reviews',
  reviewsHeading1: 'Quiet',
  reviewsHeading2: 'appreciation.',
  contactKicker: 'Begin a project',
  contactHeading1: 'Have a place',
  contactHeading2: 'in mind?',
  contactDescription:
    'Tell us a little about what you are imagining. We will get back to you within three working days.',
}

export const DEFAULT_NAVIGATION: CmsNavItem[] = [
  {
    id: 'nav-work',
    label: 'Work',
    href: '/#selected-work',
    subtitle: 'Selected Architectural Commissions',
    previewImage:
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 0,
    visible: true,
    isCta: false,
  },
  {
    id: 'nav-studio',
    label: 'Studio',
    href: '/#studio',
    subtitle: 'Philosophy, Materiality & Craft',
    previewImage:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 1,
    visible: true,
    isCta: false,
  },
  {
    id: 'nav-services',
    label: 'Services',
    href: '/#services',
    subtitle: 'Architecture, Interiors & Objects',
    previewImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 2,
    visible: true,
    isCta: false,
  },
  {
    id: 'nav-contact',
    label: 'Contact',
    href: '/#contact',
    subtitle: 'Initiate a Conversation',
    previewImage:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 3,
    visible: true,
    isCta: false,
  },
]

export const DEFAULT_SEO: Record<string, CmsSeoSetting> = {
  home: {
    pageKey: 'home',
    seoTitle: 'S_Designs — Architecture / Objects',
    metaDescription:
      'S_Designs is an independent architecture studio creating quiet, considered spaces for living, working and gathering.',
    ogImage: '/s-design-logo.jpg',
    ogTitle: 'S_Designs — Architecture / Objects',
    ogDescription: 'Independent architecture studio · Portugal / Worldwide',
    canonicalUrl: '',
  },
}

export const DEFAULT_PUBLIC_SITE_DATA: PublicSiteData = {
  projects: DEFAULT_PROJECTS,
  services: DEFAULT_SERVICES,
  studioInfo: DEFAULT_STUDIO_INFO,
  testimonials: DEFAULT_TESTIMONIALS,
  settings: DEFAULT_SETTINGS,
  homepage: DEFAULT_HOMEPAGE,
  navigation: DEFAULT_NAVIGATION,
  seo: DEFAULT_SEO,
}

