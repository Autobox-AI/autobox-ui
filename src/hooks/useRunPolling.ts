import { useEffect, useRef } from 'react'

// Request deduplication cache
const requestCache = new Map<string, Promise<Run>>()
const requestTimestamps = new Map<string, number>()

interface Run {
  id: string
  simulation_id: string
  status: string
  progress: number
  started_at: string
  finished_at?: string
  updated_at: string
  summary?: string
  observation?: string
}

interface UseRunPollingProps {
  runs: Run[]
  onRunUpdate: (updatedRun: Run) => void
  pollingInterval?: number
}

// Deduplicated fetch function
async function fetchRunWithDeduplication(runId: string): Promise<Run> {
  const cacheKey = runId
  const now = Date.now()
  const lastRequest = requestTimestamps.get(cacheKey)
  
  // If there's a pending request less than 1 second old, reuse it
  if (lastRequest && now - lastRequest < 1000 && requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey)!
  }
  
  // Create new request
  const requestPromise = fetch(`/api/runs/${runId}`, {
    headers: {
      'Cache-Control': 'max-age=30', // Allow 30 second cache
    },
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch run ${runId}: ${response.statusText}`)
    }
    return response.json()
  })
  
  // Cache the request
  requestCache.set(cacheKey, requestPromise)
  requestTimestamps.set(cacheKey, now)
  
  // Clean up cache after request completes
  requestPromise.finally(() => {
    setTimeout(() => {
      requestCache.delete(cacheKey)
      requestTimestamps.delete(cacheKey)
    }, 5000) // Clean up after 5 seconds
  })
  
  return requestPromise
}

export function useRunPolling({ runs, onRunUpdate, pollingInterval = 3000 }: UseRunPollingProps) {
  const pollingRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const lastUpdateTimes = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    // Clear all existing polling intervals
    pollingRefs.current.forEach((interval) => clearInterval(interval))
    pollingRefs.current.clear()

    // Start polling for runs that are in progress or completed but waiting for summary
    runs.forEach((run) => {
      if (
        run.status === 'in progress' ||
        run.status === 'created' ||
        (run.status === 'completed' && !run.summary)
      ) {
        const interval = setInterval(async () => {
          try {
            const updatedRun = await fetchRunWithDeduplication(run.id)
            
            // Check if data actually changed to avoid unnecessary updates
            const lastUpdateTime = lastUpdateTimes.current.get(run.id) || 0
            const runUpdateTime = new Date(updatedRun.updated_at).getTime()
            
            if (runUpdateTime <= lastUpdateTime) {
              return // No change, skip update
            }
            
            lastUpdateTimes.current.set(run.id, runUpdateTime)

            console.log(`Polling run ${run.id}:`, {
              status: updatedRun.status,
              progress: updatedRun.progress,
              timestamp: new Date().toISOString(),
            })

            // Update the run data
            onRunUpdate(updatedRun)

            // Stop polling if the run is completed and has a summary, or if it failed/aborted
            if (
              (updatedRun.status === 'completed' && updatedRun.summary) ||
              updatedRun.status === 'failed' ||
              updatedRun.status === 'aborted'
            ) {
              clearInterval(interval)
              pollingRefs.current.delete(run.id)
            }
          } catch (error) {
            console.error(`Error polling run ${run.id}:`, error)
          }
        }, pollingInterval)

        pollingRefs.current.set(run.id, interval)
      }
    })

    // Cleanup function
    return () => {
      pollingRefs.current.forEach((interval) => clearInterval(interval))
      pollingRefs.current.clear()
    }
  }, [runs, onRunUpdate, pollingInterval])

  // Return a function to manually stop polling for a specific run
  const stopPolling = (runId: string) => {
    const interval = pollingRefs.current.get(runId)
    if (interval) {
      clearInterval(interval)
      pollingRefs.current.delete(runId)
    }
  }

  return { stopPolling }
}
