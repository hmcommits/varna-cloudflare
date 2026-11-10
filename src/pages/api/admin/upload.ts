import type { APIRoute } from 'astro'
import { processAndUploadImage } from '@/lib/cloudinary'
import { getMongoDb } from '@/lib/mongodb'
import { defaultStoreData } from '@/data/defaultStoreData'

export const prerender = false

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB limit

function getEnv(key: string): string {
  return (
    (typeof process !== 'undefined' && process.env?.[key]) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) ||
    ''
  ).trim()
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Auth check
    const providedToken =
      request.headers.get('x-admin-token') ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

    const token = (providedToken || '').trim()
    const masterSecret = getEnv('ADMIN_SECRET_KEY') || getEnv('ADMIN_SECRET')
    const isMaster = Boolean(masterSecret && token === masterSecret)

    const db = await getMongoDb()
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

    // 2. Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. File size limit
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB limit.`,
        }),
        {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 4. File type check
    const isImage =
      (file.type && file.type.startsWith('image/')) ||
      Boolean(file.name.match(/\.(jpe?g|png|webp|heic|heif|avif|gif|svg|tiff?|bmp|jfif)$/i))

    if (!isImage) {
      return new Response(
        JSON.stringify({
          error: 'Invalid file format. Please upload a valid image file.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 5. Upload to Cloudinary with WebP & 1600px transformation
    const result = await processAndUploadImage(file, file.name)

    return new Response(
      JSON.stringify({
        success: true,
        url: result.url,
        provider: result.provider,
        format: 'webp',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err: any) {
    console.error('Image upload failed:', err)
    return new Response(JSON.stringify({ error: err.message || 'Image processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
