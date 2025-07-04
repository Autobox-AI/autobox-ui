'use client'

import { ComponentType, Suspense, lazy } from 'react'

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  props?: Record<string, any>
}

const LazyComponent = ({ component, fallback, props = {} }: LazyComponentProps) => {
  const LazyLoadedComponent = lazy(component)

  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyLoadedComponent {...props} />
    </Suspense>
  )
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
  </div>
)

export default LazyComponent
