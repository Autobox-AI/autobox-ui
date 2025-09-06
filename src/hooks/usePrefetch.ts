/**
 * Data prefetching hook for faster navigation
 * Prefetches run details, traces, and metrics when user hovers over run rows
 */

import { useCallback, useEffect, useRef } from 'react'

interface PrefetchConfig {
  enabled?: boolean
  delay?: number
  priority?: 'high' | 'low'
}

interface PrefetchCache {
  [key: string]: {
    data: any
    timestamp: number
    loading: boolean
  }
}

const prefetchCache: PrefetchCache = {}
const prefetchPromises = new Map<string, Promise<any>>()

export function usePrefetch(config: PrefetchConfig = {}) {
  const { enabled = true, delay = 300, priority = 'low' } = config
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const prefetchRunDetails = useCallback(
    async (runId: string) => {
      if (!enabled || !runId) return

      const cacheKey = `run-${runId}`

      if (prefetchCache[cacheKey]?.data || prefetchPromises.has(cacheKey)) {
        return
      }

      prefetchCache[cacheKey] = {
        data: null,
        timestamp: Date.now(),
        loading: true,
      }

      try {
        const promise = fetch(`/api/runs/${runId}`, {
          headers: {
            'Cache-Control': 'max-age=60',
          },
        }).then((response) => response.json())

        prefetchPromises.set(cacheKey, promise)
        const data = await promise

        prefetchCache[cacheKey] = {
          data,
          timestamp: Date.now(),
          loading: false,
        }
      } catch (error) {
        console.warn('Prefetch failed for run:', runId, error)
        delete prefetchCache[cacheKey]
      } finally {
        prefetchPromises.delete(cacheKey)
      }
    },
    [enabled]
  )

  const prefetchRunTraces = useCallback(
    async (runId: string) => {
      if (!enabled || !runId) return

      const cacheKey = `traces-${runId}`

      if (prefetchCache[cacheKey]?.data || prefetchPromises.has(cacheKey)) {
        return
      }

      prefetchCache[cacheKey] = {
        data: null,
        timestamp: Date.now(),
        loading: true,
      }

      try {
        const promise = fetch(`/api/runs/${runId}/traces`, {
          headers: {
            'Cache-Control': 'max-age=30',
          },
        }).then((response) => response.json())

        prefetchPromises.set(cacheKey, promise)
        const data = await promise

        prefetchCache[cacheKey] = {
          data,
          timestamp: Date.now(),
          loading: false,
        }
      } catch (error) {
        console.warn('Prefetch failed for traces:', runId, error)
        delete prefetchCache[cacheKey]
      } finally {
        prefetchPromises.delete(cacheKey)
      }
    },
    [enabled]
  )

  const prefetchRunMetrics = useCallback(
    async (runId: string) => {
      if (!enabled || !runId) return

      const cacheKey = `metrics-${runId}`

      if (prefetchCache[cacheKey]?.data || prefetchPromises.has(cacheKey)) {
        return
      }

      prefetchCache[cacheKey] = {
        data: null,
        timestamp: Date.now(),
        loading: true,
      }

      try {
        const promise = fetch(`/api/runs/${runId}/metrics`, {
          headers: {
            'Cache-Control': 'max-age=60',
          },
        }).then((response) => response.json())

        prefetchPromises.set(cacheKey, promise)
        const data = await promise

        prefetchCache[cacheKey] = {
          data,
          timestamp: Date.now(),
          loading: false,
        }
      } catch (error) {
        console.warn('Prefetch failed for metrics:', runId, error)
        delete prefetchCache[cacheKey]
      } finally {
        prefetchPromises.delete(cacheKey)
      }
    },
    [enabled]
  )

  const prefetchRun = useCallback(
    (runId: string) => {
      if (!enabled) return

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        prefetchRunDetails(runId)
        prefetchRunTraces(runId)
        prefetchRunMetrics(runId)
      }, delay)
    },
    [enabled, delay, prefetchRunDetails, prefetchRunTraces, prefetchRunMetrics]
  )

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const getPrefetchedData = useCallback((type: 'run' | 'traces' | 'metrics', runId: string) => {
    const cacheKey = `${type === 'run' ? 'run' : type}-${runId}`
    const cached = prefetchCache[cacheKey]

    if (!cached || Date.now() - cached.timestamp > 300000) {
      return null
    }

    return cached.data
  }, [])

  const isPrefetched = useCallback((type: 'run' | 'traces' | 'metrics', runId: string) => {
    const cacheKey = `${type === 'run' ? 'run' : type}-${runId}`
    const cached = prefetchCache[cacheKey]

    return cached?.data && Date.now() - cached.timestamp < 300000
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    prefetchRun,
    prefetchRunDetails,
    prefetchRunTraces,
    prefetchRunMetrics,
    cancelPrefetch,
    getPrefetchedData,
    isPrefetched,
  }
}

setInterval(() => {
  const now = Date.now()
  Object.keys(prefetchCache).forEach((key) => {
    if (now - prefetchCache[key].timestamp > 300000) {
      delete prefetchCache[key]
    }
  })
}, 60000)
