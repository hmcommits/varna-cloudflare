import { getMongoDb } from '@/lib/mongodb'
import { defaultStoreData } from '@/data/defaultStoreData'
import { StoreState, Product } from '@/types/store'
import { getEnvVar } from '@/lib/env'

let inMemoryServerStore: { data: StoreState; timestamp: number } | null = null
const CACHE_TTL_MS = 30 * 1000

export function getSiteUrl(origin?: string): string {
  if (origin) {
    return origin.replace(/\/$/, '')
  }
  const publicSiteUrl = getEnvVar('PUBLIC_SITE_URL')
  if (publicSiteUrl) {
    return publicSiteUrl.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

export async function getStoreDataForServer(source?: any): Promise<StoreState> {
  const now = Date.now()
  if (inMemoryServerStore && now - inMemoryServerStore.timestamp < CACHE_TTL_MS) {
    return inMemoryServerStore.data
  }

  try {
    const db = await getMongoDb(2000, source)
    if (db) {
      const config = await db.collection('config').findOne({ _id: 'store_config' as any })
      if (config) {
        const { _id: _, ...data } = config
        const storeData = data as unknown as StoreState
        inMemoryServerStore = { data: storeData, timestamp: now }
        return storeData
      }
    }
  } catch (err) {
    console.warn('Could not read store from MongoDB, falling back to defaultStoreData:', err)
  }

  return defaultStoreData
}

export async function getAllProducts(source?: any): Promise<Product[]> {
  const store = await getStoreDataForServer(source)
  return store.products || []
}

export async function getProductById(id: string, source?: any): Promise<Product | null> {
  const products = await getAllProducts(source)
  const found = products.find((p) => p.id === id)
  if (found) return found

  const fallback = (defaultStoreData.products || []).find((p) => p.id === id)
  return fallback || null
}
