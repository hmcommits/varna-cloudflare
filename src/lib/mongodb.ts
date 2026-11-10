import { MongoClient, Db } from 'mongodb'

function getMongoUri(): string | undefined {
  return (
    (typeof process !== 'undefined' && process.env?.MONGODB_URI) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.MONGODB_URI) ||
    ''
  )
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
}

export function isMongoConfigured(): boolean {
  const uri = getMongoUri()
  return Boolean(uri && uri.startsWith('mongodb'))
}

// 45-second circuit breaker cooldown after an Atlas connection failure
const COOLDOWN_PERIOD_MS = 45 * 1000

export async function getMongoDb(timeoutMs = 5000): Promise<Db | null> {
  const uri = getMongoUri()
  if (!uri || !isMongoConfigured()) {
    return null
  }

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
