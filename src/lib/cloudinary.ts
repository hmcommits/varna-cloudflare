function getEnv(key: string): string {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key] as string
  }
  return ''
}

async function sha1Hex(message: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function isCloudinaryConfigured(): boolean {
  const cloudName = getEnv('CLOUDINARY_CLOUD_NAME')
  const apiKey = getEnv('CLOUDINARY_API_KEY')
  const apiSecret = getEnv('CLOUDINARY_API_SECRET')
  const cloudinaryUrl = getEnv('CLOUDINARY_URL')

  return Boolean((cloudName && apiKey && apiSecret) || cloudinaryUrl)
}

function parseCloudinaryUrl(url: string): { cloudName: string; apiKey: string; apiSecret: string } | null {
  try {
    // cloudinary://apiKey:apiSecret@cloudName
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/)
    if (match) {
      return {
        apiKey: match[1],
        apiSecret: match[2],
        cloudName: match[3],
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null
}

export async function processAndUploadImage(
  fileBlob: Blob | File | ArrayBuffer,
  originalFilename: string
): Promise<{ url: string; provider: 'cloudinary' }> {
  let cloudName = getEnv('CLOUDINARY_CLOUD_NAME')
  let apiKey = getEnv('CLOUDINARY_API_KEY')
  let apiSecret = getEnv('CLOUDINARY_API_SECRET')
  const cloudinaryUrl = getEnv('CLOUDINARY_URL')

  if ((!cloudName || !apiKey || !apiSecret) && cloudinaryUrl) {
    const parsed = parseCloudinaryUrl(cloudinaryUrl)
    if (parsed) {
      cloudName = parsed.cloudName
      apiKey = parsed.apiKey
      apiSecret = parsed.apiSecret
    }
  }

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary credentials missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.'
    )
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const safeBaseName = originalFilename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase()
    .slice(0, 30)

  const publicId = `${Date.now()}-${safeBaseName}`
  const folder = 'varna_store'
  const eager = 'c_limit,w_1600,h_1600,f_webp,q_85'

  // Parameters to sign (sorted alphabetically): eager, folder, public_id, timestamp
  // Cloudinary signature requires: eager=...&folder=...&public_id=...&timestamp=... + apiSecret
  const signParams = [
    `eager=${eager}`,
    `folder=${folder}`,
    `public_id=${publicId}`,
    `timestamp=${timestamp}`,
  ].sort().join('&')

  const signature = await sha1Hex(`${signParams}${apiSecret}`)

  const formData = new FormData()
  if (fileBlob instanceof Blob || fileBlob instanceof File) {
    formData.append('file', fileBlob, originalFilename)
  } else {
    const blob = new Blob([fileBlob])
    formData.append('file', blob, originalFilename)
  }

  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('public_id', publicId)
  formData.append('folder', folder)
  formData.append('eager', eager)
  formData.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Cloudinary API upload error:', errText)
    throw new Error(`Cloudinary upload failed (${res.status}): ${errText}`)
  }

  const data: any = await res.json()
  // If eager transformation completed, return eager URL or secure_url
  const finalUrl =
    (Array.isArray(data.eager) && data.eager[0]?.secure_url) ||
    data.secure_url ||
    data.url

  return {
    url: finalUrl,
    provider: 'cloudinary',
  }
}
