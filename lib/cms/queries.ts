import { revalidatePath } from 'next/cache'
import { getMongoDb } from '@/lib/mongodb/client'
import {
  DEFAULT_HOMEPAGE,
  DEFAULT_NAVIGATION,
  DEFAULT_PROJECTS,
  DEFAULT_PUBLIC_SITE_DATA,
  DEFAULT_SEO,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
  DEFAULT_STUDIO_INFO,
  DEFAULT_TESTIMONIALS,
} from './defaults'
import type {
  CmsActivityLog,
  CmsHomepageContent,
  CmsMediaAsset,
  CmsNavItem,
  CmsProject,
  CmsSeoSetting,
  CmsService,
  CmsStudioInfo,
  CmsTestimonial,
  CmsWebsiteSettings,
  PublicSiteData,
} from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripMongoId<T>(doc: any): T {
  const { _id, ...rest } = doc || {}
  void _id
  return rest as T
}

export async function getPublicSiteData(): Promise<PublicSiteData> {
  const db = await getMongoDb()
  if (!db) {
    return DEFAULT_PUBLIC_SITE_DATA
  }

  try {
    const [
      projectDocs,
      serviceDocs,
      studioDoc,
      testimonialDocs,
      settingsDoc,
      homepageDoc,
      navDocs,
      seoDocs,
    ] = await Promise.all([
      db.collection('projects').find({ status: 'published' }).sort({ displayOrder: 1 }).toArray(),
      db.collection('services').find({ status: 'published' }).sort({ displayOrder: 1 }).toArray(),
      db.collection('studio').findOne({ _id: 'default' as unknown as never }),
      db
        .collection('testimonials')
        .find({
          $or: [{ status: 'published' }, { isPublished: true, status: { $ne: 'draft' } }],
        })
        .sort({ displayOrder: 1 })
        .toArray(),
      db.collection('websiteSettings').findOne({ _id: 'default' as unknown as never }),
      db.collection('homepage').findOne({ _id: 'default' as unknown as never }),
      db.collection('navigation').find({ visible: true }).sort({ displayOrder: 1 }).toArray(),
      db.collection('seo').find({}).toArray(),
    ])

    const seoMap: Record<string, CmsSeoSetting> = { ...DEFAULT_SEO }
    for (const doc of seoDocs) {
      const s = stripMongoId<CmsSeoSetting>(doc)
      if (s.pageKey) seoMap[s.pageKey] = s
    }

    return {
      projects: projectDocs.map((d) => stripMongoId<CmsProject>(d)),
      services: serviceDocs.map((d) => stripMongoId<CmsService>(d)),
      studioInfo: studioDoc ? stripMongoId<CmsStudioInfo>(studioDoc) : DEFAULT_STUDIO_INFO,
      testimonials: testimonialDocs.map((d) => stripMongoId<CmsTestimonial>(d)),
      settings: settingsDoc ? stripMongoId<CmsWebsiteSettings>(settingsDoc) : DEFAULT_SETTINGS,
      homepage: homepageDoc ? stripMongoId<CmsHomepageContent>(homepageDoc) : DEFAULT_HOMEPAGE,
      navigation: navDocs.map((d) => stripMongoId<CmsNavItem>(d)),
      seo: seoMap,
    }
  } catch (err) {
    console.error('[CMS] Failed loading public site data:', err instanceof Error ? err.message : err)
    return DEFAULT_PUBLIC_SITE_DATA
  }
}

export async function getPublishedProjectBySlug(slug: string): Promise<{
  project: CmsProject | null
  allProjects: CmsProject[]
}> {
  const db = await getMongoDb()
  if (!db) {
    const project = DEFAULT_PROJECTS.find((p) => p.slug === slug) || null
    return { project, allProjects: DEFAULT_PROJECTS }
  }

  try {
    const docs = await db
      .collection('projects')
      .find({ status: 'published' })
      .sort({ displayOrder: 1 })
      .toArray()

    const allProjects = docs.map((d) => stripMongoId<CmsProject>(d))
    const project = allProjects.find((p) => p.slug === slug) || null
    return { project, allProjects }
  } catch {
    const project = DEFAULT_PROJECTS.find((p) => p.slug === slug) || null
    return { project, allProjects: DEFAULT_PROJECTS }
  }
}

export async function getAdminOverviewData() {
  const db = await getMongoDb()
  if (!db) {
    return {
      projects: DEFAULT_PROJECTS,
      services: DEFAULT_SERVICES,
      studioInfo: DEFAULT_STUDIO_INFO,
      testimonials: DEFAULT_TESTIMONIALS,
      settings: DEFAULT_SETTINGS,
      homepage: DEFAULT_HOMEPAGE,
      navigation: DEFAULT_NAVIGATION,
      media: [] as CmsMediaAsset[],
      seo: Object.values(DEFAULT_SEO),
      activity: [] as CmsActivityLog[],
      dbConnected: false,
    }
  }

  const [
    projectDocs,
    serviceDocs,
    studioDoc,
    testimonialDocs,
    settingsDoc,
    homepageDoc,
    navDocs,
    mediaDocs,
    seoDocs,
    activityDocs,
  ] = await Promise.all([
    db.collection('projects').find({}).sort({ displayOrder: 1 }).toArray(),
    db.collection('services').find({}).sort({ displayOrder: 1 }).toArray(),
    db.collection('studio').findOne({ _id: 'default' as unknown as never }),
    db.collection('testimonials').find({}).sort({ displayOrder: 1 }).toArray(),
    db.collection('websiteSettings').findOne({ _id: 'default' as unknown as never }),
    db.collection('homepage').findOne({ _id: 'default' as unknown as never }),
    db.collection('navigation').find({}).sort({ displayOrder: 1 }).toArray(),
    db.collection('media').find({}).sort({ createdAt: -1 }).toArray(),
    db.collection('seo').find({}).sort({ pageKey: 1 }).toArray(),
    db.collection('activityLogs').find({}).sort({ createdAt: -1 }).limit(20).toArray(),
  ])

  return {
    projects: projectDocs.map((d) => stripMongoId<CmsProject>(d)),
    services: serviceDocs.map((d) => stripMongoId<CmsService>(d)),
    studioInfo: studioDoc ? stripMongoId<CmsStudioInfo>(studioDoc) : DEFAULT_STUDIO_INFO,
    testimonials: testimonialDocs.map((d) => stripMongoId<CmsTestimonial>(d)),
    settings: settingsDoc ? stripMongoId<CmsWebsiteSettings>(settingsDoc) : DEFAULT_SETTINGS,
    homepage: homepageDoc ? stripMongoId<CmsHomepageContent>(homepageDoc) : DEFAULT_HOMEPAGE,
    navigation: navDocs.map((d) => stripMongoId<CmsNavItem>(d)),
    media: mediaDocs.map((d) => stripMongoId<CmsMediaAsset>(d)),
    seo: seoDocs.map((d) => stripMongoId<CmsSeoSetting>(d)),
    activity: activityDocs.map((d) => stripMongoId<CmsActivityLog>(d)),
    dbConnected: true,
  }
}

export async function logAdminActivity(
  actorEmail: string,
  action: string,
  entityType: string,
  entityLabel: string
) {
  const db = await getMongoDb()
  if (!db) return

  const now = new Date().toISOString()
  await db.collection('activityLogs').insertOne({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actorEmail,
    action,
    entityType,
    entityLabel,
    createdAt: now,
  })
}

export function revalidatePublicSite(slug?: string) {
  try {
    revalidatePath('/', 'page')
    revalidatePath('/', 'layout')
    revalidatePath('/work', 'page')
    if (slug) {
      revalidatePath(`/work/${slug}`, 'page')
    }
  } catch (err) {
    console.warn('[CMS] Revalidation note:', err instanceof Error ? err.message : err)
  }
}
