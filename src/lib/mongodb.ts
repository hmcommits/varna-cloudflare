import { MongoClient, Db } from 'mongodb'
import { getEnvVar } from '@/lib/env'

export function getMongoUri(source?: any): string {
  return getEnvVar('MONGODB_URI', source)
}

const options = {
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 8000,
  tls: true,
  tlsAllowInvalidCertificates: true,
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
  // eslint-disable-next-line no-var
  var _mongoLastFailedAttempt: number | undefined
  // eslint-disable-next-line no-var
  var _mongoActiveUri: string | undefined
}

export function isMongoConfigured(source?: any): boolean {
  const uri = getMongoUri(source)
  return Boolean(uri && uri.startsWith('mongodb'))
}

// 45-second circuit breaker cooldown after an Atlas connection failure
const COOLDOWN_PERIOD_MS = 45 * 1000

export async function getMongoDb(timeoutMs = 5000, source?: any): Promise<Db | null> {
  const uri = getMongoUri(source)
  if (!uri || !isMongoConfigured(source)) {
    return null
  }

  // Reset cached client if URI changed dynamically
  if (globalThis._mongoActiveUri && globalThis._mongoActiveUri !== uri) {
    globalThis._mongoClientPromise = undefined
  }
  globalThis._mongoActiveUri = uri

  // Fast-fail if circuit breaker is open
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
        setTimeout(() => reject(new Error('MongoDB connection timeout')), timeoutMs)
      ),
    ])
    globalThis._mongoLastFailedAttempt = undefined
    return connectedClient.db('varna_store')
  } catch (error) {
    console.warn('MongoDB Atlas temporarily unavailable:', (error as any)?.message || error)
    globalThis._mongoLastFailedAttempt = Date.now()
    globalThis._mongoClientPromise = undefined
    return null
  }
}
