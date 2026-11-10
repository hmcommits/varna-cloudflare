import React, { useState, useEffect } from 'react'

export interface AppRouterInstance {
  push: (href: string) => void
  replace: (href: string) => void
  prefetch: (href: string) => void
  back: () => void
  forward: () => void
  refresh: () => void
}

export function useRouter(): AppRouterInstance {
  return {
    push: (href: string) => {
      if (typeof window !== 'undefined') {
        window.location.href = href
      }
    },
    replace: (href: string) => {
      if (typeof window !== 'undefined') {
        window.location.replace(href)
      }
    },
    prefetch: (_href: string) => {
      // Browser prefetch or no-op
    },
    back: () => {
      if (typeof window !== 'undefined') {
        window.history.back()
      }
    },
    forward: () => {
      if (typeof window !== 'undefined') {
        window.history.forward()
      }
    },
    refresh: () => {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    },
  }
}

export function usePathname(): string {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname
    }
    return '/'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname)

      const handlePop = () => {
        setPathname(window.location.pathname)
      }
      window.addEventListener('popstate', handlePop)
      return () => window.removeEventListener('popstate', handlePop)
    }
  }, [])

  return pathname
}

export function useSearchParams(): URLSearchParams {
  const [params, setParams] = useState<URLSearchParams>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search)
    }
    return new URLSearchParams()
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setParams(new URLSearchParams(window.location.search))
      const handlePop = () => {
        setParams(new URLSearchParams(window.location.search))
      }
      window.addEventListener('popstate', handlePop)
      return () => window.removeEventListener('popstate', handlePop)
    }
  }, [])

  return params
}
