import { useEffect, useRef } from 'react'

interface PerformanceMonitorProps {
  name: string
  enabled?: boolean
}

export function PerformanceMonitor({ name, enabled = true }: PerformanceMonitorProps) {
  const renderCount = useRef(0)
  const startTime = useRef<number>()

  useEffect(() => {
    if (!enabled) return

    renderCount.current += 1
    const now = performance.now()

    if (startTime.current) {
      const renderTime = now - startTime.current
      console.log(
        `[Performance] ${name} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`
      )
    }

    startTime.current = now
  })

  return null
}
