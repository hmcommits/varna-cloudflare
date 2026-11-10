/**
 * Unified Environment Helper for Cloudflare Edge & Local Node.js
 * In Cloudflare Workers with @astrojs/cloudflare, runtime secrets added
 * in the Cloudflare Dashboard are provided via context.locals.runtime.env.
 * This helper bridges locals, globalThis, process.env and import.meta.env.
 */

export function initRuntimeEnv(cfEnv?: any) {
  if (cfEnv && typeof cfEnv === 'object') {
    ;(globalThis as any).__CF_ENV__ = {
      ...((globalThis as any).__CF_ENV__ || {}),
      ...cfEnv,
    }

    if (typeof process !== 'undefined') {
      try {
        if (!process.env) (process as any).env = {}
        Object.assign(process.env, cfEnv)
      } catch {
        // Ignore if process.env is read-only in some runtimes
      }
    }
  }
}

export function getRuntimeEnv(source?: any): Record<string, string> {
  const env: Record<string, string> = {}

  // 1. Astro / Vite build-time environment
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      Object.assign(env, (import.meta as any).env)
    }
  } catch {}

  // 2. Node.js process.env (active in local dev and populated by middleware)
  try {
    if (typeof process !== 'undefined' && process.env) {
      Object.assign(env, process.env)
    }
  } catch {}

  // 3. Global Cloudflare runtime environment (populated by middleware on each request)
  try {
    if ((globalThis as any).__CF_ENV__) {
      Object.assign(env, (globalThis as any).__CF_ENV__)
    }
  } catch {}

  // 4. Directly passed runtime source (context.locals, context.locals.runtime.env, or plain object)
  if (source && typeof source === 'object') {
    if (source.runtime?.env) {
      Object.assign(env, source.runtime.env)
    } else if (source.env) {
      Object.assign(env, source.env)
    } else {
      Object.assign(env, source)
    }
  }

  return env
}

export function getEnvVar(key: string, source?: any): string {
  const env = getRuntimeEnv(source)
  const val = env[key]
  if (typeof val === 'string') {
    return val.trim()
  }
  return ''
}
