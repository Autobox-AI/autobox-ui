'use client'

import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load modal components to reduce initial bundle size
const LazyNewSimulationModal = lazy(() =>
  import('./NewSimulationModal').then((module) => ({
    default: module.default,
  }))
)

const LazyInstructAgentModal = lazy(() =>
  import('./InstructAgentModal').then((module) => ({
    default: module.default,
  }))
)

const LazyConfirmAbortModal = lazy(() =>
  import('./ConfirmAbortModal').then((module) => ({
    default: module.default,
  }))
)

// Modal loading skeleton
const ModalSkeleton = () => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
    <div className="bg-card bg-gray-800 p-6 rounded-lg w-1/2 h-[400px] flex flex-col">
      <Skeleton className="h-8 w-64 mb-4" />
      <div className="flex-1 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  </div>
)

// Wrapper components with suspense
export const NewSimulationModal = (props: any) => (
  <Suspense fallback={<ModalSkeleton />}>
    <LazyNewSimulationModal {...props} />
  </Suspense>
)

export const InstructAgentModal = (props: any) => (
  <Suspense fallback={<ModalSkeleton />}>
    <LazyInstructAgentModal {...props} />
  </Suspense>
)

export const ConfirmAbortModal = (props: any) => (
  <Suspense fallback={<ModalSkeleton />}>
    <LazyConfirmAbortModal {...props} />
  </Suspense>
)
