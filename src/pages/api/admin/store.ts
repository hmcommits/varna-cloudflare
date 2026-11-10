import type { APIRoute } from 'astro'
import { getMongoDb } from '@/lib/mongodb'
import { defaultStoreData } from '@/data/defaultStoreData'
import { StoreState } from '@/types/store'

export const prerender = false

let inMemoryStoreCache: { data: any; timestamp: number } | null = null
const CACHE_TTL_MS = 30 * 1000

function getEnv(key: string): string {
  return (
    (typeof process !== 'undefined' && process.env?.[key]) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) ||
    ''
  ).trim()
}

function sanitizeForPublic(data: any): any {
  const sanitized = { ...data }
  if (sanitized.settings) {
    sanitized.settings = { ...sanitized.settings }
    delete sanitized.settings.passcode
  }
  return sanitized
}

function isAuthenticated(providedToken: string | null, storePasscode: string): boolean {
  if (!providedToken) return false
  const token = providedToken.trim()
  const masterSecret = getEnv('ADMIN_SECRET_KEY') || getEnv('ADMIN_SECRET')
  if (masterSecret && token === masterSecret) {
    return true
  }
  if (!storePasscode) return false
  return token === storePasscode.trim()
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const providedToken =
      request.headers.get('x-admin-token') ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

    // Public fast-path cache
    if (!providedToken && inMemoryStoreCache && Date.now() - inMemoryStoreCache.timestamp < CACHE_TTL_MS) {
      return new Response(JSON.stringify(inMemoryStoreCache.data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
        },
      })
    }

    const db = await getMongoDb()
    let storeData: any = null

    if (db) {
      const config = await db.collection('config').findOne({ _id: 'store_config' as any })
      if (config) {
        const { _id: _, ...data } = config
        storeData = data
      } else {
        // Seed MongoDB Atlas on first connect
        const initialData = defaultStoreData
        await db.collection('config').updateOne(
          { _id: 'store_config' as any },
          { $set: { ...initialData, _id: 'store_config' } },
          { upsert: true }
        )
        storeData = initialData
      }
    } else {
      storeData = defaultStoreData
    }

    const storePasscode =
      getEnv('ADMIN_PASSCODE') ||
      storeData?.settings?.passcode ||
      defaultStoreData.settings.passcode ||
      'varna2026'

    const isAdmin = isAuthenticated(providedToken || null, storePasscode)

    // Ensure stale logos are replaced
    if (
      !storeData?.settings?.logoUrl ||
      storeData.settings.logoUrl.includes('varna-emblem') ||
      storeData.settings.logoUrl.includes('1793867092112') ||
      storeData.settings.logoUrl.includes('varna-curved-brandmark')
    ) {
      if (storeData && storeData.settings) {
        storeData.settings.logoUrl =
          'https://res.cloudinary.com/o6jv6xte/image/upload/v1793872122/varna_store/logo/varna-brandmark-transparent-v3.webp'
      }
    }

    const responseData = isAdmin ? storeData : sanitizeForPublic(storeData)

    if (!isAdmin) {
      inMemoryStoreCache = { data: responseData, timestamp: Date.now() }
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
      },
    })
  } catch (err: any) {
    console.error('Error fetching store state:', err)
    return new Response(JSON.stringify(sanitizeForPublic(defaultStoreData)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const providedToken =
      request.headers.get('x-admin-token') ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

    const token = (providedToken || '').trim()
    const masterSecret = getEnv('ADMIN_SECRET_KEY') || getEnv('ADMIN_SECRET')
    const isMaster = Boolean(masterSecret && token === masterSecret)

    const db = await getMongoDb(8000)

    let storePasscode = getEnv('ADMIN_PASSCODE')
    if (!storePasscode) {
      if (db) {
        const existing = await db.collection('config').findOne({ _id: 'store_config' as any })
        storePasscode =
          existing?.settings?.passcode ||
          defaultStoreData.settings.passcode ||
          'varna2026'
      } else {
        storePasscode = defaultStoreData.settings.passcode || 'varna2026'
      }
    }

    const isAuthorized = isMaster || Boolean(token && token === storePasscode.trim())

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or missing administrator authorization token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const body: StoreState = await request.json()
    body.lastUpdated = new Date().toISOString()

    let savedToMongo = false

    if (db) {
      await db.collection('config').updateOne(
        { _id: 'store_config' as any },
        { $set: { ...body, _id: 'store_config' } },
        { upsert: true }
      )
      savedToMongo = true
    } else {
      console.warn('MongoDB Atlas temporarily unavailable during POST /api/admin/store')
    }

    inMemoryStoreCache = null

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: body.lastUpdated,
        storage: savedToMongo ? 'mongodb-atlas' : 'edge-memory',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err: any) {
    console.error('Error saving store state:', err)
    return new Response(JSON.stringify({ error: err.message || 'Failed to save store state' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
