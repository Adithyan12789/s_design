import { NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  let dbStatus = 'unconfigured'
  let dbLatencyMs: number | null = null

  try {
    const db = await getMongoDb()
    if (db) {
      await db.command({ ping: 1 })
      dbStatus = 'connected'
      dbLatencyMs = Date.now() - startTime
    }
  } catch (err) {
    dbStatus = 'error'
    console.error('[Health Check] Database ping failed:', err)
  }

  const isHealthy = dbStatus !== 'error'

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'production',
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  )
}
