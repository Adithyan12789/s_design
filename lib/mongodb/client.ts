import { MongoClient, type Db } from 'mongodb'
import {
  DEFAULT_HOMEPAGE,
  DEFAULT_NAVIGATION,
  DEFAULT_PROJECTS,
  DEFAULT_SEO,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
  DEFAULT_STUDIO_INFO,
  DEFAULT_TESTIMONIALS,
} from '@/lib/cms/defaults'

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined
  // eslint-disable-next-line no-var
  var __mongoSeededPromise: Promise<void> | undefined
}

export function getMongoConfig(): {
  uri: string | null
  dbName: string
  isConfigured: boolean
} {
  const raw = process.env.MONGODB_URI?.trim().replace(/^["']|["']$/g, '') || ''
  const isValidScheme = raw.startsWith('mongodb://') || raw.startsWith('mongodb+srv://')
  const uri = isValidScheme ? raw : null
  const dbName = process.env.MONGODB_DB_NAME?.trim().replace(/^["']|["']$/g, '') || 's_designs_cms'
  return {
    uri,
    dbName,
    isConfigured: Boolean(uri),
  }
}

async function getClient(): Promise<MongoClient | null> {
  const { uri } = getMongoConfig()
  if (!uri) return null

  if (!globalThis.__mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
    })
    globalThis.__mongoClientPromise = client.connect().catch((err) => {
      globalThis.__mongoClientPromise = undefined
      throw err
    })
  }

  return globalThis.__mongoClientPromise
}

async function ensureIndexesAndSeed(db: Db): Promise<void> {
  if (!globalThis.__mongoSeededPromise) {
    globalThis.__mongoSeededPromise = (async () => {
      await Promise.all([
        db.collection('projects').createIndex({ slug: 1 }, { unique: true }),
        db.collection('projects').createIndex({ displayOrder: 1 }),
        db.collection('services').createIndex({ slug: 1 }, { unique: true }),
        db.collection('services').createIndex({ displayOrder: 1 }),
        db.collection('testimonials').createIndex({ displayOrder: 1 }),
        db.collection('navigation').createIndex({ displayOrder: 1 }),
        db.collection('seo').createIndex({ pageKey: 1 }, { unique: true }),
        db.collection('media').createIndex({ publicId: 1 }, { unique: true }),
        db.collection('activityLogs').createIndex({ createdAt: -1 }),
      ])

      const now = new Date().toISOString()

      const adminCount = await db.collection('admins').countDocuments()
      if (adminCount === 0) {
        await db.collection('admins').insertOne({
          _id: 'studio-admin' as unknown as never,
          role: 'admin',
          status: 'active',
          authMode: 'six-digit-access-code',
          lastLoginAt: null,
          createdAt: now,
          updatedAt: now,
        })
      }

      const projectsCount = await db.collection('projects').countDocuments()
      if (projectsCount === 0) {
        await db.collection('projects').insertMany(
          DEFAULT_PROJECTS.map((p) => ({
            ...p,
            createdAt: now,
            updatedAt: p.updatedAt || now,
          }))
        )
      }

      const servicesCount = await db.collection('services').countDocuments()
      if (servicesCount === 0) {
        await db.collection('services').insertMany(
          DEFAULT_SERVICES.map((s) => ({
            ...s,
            createdAt: now,
            updatedAt: now,
          }))
        )
      }

      const studioExisting = await db.collection('studio').findOne({ _id: 'default' as unknown as never })
      if (!studioExisting) {
        await db.collection('studio').insertOne({
          _id: 'default' as unknown as never,
          ...DEFAULT_STUDIO_INFO,
          createdAt: now,
          updatedAt: now,
        })
      }

      const testimonialsCount = await db.collection('testimonials').countDocuments()
      if (testimonialsCount === 0) {
        await db.collection('testimonials').insertMany(
          DEFAULT_TESTIMONIALS.map((t) => ({
            ...t,
            createdAt: now,
            updatedAt: now,
          }))
        )
      }

      const settingsExisting = await db
        .collection('websiteSettings')
        .findOne({ _id: 'default' as unknown as never })
      if (!settingsExisting) {
        await db.collection('websiteSettings').insertOne({
          _id: 'default' as unknown as never,
          ...DEFAULT_SETTINGS,
          createdAt: now,
          updatedAt: now,
        })
      }

      const homepageExisting = await db
        .collection('homepage')
        .findOne({ _id: 'default' as unknown as never })
      if (!homepageExisting) {
        await db.collection('homepage').insertOne({
          _id: 'default' as unknown as never,
          ...DEFAULT_HOMEPAGE,
          createdAt: now,
          updatedAt: now,
        })
      }

      const navCount = await db.collection('navigation').countDocuments()
      if (navCount === 0) {
        await db.collection('navigation').insertMany(
          DEFAULT_NAVIGATION.map((n) => ({
            ...n,
            createdAt: now,
            updatedAt: now,
          }))
        )
      }

      const seoCount = await db.collection('seo').countDocuments()
      if (seoCount === 0) {
        await db.collection('seo').insertMany(
          Object.values(DEFAULT_SEO).map((s) => ({
            ...s,
            createdAt: now,
            updatedAt: now,
          }))
        )
      }
    })().catch((err) => {
      globalThis.__mongoSeededPromise = undefined
      throw err
    })
  }

  await globalThis.__mongoSeededPromise
}

export async function getMongoDb(): Promise<Db | null> {
  try {
    const client = await getClient()
    if (!client) return null
    const { dbName } = getMongoConfig()
    const db = client.db(dbName)
    await ensureIndexesAndSeed(db)
    return db
  } catch (err) {
    console.warn('[MongoDB] Connection unavailable, using fallback data:', err instanceof Error ? err.message : err)
    return null
  }
}

