import type { APIRoute } from 'astro'
import { getMongoDb } from '@/lib/mongodb'
import { defaultStoreData } from '@/data/defaultStoreData'
import { getEnvVar } from '@/lib/env'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { passcode } = await request.json()

    if (!passcode || typeof passcode !== 'string') {
      return new Response(JSON.stringify({ error: 'Passcode is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const inputPasscode = passcode.trim()
    const masterSecret = getEnvVar('ADMIN_SECRET_KEY', locals) || getEnvVar('ADMIN_SECRET', locals)

    // 1. Master Secret Override
    const isMaster = Boolean(masterSecret && inputPasscode === masterSecret)

    // 2. Resolve store-configured passcode
    let storePasscode = getEnvVar('ADMIN_PASSCODE', locals)
    if (!storePasscode) {
      const db = await getMongoDb(5000, locals)
      if (db) {
        const config = await db.collection('config').findOne({ _id: 'store_config' as any })
        storePasscode =
          config?.settings?.passcode ||
          defaultStoreData.settings.passcode ||
          'varna2026'
      } else {
        storePasscode = defaultStoreData.settings.passcode || 'varna2026'
      }
    }

    const isAuthorized = isMaster || Boolean(storePasscode && inputPasscode === storePasscode.trim())

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: 'Invalid passcode' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': `varna_admin_session=authenticated; Path=/; Max-Age=86400; SameSite=Lax`,
    })

    return new Response(
      JSON.stringify({
        success: true,
        token: passcode.trim(),
      }),
      {
        status: 200,
        headers,
      }
    )
  } catch (err: any) {
    console.error('Auth API error:', err)
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
