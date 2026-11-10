import type { APIRoute } from 'astro'
import { getSiteUrl, getStoreDataForServer } from '@/lib/serverStore'

export const prerender = false

export const GET: APIRoute = async ({ url }) => {
  const siteUrl = getSiteUrl(url.origin)
  const store = await getStoreDataForServer()
  const products = store.products || []
  const categories = (store.categories || []).filter((c) => c.visible !== false)
  const now = new Date().toISOString()

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

  xml += `  <url><loc>${siteUrl}/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`
  xml += `  <url><loc>${siteUrl}/products</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`

  for (const c of categories) {
    const encoded = encodeURIComponent(c.title)
    xml += `  <url><loc>${siteUrl}/products?category=${encoded}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>\n`
  }

  for (const p of products) {
    const lastMod = store.lastUpdated ? new Date(store.lastUpdated).toISOString() : now
    xml += `  <url><loc>${siteUrl}/products/${p.id}</loc><lastmod>${lastMod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`
  }

  xml += `</urlset>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
