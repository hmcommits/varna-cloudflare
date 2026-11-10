import type { APIRoute } from 'astro'
import { processAndUploadImage } from '@/lib/cloudinary'
import { getMongoDb } from '@/lib/mongodb'
import { defaultStoreData } from '@/data/defaultStoreData'
import { getEnvVar } from '@/lib/env'

export const prerender = false

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB limit

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Auth check
    const providedToken =
      request.headers.get('x-admin-token') ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

    const token = (providedToken || '').trim()
    const masterSecret = getEnvVar('ADMIN_SECRET_KEY', locals) || getEnvVar('ADMIN_SECRET', locals)
    const isMaster = Boolean(masterSecret && token === masterSecret)

    const db = await getMongoDb(5000, locals)
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

    // 2. Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return new Response(JSON.stringify({ error: 'No image file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds maximum allowed limit (10MB)' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 3. Upload to Cloudinary with Edge HMAC-SHA1 Web Crypto
    const result = await processAndUploadImage(file, file.name, locals)

    return new Response(
      JSON.stringify({
        url: result.url,
        provider: result.provider,
        filename: file.name,
        size: file.size,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err: any) {
    console.error('Upload API failure:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Image processing and upload failed' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
