import type { APIRoute } from 'astro'
import { getSiteUrl } from '@/lib/serverStore'

export const prerender = false

export const GET: APIRoute = async ({ url }) => {
  const siteUrl = getSiteUrl(url.origin)

  const robotsTxt = `User-agent: *
Allow: /
Allow: /products
Allow: /products/*
Disallow: /admin
Disallow: /admin/*
Disallow: /api
Disallow: /api/*

User-agent: Googlebot
Allow: /
Allow: /products
Allow: /products/*
Disallow: /admin
Disallow: /admin/*
Disallow: /api
Disallow: /api/*

Sitemap: ${siteUrl}/sitemap.xml
Host: ${siteUrl}
`

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400',
    },
  })
}
