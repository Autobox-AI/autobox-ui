import { useEffect, useRef } from 'react'

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

async function fetchRunWithDeduplication(runId: string): Promise<Run> {
  const cacheKey = runId
  const now = Date.now()
  const lastRequest = requestTimestamps.get(cacheKey)

  if (lastRequest && now - lastRequest < 1000 && requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey)!
  }

  const requestPromise = fetch(`/api/runs/${runId}`, {
    headers: {
      'Cache-Control': 'max-age=30',
    },
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch run ${runId}: ${response.statusText}`)
    }
    return response.json()
  })

  requestCache.set(cacheKey, requestPromise)
  requestTimestamps.set(cacheKey, now)

  requestPromise.finally(() => {
    setTimeout(() => {
      requestCache.delete(cacheKey)
      requestTimestamps.delete(cacheKey)
    }, 5000)
  })

  return requestPromise
}

export function useRunPolling({ runs, onRunUpdate, pollingInterval = 3000 }: UseRunPollingProps) {
  const pollingRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const lastUpdateTimes = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    pollingRefs.current.forEach((interval) => clearInterval(interval))
    pollingRefs.current.clear()

    runs.forEach((run) => {
      if (
        run.status === 'in progress' ||
        run.status === 'created' ||
        (run.status === 'completed' && !run.summary)
      ) {
        const interval = setInterval(async () => {
          try {
            const updatedRun = await fetchRunWithDeduplication(run.id)

            const lastUpdateTime = lastUpdateTimes.current.get(run.id) || 0
            const runUpdateTime = new Date(updatedRun.updated_at).getTime()

            if (runUpdateTime <= lastUpdateTime) {
              return
            }

            lastUpdateTimes.current.set(run.id, runUpdateTime)

            console.log(`Polling run ${run.id}:`, {
              status: updatedRun.status,
              progress: updatedRun.progress,
              timestamp: new Date().toISOString(),
            })

            onRunUpdate(updatedRun)

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

    return () => {
      pollingRefs.current.forEach((interval) => clearInterval(interval))
      pollingRefs.current.clear()
    }
  }, [runs, onRunUpdate, pollingInterval])

  const stopPolling = (runId: string) => {
    const interval = pollingRefs.current.get(runId)
    if (interval) {
      clearInterval(interval)
      pollingRefs.current.delete(runId)
    }
  }

  return { stopPolling }
}
