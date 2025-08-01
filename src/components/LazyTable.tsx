'use client'

import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Lazy load table components to reduce initial bundle size
const LazyToolsTable = lazy(() =>
  import('./ToolsTable').then((module) => ({
    default: module.default,
  }))
)

const LazyVirtualizedList = lazy(() =>
  import('./VirtualizedList').then((module) => ({
    default: module.default,
  }))
)

// Enhanced table loading skeleton that looks more realistic
const TableSkeleton = () => (
  <div className="w-full space-y-4">
    {/* Search and controls skeleton */}
    <div className="flex items-center space-x-2">
      <Input placeholder="Filter tools..." className="max-w-sm" disabled />
      <Button variant="outline" className="ml-auto" disabled>
        Columns <span className="ml-2">▼</span>
      </Button>
    </div>

    {/* Table skeleton */}
    <div className="border rounded-md">
      {/* Header */}
      <div className="h-12 border-b bg-muted/50 flex items-center px-4 space-x-4">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-8" />
      </div>

      {/* Rows with more realistic spacing */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-16 border-b flex items-center px-4 space-x-4 hover:bg-muted/30 transition-colors"
        >
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-6 w-6" />
        </div>
      ))}
    </div>

    {/* Pagination skeleton */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-40" />
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      </div>
    </div>
  </div>
)

// List loading skeleton
const ListSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="p-4 border rounded-md">
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ))}
  </div>
)

// Wrapper components with suspense
export const ToolsTable = (props: any) => (
  <Suspense fallback={<TableSkeleton />}>
    <LazyToolsTable {...props} />
  </Suspense>
)

export const VirtualizedList = (props: any) => (
  <Suspense fallback={<ListSkeleton />}>
    <LazyVirtualizedList {...props} />
  </Suspense>
)

export default ToolsTable
