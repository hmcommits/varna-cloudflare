import { MongoClient, Db } from 'mongodb'
import { getEnvVar } from '@/lib/env'

const KNOWN_CLUSTERS: Record<string, { hosts: string[]; replicaSet: string }> = {
  'cluster0.bcxjtln.mongodb.net': {
    hosts: [
      'ac-etho1pz-shard-00-00.bcxjtln.mongodb.net:27017',
      'ac-etho1pz-shard-00-01.bcxjtln.mongodb.net:27017',
      'ac-etho1pz-shard-00-02.bcxjtln.mongodb.net:27017',
    ],
    replicaSet: 'atlas-56hhce-shard-0',
  },
}

let cachedDirectUri: string | null = null

/**
 * Cloudflare Workers runtime (workerd) cannot run Node.js dns.resolveSrv,
 * causing mongodb+srv:// to fail silently or timeout.
 * This resolver converts mongodb+srv:// to direct mongodb:// with hosts and replicaSet.
 */
export async function resolveSrvToStandardUri(srvUri: string): Promise<string> {
  if (!srvUri || !srvUri.startsWith('mongodb+srv://')) {
    return srvUri
  }

  if (cachedDirectUri) {
    return cachedDirectUri
  }

  try {
    const match = srvUri.match(/^mongodb\+srv:\/\/([^@]+@)?([^/?#]+)(\/[^?#]*)?(\?.*)?$/)
    if (!match) return srvUri

    const auth = match[1] || ''
    const host = match[2]
    const path = match[3] || '/varna_store'
    const query = match[4] || ''

    let resolvedHosts: string[] = []
    let replicaSet = ''

    if (KNOWN_CLUSTERS[host]) {
      resolvedHosts = KNOWN_CLUSTERS[host].hosts
      replicaSet = KNOWN_CLUSTERS[host].replicaSet
    } else {
      // Resolve dynamically via Cloudflare DoH (DNS-over-HTTPS)
      try {
        const srvRes = await fetch(
          `https://cloudflare-dns.com/dns-query?name=_mongodb._tcp.${host}&type=SRV`,
          { headers: { accept: 'application/dns-json' } }
        )
        const srvData: any = await srvRes.json()
        if (Array.isArray(srvData.Answer)) {
          resolvedHosts = srvData.Answer.map((ans: any) => {
            const parts = ans.data.trim().split(/\s+/)
            return `${parts[3].replace(/\.$/, '')}:${parts[2]}`
          })
        }

        const txtRes = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${host}&type=TXT`,
          { headers: { accept: 'application/dns-json' } }
        )
        const txtData: any = await txtRes.json()
        if (Array.isArray(txtData.Answer)) {
          const txtRaw = txtData.Answer.map((ans: any) => ans.data.replace(/^"|"$/g, '')).join('&')
          const rsMatch = txtRaw.match(/replicaSet=([^&]+)/)
          if (rsMatch) replicaSet = rsMatch[1]
        }
      } catch {
        // Fallback to direct SRV string if DoH fails
      }
    }

    if (resolvedHosts.length > 0) {
      const hostsStr = resolvedHosts.join(',')
      const params = new URLSearchParams(query.replace(/^\?/, ''))
      params.set('ssl', 'true')
      params.set('authSource', 'admin')
      if (replicaSet) {
        params.set('replicaSet', replicaSet)
      }
      const directUri = `mongodb://${auth}${hostsStr}${path}?${params.toString()}`
      cachedDirectUri = directUri
      return directUri
    }
  } catch (err) {
    console.warn('Failed to resolve SRV via DoH:', err)
  }

  return srvUri
}

export function getMongoUri(source?: any): string {
  return getEnvVar('MONGODB_URI', source)
}

const options = {
  maxPoolSize: 3,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  tls: true,
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
  // eslint-disable-next-line no-var
  var _mongoLastFailedAttempt: number | undefined
  // eslint-disable-next-line no-var
  var _mongoActiveUri: string | undefined
  // eslint-disable-next-line no-var
  var _mongoLastErrorMessage: string | undefined
}

export function isMongoConfigured(source?: any): boolean {
  const uri = getMongoUri(source)
  return Boolean(uri && uri.startsWith('mongodb'))
}

export function getLastMongoError(): string | undefined {
  return globalThis._mongoLastErrorMessage
}

// 45-second circuit breaker cooldown after an Atlas connection failure
const COOLDOWN_PERIOD_MS = 45 * 1000

export async function getMongoDb(timeoutMs = 8000, source?: any): Promise<Db | null> {
  let uri = getMongoUri(source)
  if (!uri || !isMongoConfigured(source)) {
    globalThis._mongoLastErrorMessage = 'MONGODB_URI environment variable is not configured or is empty'
    return null
  }

  // Convert SRV to direct replica-set hosts for Cloudflare Workers
  if (uri.startsWith('mongodb+srv://')) {
    uri = await resolveSrvToStandardUri(uri)
  }

  // Reset cached client if URI changed dynamically
  if (globalThis._mongoActiveUri && globalThis._mongoActiveUri !== uri) {
    globalThis._mongoClientPromise = undefined
  }
  globalThis._mongoActiveUri = uri

  // Fast-fail if circuit breaker is open (for short background polls)
  const lastFail = globalThis._mongoLastFailedAttempt || 0
  const now = Date.now()
  if (timeoutMs <= 2000 && now - lastFail < COOLDOWN_PERIOD_MS && !globalThis._mongoClientPromise) {
    return null
  }

  try {
    if (!globalThis._mongoClientPromise) {
      const client = new MongoClient(uri, options)
      globalThis._mongoClientPromise = client.connect()
    }
    const connectedClient = await Promise.race([
      globalThis._mongoClientPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('MongoDB Atlas connection timed out (8000ms)')), timeoutMs)
      ),
    ])
    globalThis._mongoLastFailedAttempt = undefined
    globalThis._mongoLastErrorMessage = undefined
    return connectedClient.db('varna_store')
  } catch (error: any) {
    const msg = error?.message || String(error)
    console.error('MongoDB Atlas connection error:', msg)
    globalThis._mongoLastErrorMessage = msg
    globalThis._mongoLastFailedAttempt = Date.now()
    globalThis._mongoClientPromise = undefined
    return null
  }
}
