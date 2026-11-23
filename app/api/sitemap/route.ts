import { projects as DEFAULT_PROJECTS } from '@/lib/projects'
import { getMongoDb } from '@/lib/mongodb/client'

const BASE_URL = 'https://sdesign.co.in'

export async function GET() {
  // Try MongoDB first; fall back to static DEFAULT_PROJECTS if unavailable.
  const db = await getMongoDb()
  const projects: Array<{slug: string; createdAt?: string}> = []

  if (db) {
    try {
      const docs = await db.collection('projects').find({ status: 'published' }).toArray()
      docs.forEach(d => {
        projects.push({
          slug: d.slug,
          createdAt: d.createdAt as string | undefined,
        })
      })
    } catch (e) {
      console.warn('[sitemap] MongoDB query failed, falling back to static projects', e)
    }
  }

  // If no projects from DB, use static defaults.
  if (projects.length === 0) {
    projects.push(...DEFAULT_PROJECTS.map(p => ({ slug: p.slug })))
  }

  const urls = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]

  projects.forEach(p => {
    urls.push({
      url: `${BASE_URL}/work/${p.slug}`,
      lastModified: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  })

  // Build XML sitemap string.
  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">',
  ]

  urls.forEach(u => {
    xmlLines.push('  <url>')
    xmlLines.push(`    <loc>${u.url}</loc>`)
    if (u.lastModified) {
      xmlLines.push(`    <lastmod>${u.lastModified}</lastmod>`)
    }
    xmlLines.push(`    <changefreq>${u.changeFrequency}</changefreq>`)
    xmlLines.push(`    <priority>${u.priority}</priority>`)
    xmlLines.push('  </url>')
  })

  xmlLines.push('</urlset>')

  const xml = xmlLines.join('\n')

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}