import { useEffect, useRef } from 'react'

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

export function useRunPolling({ runs, onRunUpdate, pollingInterval = 3000 }: UseRunPollingProps) {
  const pollingRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

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
            const response = await fetch(`/api/runs/${run.id}`, {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache',
              },
            })
            if (!response.ok) {
              console.error(`Failed to fetch run ${run.id}:`, response.statusText)
              return
            }

            const updatedRun: Run = await response.json()

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
