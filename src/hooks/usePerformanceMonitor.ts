import { useCallback, useEffect, useRef } from 'react'

interface PerformanceMetrics {
  renderTime: number
  memoryUsage?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
  networkInfo?: {
    effectiveType: string
    downlink: number
    rtt: number
  }
  resourceTiming: PerformanceEntry[]
  navigationTiming: PerformanceNavigationTiming | null
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean
  onMetrics?: (metrics: PerformanceMetrics) => void
  logToConsole?: boolean
  trackMemory?: boolean
  trackNetwork?: boolean
  trackResources?: boolean
}

export function usePerformanceMonitor(
  componentName: string,
  options: UsePerformanceMonitorOptions = {}
) {
  const {
    enabled = true,
    onMetrics,
    logToConsole = true,
    trackMemory = true,
    trackNetwork = true,
    trackResources = true,
  } = options

  const renderCount = useRef(0)
  const startTime = useRef<number>()
  const lastMetrics = useRef<PerformanceMetrics | null>(null)

  // Get memory usage if available
  const getMemoryUsage = useCallback((): PerformanceMetrics['memoryUsage'] => {
    if (!trackMemory || !('memory' in performance)) return undefined

    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    }
  }, [trackMemory])

  // Get network information if available
  const getNetworkInfo = useCallback((): PerformanceMetrics['networkInfo'] => {
    if (!trackNetwork || !('connection' in navigator)) return undefined

    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
    }
  }, [trackNetwork])

  // Get resource timing
  const getResourceTiming = useCallback((): PerformanceEntry[] => {
    if (!trackResources) return []

    return performance.getEntriesByType('resource').slice(-10) // Last 10 resources
  }, [trackResources])

  // Get navigation timing
  const getNavigationTiming = useCallback((): PerformanceNavigationTiming | null => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigation || null
  }, [])

  // Calculate and log metrics
  const calculateMetrics = useCallback((): PerformanceMetrics => {
    const now = performance.now()
    const renderTime = startTime.current ? now - startTime.current : 0

    const metrics: PerformanceMetrics = {
      renderTime,
      memoryUsage: getMemoryUsage(),
      networkInfo: getNetworkInfo(),
      resourceTiming: getResourceTiming(),
      navigationTiming: getNavigationTiming(),
    }

    lastMetrics.current = metrics

    if (logToConsole) {
      console.group(`🚀 [Performance] ${componentName} #${renderCount.current}`)
      console.log(`Render time: ${renderTime.toFixed(2)}ms`)

      if (metrics.memoryUsage) {
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = metrics.memoryUsage
        console.log(
          `Memory: ${(usedJSHeapSize / 1024 / 1024).toFixed(2)}MB / ${(totalJSHeapSize / 1024 / 1024).toFixed(2)}MB (${(jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB limit)`
        )
      }

      if (metrics.networkInfo) {
        const { effectiveType, downlink, rtt } = metrics.networkInfo
        console.log(`Network: ${effectiveType} (${downlink}Mbps, ${rtt}ms RTT)`)
      }

      if (metrics.navigationTiming) {
        const { domContentLoadedEventEnd, loadEventEnd } = metrics.navigationTiming
        console.log(
          `DOM Ready: ${(domContentLoadedEventEnd - domContentLoadedEventEnd).toFixed(2)}ms`
        )
        console.log(`Page Load: ${(loadEventEnd - loadEventEnd).toFixed(2)}ms`)
      }

      console.groupEnd()
    }

    onMetrics?.(metrics)
    return metrics
  }, [
    componentName,
    logToConsole,
    onMetrics,
    getMemoryUsage,
    getNetworkInfo,
    getResourceTiming,
    getNavigationTiming,
  ])

  // Monitor render performance
  useEffect(() => {
    if (!enabled) return

    renderCount.current += 1
    const now = performance.now()

    if (startTime.current) {
      calculateMetrics()
    }

    startTime.current = now
  })

  // Monitor long tasks
  useEffect(() => {
    if (!enabled) return

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          // Tasks longer than 50ms
          console.warn(`⚠️ Long task detected in ${componentName}:`, {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
          })
        }
      })
    })

    observer.observe({ entryTypes: ['longtask'] })

    return () => observer.disconnect()
  }, [enabled, componentName])

  // Monitor layout shifts
  useEffect(() => {
    if (!enabled) return

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.value > 0.1) {
          // Layout shifts greater than 0.1
          console.warn(`⚠️ Layout shift detected in ${componentName}:`, {
            value: entry.value,
            sources: entry.sources,
          })
        }
      })
    })

    observer.observe({ entryTypes: ['layout-shift'] })

    return () => observer.disconnect()
  }, [enabled, componentName])

  // Monitor first input delay
  useEffect(() => {
    if (!enabled) return

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        console.log(`🎯 First input delay in ${componentName}:`, {
          processingStart: entry.processingStart,
          processingEnd: entry.processingEnd,
          startTime: entry.startTime,
        })
      })
    })

    observer.observe({ entryTypes: ['first-input'] })

    return () => observer.disconnect()
  }, [enabled, componentName])

  // Return utility functions
  return {
    getMetrics: () => lastMetrics.current,
    calculateMetrics,
    renderCount: renderCount.current,
    isEnabled: enabled,
  }
}
