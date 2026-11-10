import type { APIRoute } from 'astro'
import { getMongoDb } from '@/lib/mongodb'
import { defaultStoreData } from '@/data/defaultStoreData'
import { StoreState } from '@/types/store'
import { getEnvVar } from '@/lib/env'

export const prerender = false

let inMemoryStoreCache: { data: any; timestamp: number } | null = null
const CACHE_TTL_MS = 30 * 1000

function sanitizeForPublic(data: any): any {
  const sanitized = { ...data }
  if (sanitized.settings) {
    sanitized.settings = { ...sanitized.settings }
    delete sanitized.settings.passcode
  }
  return sanitized
}

function isAuthenticated(providedToken: string | null, storePasscode: string, locals?: any): boolean {
  if (!providedToken) return false
  const token = providedToken.trim()
  const masterSecret = getEnvVar('ADMIN_SECRET_KEY', locals) || getEnvVar('ADMIN_SECRET', locals)
  if (masterSecret && token === masterSecret) {
    return true
  }
  if (!storePasscode) return false
  return token === storePasscode.trim()
}

export const GET: APIRoute = async ({ request, locals }) => {
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

    const db = await getMongoDb(5000, locals)
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
      getEnvVar('ADMIN_PASSCODE', locals) ||
      storeData?.settings?.passcode ||
      defaultStoreData.settings.passcode ||
      'varna2026'

    const isAdmin = isAuthenticated(providedToken || null, storePasscode, locals)

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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const providedToken =
      request.headers.get('x-admin-token') ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

    const token = (providedToken || '').trim()
    const masterSecret = getEnvVar('ADMIN_SECRET_KEY', locals) || getEnvVar('ADMIN_SECRET', locals)
    const isMaster = Boolean(masterSecret && token === masterSecret)

    const db = await getMongoDb(8000, locals)

    let storePasscode = getEnvVar('ADMIN_PASSCODE', locals)
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

    if (!db) {
      return new Response(
        JSON.stringify({
          error: 'Database unavailable: Could not establish connection to MongoDB Atlas. Ensure MONGODB_URI is configured and 0.0.0.0/0 is enabled in Atlas Network Access.',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const body: StoreState = await request.json()
    body.lastUpdated = new Date().toISOString()

    await db.collection('config').updateOne(
      { _id: 'store_config' as any },
      { $set: { ...body, _id: 'store_config' } },
      { upsert: true }
    )

    // Clear public cache immediately so storefront sees fresh products
    inMemoryStoreCache = null

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: body.lastUpdated,
        storage: 'mongodb-atlas',
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
