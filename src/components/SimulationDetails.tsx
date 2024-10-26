'use client'

import { formatDateTime } from '@/utils'

import { Simulation } from '@/schemas'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import ConfirmAbortModal from './ConfirmAbortModal'
import InstructAgentModal from './InstructAgentModal'
import { Button } from './ui/button'

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
  const searchParams = useSearchParams()
  const projectName = searchParams.get('projectName') ?? 'Unknown'

  const [traces, setTraces] = useState<string[]>([])
  const [loadingState, setLoadingState] = useState({
    isLoadingTraces: false,
    isInstructing: false,
    isAborting: false,
  })
  const [localSimulation, setLocalSimulation] = useState(simulation)
  const [isTracesExpanded, setIsTracesExpanded] = useState(true)
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(true)
  const traceContainerRef = useRef<HTMLDivElement>(null)
  const [isInstructAgentModalOpen, setIsInstructAgentModalOpen] = useState(false)
  const [isAbortModalOpen, setIsAbortModalOpen] = useState(false)

  const eventSourceRef = useRef<EventSource | null>(null)

  const handleAbortClick = () => {
    setIsAbortModalOpen(true)
  }

  const handleAbortConfirm = async () => {
    setIsAbortModalOpen(false)
    setLoadingState({ ...loadingState, isAborting: true })

    try {
      const response = await fetch(`http://localhost:8000/simulations/${simulation?.id}/abort`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to abort the simulation')
      }
    } catch (error) {
      console.error(error)
    } finally {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        console.log('EventSource closed manually on abort.')
      }
      setLoadingState({ ...loadingState, isAborting: false })
    }
  }

  const handleInstructAgentClick = () => {
    setIsInstructAgentModalOpen(true)
  }

  const handleInstructAgentModalClose = () => {
    setIsInstructAgentModalOpen(false)
  }

  const handleInstructAgentModalSubmit = async (agentId: string, message: string) => {
    setLoadingState({ ...loadingState, isInstructing: true })
    try {
      const response = await fetch(
        `http://localhost:8000/simulations/${simulation?.id}/agents/${agentId}/instruction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instruction: message,
          }),
        }
      )
      if (!response.ok) {
        throw new Error('Failed to send instruction')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingState({ ...loadingState, isInstructing: false })
      setIsInstructAgentModalOpen(false)
    }
  }

  const handleBackToProject = () => {
    router.push(`/projects/${projectId}`)
  }

  // hook for streaming simulation updates
  useEffect(() => {
    if (localSimulation?.status !== 'in progress') {
      return
    }

    const eventSource = new EventSource(
      `http://localhost:8000/simulations/${localSimulation.id}?streaming=true`
    )

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as Simulation
      setLocalSimulation(data)
      if (data.progress >= 100 || data.status !== 'in progress') {
        eventSource.close()
      }
    }

    eventSource.onerror = () => {
      console.error(`Error with EventSource for simulation ${localSimulation.id}`)
      eventSource.close()
    }

    // Cleanup function to close all EventSource instances when the component unmounts
    return () => {
      if (eventSource) {
        eventSource.close()
        console.log('EventSource closed during cleanup.')
      }
    }
  }, [localSimulation, setLocalSimulation])

  // Hook to fetch traces for the simulation
  useEffect(() => {
    if (simulation?.status === 'in progress') return
    const fetchTraces = async () => {
      try {
        const response = await fetch(`http://localhost:8000/simulations/${simulation?.id}/traces`)
        if (!response.ok) {
          throw new Error('Error fetching data')
        }
        const result = await response.json()
        setTraces(result)
      } catch (err) {
        console.error(err)
      }
      return
    }

    fetchTraces()
  }, [simulation])

  // Hook to listen for streaming simulation traces
  useEffect(() => {
    if (!simulation || simulation.status !== 'in progress') {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        console.log('EventSource closed as simulation is not in progress.')
      }
      return
    }

    setLoadingState({ ...loadingState, isLoadingTraces: true })

    const eventSource = new EventSource(
      `http://localhost:8000/simulations/${simulation.id}/traces?streaming=true`
    )
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      if (!simulation) return
      try {
        const data = JSON.parse(event.data)
        const { traces, progress, status } = data
        setLocalSimulation((prevSimulation) => {
          if (prevSimulation) {
            prevSimulation.progress = progress
            prevSimulation.status = status
          }
          return prevSimulation
        })
        setTraces(traces)
        if (progress === 100 || status !== 'in progress') {
          eventSource.close()
        }
      } catch (error) {
        console.error('Error parsing traces', error)
        eventSource.close()
      }
    }

    eventSource.onerror = (error) => {
      console.error(`Error receiving traces for simulation ${simulation.id}:`, error)
      eventSource.close()
      setLoadingState({ ...loadingState, isLoadingTraces: false })
    }

    eventSource.onopen = () => {
      setLoadingState({ ...loadingState, isLoadingTraces: false })
    }

    return () => {
      if (eventSource) {
        eventSource.close()
        console.log('EventSource closed during cleanup.')
      }
    }
  }, [simulation?.id, simulation?.status])

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
      <div className="text-foreground p-6">
        <h1 className="text-2xl font-bold mb-4">Simulation not found</h1>
      </div>
    )
  }

  return (
    <div className="text-foreground p-6 pt-0">
      {/* <button
        onClick={handleBackClick}
        className="bg-transparent border border-gray-600 text-gray-300 hover:text-white px-3 py-1 text-sm rounded mb-6 transition-colors duration-200"
      >
        ← Back to Simulations
      </button> */}
      <div className="text-sm text-gray-400 mb-6 mt-2">
        <span
          className="cursor-pointer hover:underline text-gray-300"
          onClick={() => router.push('/')}
        >
          Home
        </span>
        {' -> '}
        <span
          className="cursor-pointer hover:underline text-gray-300"
          onClick={handleBackToProject}
        >
          {projectName}
        </span>
        {' -> '}
        <span className="text-gray-100">{simulation.name}</span>
      </div>

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

      <div className="mb-8">
        {/* Abort Button */}
        <Button
          onClick={handleAbortClick}
          disabled={loadingState.isAborting || localSimulation?.status !== 'in progress'}
          className={`bg-transparent border border-gray-600 text-gray-300 hover:text-white hover:bg-red-700 text-white px-3 py-1 text-sm rounded mr-2 transition-opacity duration-200 aria-labels ${
            loadingState.isAborting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          {loadingState.isAborting ? 'Aborting...' : 'Abort'}
        </Button>

        {/* Instruct Button */}
        <Button
          onClick={handleInstructAgentClick}
          disabled={loadingState.isInstructing || localSimulation?.status !== 'in progress'}
          className={`bg-transparent border border-gray-600 text-gray-300 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded transition-opacity duration-200 aria-labels ${
            loadingState.isInstructing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          {loadingState.isInstructing ? 'Sending Instruction...' : 'Instruct'}
        </Button>
      </div>

      {/* Simulation details */}
      {localSimulation && (
        <div className="mb-4">
          <p>
            <strong>Started:</strong> {formatDateTime(localSimulation.started_at)}
          </p>
          {simulation.finished_at && (
            <p>
              <strong>Finished:</strong> {formatDateTime(simulation.finished_at)}
            </p>
          )}
          {simulation.aborted_at && (
            <p>
              <strong>Aborted:</strong> {formatDateTime(simulation.aborted_at)}
            </p>
          )}
          {/* Only show Elapsed time if either finished_at or aborted_at is present */}
          {(simulation.finished_at || simulation.aborted_at) && (
            <p>
              <strong>Elapsed time:</strong>
              <span>
                {` ${Math.round(
                  ((simulation.finished_at
                    ? new Date(simulation.finished_at).getTime()
                    : new Date(simulation.aborted_at!).getTime()) -
                    new Date(simulation.started_at).getTime()) /
                    1000
                )} seconds`}
              </span>
            </p>
          )}
          <p className="flex items-center">
            <span>
              <strong>Status:</strong>
            </span>
            {localSimulation.status === 'in progress' && (
              <span className="ml-2 flex items-center">
                <span className="loader inline-block mr-2 h-4 w-4"></span>
                <span>running...</span>
              </span>
            )}
            {localSimulation.status === 'completed' && <span className="ml-2">✅</span>}
            {localSimulation.status === 'failed' && (
              <span className="ml-2" style={{ color: 'red' }}>
                ❌ Failed
              </span>
            )}
            {localSimulation.status === 'aborted' && (
              <span className="ml-2" style={{ color: 'orange' }}>
                ⚠️ Aborted
              </span>
            )}
          </p>
          {/* Show progress bar if progress is less than 100 */}
          <p>
            <strong>Progress:</strong> {localSimulation.progress}%
          </p>
          {(localSimulation.progress < 100 || localSimulation.status === 'aborted') && (
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
              <div
                className={`h-2.5 rounded-full ${
                  simulation.status === 'aborted' ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                style={{ width: `${localSimulation.progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Collapsible traces container */}
      <div
        onClick={() => setIsTracesExpanded(!isTracesExpanded)} // Toggle expand/collapse
        className="bg-gray-800 text-foreground px-4 py-2 rounded-lg cursor-pointer mb-4 flex justify-between items-center"
      >
        <span className="font-bold">Traces</span>
        <span>{isTracesExpanded ? '▲' : '▼'}</span>
      </div>

      {/* Traces display (conditionally rendered) */}
      {isTracesExpanded && (
        <div
          ref={traceContainerRef}
          className="bg-slate-900 p-4 rounded-lg text-green-400 font-mono overflow-y-auto
                   h-64 sm:h-80 md:h-96 lg:h-[32rem] xl:h-[40rem]"
        >
          {loadingState.isLoadingTraces && <p>Loading traces...</p>}
          {traces.length === 0 && !loadingState.isLoadingTraces ? (
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
        className="bg-gray-800 text-foreground px-4 py-2 rounded-lg cursor-pointer mb-4 flex justify-between items-center"
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

      {/* Modal for abort confirmation */}
      <ConfirmAbortModal
        isOpen={isAbortModalOpen}
        onClose={() => setIsAbortModalOpen(false)}
        onConfirm={handleAbortConfirm}
      />

      {/* Modal for sending instruction */}
      <InstructAgentModal
        isOpen={isInstructAgentModalOpen}
        onClose={handleInstructAgentModalClose}
        onSubmit={handleInstructAgentModalSubmit}
        agents={[...simulation.agents, simulation.orchestrator]}
      />
    </div>
  )
}

export default SimulationDetails
