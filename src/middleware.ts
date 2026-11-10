import { defineMiddleware } from 'astro:middleware'
import { initRuntimeEnv } from '@/lib/env'

export const onRequest = defineMiddleware((context, next) => {
  // Capture Cloudflare Workers runtime environment (bindings & secrets from Cloudflare dashboard)
  const cfEnv = (context.locals as any)?.runtime?.env
  if (cfEnv) {
    initRuntimeEnv(cfEnv)
  }
  return next()
})
