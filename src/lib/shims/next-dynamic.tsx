import React, { lazy, Suspense } from 'react'

export interface DynamicOptions {
  loading?: () => React.ReactNode
  ssr?: boolean
}

export default function dynamic<P extends object>(
  loader: () => Promise<{ default: React.ComponentType<P> }>,
  options?: DynamicOptions
) {
  const LazyComponent = lazy(loader)

  return function DynamicComponent(props: P) {
    const fallback = options?.loading ? options.loading() : null
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}
