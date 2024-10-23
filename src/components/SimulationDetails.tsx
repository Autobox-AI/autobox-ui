'use client'

import { formatDateTime } from '@/utils'

import { Simulation } from '@/schemas'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type SimulationDetailsProps = {
  simulation: {
    id: string
    name: string
    started_at: string
    finished_at?: string
    status: string
    progress: number
  }
}

const SimulationDetails = ({
  projectId,
  simulation,
}: {
  projectId: string
  simulation: Simulation | undefined
}) => {
  const router = useRouter()

  const [traces, setTraces] = useState<string[]>([])
  const [isLoadingTraces, setIsLoadingTraces] = useState(false)
  const [isTracesExpanded, setIsTracesExpanded] = useState(true)
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(true)
  const traceContainerRef = useRef<HTMLDivElement>(null)

  const handleBackClick = () => {
    router.push(`/projects/${projectId}/simulations`)
  }

  useEffect(() => {
    if (!simulation) return

    setIsLoadingTraces(true)

    const eventSource = new EventSource(
      `http://localhost:8000/simulations/${simulation.id}/traces?streaming=true`
    )

    eventSource.onmessage = (event) => {
      // event.data is a string of a JSON array. Parse and take the first element and appended to the traces array
      //   const data = JSON.parse(event.data) as string[]
      const data = JSON.parse(event.data)

      // Extract the traces and progress from the data
      const { traces, progress, status } = data
      simulation.progress = progress
      simulation.status = status

      setTraces((prevTraces) => [...prevTraces, ...traces])
    }

    eventSource.onerror = () => {
      console.error(`Error receiving traces for simulation ${simulation.id}`)
      eventSource.close()
      setIsLoadingTraces(false)
    }

    eventSource.onopen = () => {
      setIsLoadingTraces(false)
    }

    return () => {
      eventSource.close()
    }
  }, [simulation])

  useEffect(() => {
    if (traceContainerRef.current) {
      traceContainerRef.current.scrollTop = traceContainerRef.current.scrollHeight
    }
  }, [traces])

  useEffect(() => {
    if (isTracesExpanded && traceContainerRef.current) {
      traceContainerRef.current.scrollTop = traceContainerRef.current.scrollHeight
    }
  }, [isTracesExpanded])

  if (!simulation) {
    return (
      <div className="text-white p-6">
        <h1 className="text-2xl font-bold mb-4">Simulation not found</h1>
      </div>
    )
  }

  return (
    <div className="text-white p-6">
      <button
        onClick={handleBackClick}
        className="bg-blue-500 text-white px-3 py-1 text-sm rounded mb-6"
      >
        ← Back to Simulations
      </button>
      <h1 className="text-2xl font-bold mb-4">Simulation: {simulation.name}</h1>

      {/* Link to Dashboards */}
      <div className="mb-4 text-sm">
        <a
          href={simulation.internal_dashboard_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          Go to Dashboard
        </a>
      </div>

      {/* Simulation details */}
      <div className="mb-4">
        <p>
          <strong>Started:</strong> {formatDateTime(simulation.started_at)}
        </p>
        {simulation.finished_at && (
          <p>
            <strong>Finished:</strong> {formatDateTime(simulation.finished_at)}
          </p>
        )}
        <p className="flex items-center">
          <span>
            <strong>Status:</strong>
          </span>
          {simulation.status === 'in progress' && (
            <span className="ml-2 flex items-center">
              <div className="loader inline-block mr-2 h-4 w-4"></div>
              <span>running...</span>
            </span>
          )}
          {simulation.status === 'completed' && <span className="ml-2">✅</span>}
          {simulation.status === 'failed' && (
            <span className="ml-2" style={{ color: 'red' }}>
              ❌ Failed
            </span>
          )}
          {simulation.status === 'aborted' && (
            <span className="ml-2" style={{ color: 'orange' }}>
              ⚠️ Aborted
            </span>
          )}
        </p>
        {/* Show progress bar if progress is less than 100 */}
        <p>
          <strong>Progress:</strong> {simulation.progress}%
        </p>
        {simulation.progress < 100 && (
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${simulation.progress}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Collapsible traces container */}
      <div
        onClick={() => setIsTracesExpanded(!isTracesExpanded)} // Toggle expand/collapse
        className="bg-gray-800 text-white px-4 py-2 rounded-lg cursor-pointer mb-4 flex justify-between items-center"
      >
        <span className="font-bold">Traces</span>
        <span>{isTracesExpanded ? '▲' : '▼'}</span>
      </div>

      {/* Traces display (conditionally rendered) */}
      {isTracesExpanded && (
        <div
          ref={traceContainerRef}
          className="bg-black p-4 rounded-lg text-green-400 font-mono overflow-y-auto
                   h-64 sm:h-80 md:h-96 lg:h-[32rem] xl:h-[40rem]"
        >
          {isLoadingTraces && <p>Loading traces...</p>}
          {traces.length === 0 && !isLoadingTraces ? (
            <p>No traces available yet.</p>
          ) : (
            traces.map((trace, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {trace}
              </div>
            ))
          )}
        </div>
      )}

      <div
        onClick={() => setIsDashboardExpanded(!isDashboardExpanded)}
        className="bg-gray-800 text-white px-4 py-2 rounded-lg cursor-pointer mb-4 flex justify-between items-center"
      >
        <span className="font-bold">Metrics</span>
        <span>{isDashboardExpanded ? '▲' : '▼'}</span>
      </div>
      {/* Embedding the URL */}
      {isDashboardExpanded && simulation.internal_dashboard_url && (
        <div className="mt-6">
          <iframe
            src={simulation.internal_dashboard_url}
            width="100%"
            height="600"
            frameBorder="0"
          ></iframe>
        </div>
      )}
    </div>
  )
}

export default SimulationDetails
