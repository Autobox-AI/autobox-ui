'use client'

import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Lazy load metrics components to reduce bundle size for non-metrics pages
const LazyCounterMetric = lazy(() =>
  import('./metrics/CounterMetric').then((module) => ({
    default: module.CounterMetric,
  }))
)

const LazyGaugeMetric = lazy(() =>
  import('./metrics/GaugeMetric').then((module) => ({
    default: module.GaugeMetric,
  }))
)

const LazyRunGaugeMetric = lazy(() =>
  import('./metrics/GaugeMetric').then((module) => ({
    default: module.RunGaugeMetric,
  }))
)

const LazyHistogramMetric = lazy(() =>
  import('./metrics/HistogramMetric').then((module) => ({
    default: module.HistogramMetric,
  }))
)

// Metric loading skeleton
const MetricSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <Skeleton className="h-4 w-32" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-48" />
    </CardContent>
  </Card>
)

// Chart metric loading skeleton
const ChartMetricSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48 mb-2" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </CardContent>
  </Card>
)

// Wrapper components with suspense
export const CounterMetric = (props: any) => (
  <Suspense fallback={<MetricSkeleton />}>
    <LazyCounterMetric {...props} />
  </Suspense>
)

export const GaugeMetric = (props: any) => (
  <Suspense fallback={<MetricSkeleton />}>
    <LazyGaugeMetric {...props} />
  </Suspense>
)

export const RunGaugeMetric = (props: any) => (
  <Suspense fallback={<ChartMetricSkeleton />}>
    <LazyRunGaugeMetric {...props} />
  </Suspense>
)

export const HistogramMetric = (props: any) => (
  <Suspense fallback={<MetricSkeleton />}>
    <LazyHistogramMetric {...props} />
  </Suspense>
)
