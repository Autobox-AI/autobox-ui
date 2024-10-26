'use client'

import { formatDateTime } from '@/utils'

import { Simulation } from '@/schemas'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import InstructAgentModal from './InstructAgentModal'

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
  projectName,
  simulation,
}: {
  projectId: string
  projectName: string
  simulation: Simulation | undefined
}) => {
  const router = useRouter()

  const [traces, setTraces] = useState<string[]>([])
  const [localSimulation, setLocalSimulation] = useState(simulation)
  const [isLoadingTraces, setIsLoadingTraces] = useState(false)
  const [isTracesExpanded, setIsTracesExpanded] = useState(true)
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(true)
  const traceContainerRef = useRef<HTMLDivElement>(null)
  const [isAborting, setIsAborting] = useState(false)
  const [isInstructing, setIsInstructing] = useState(false)
  const [isInstructAgentModalOpen, setIsInstructAgentModalOpen] = useState(false)

  const handleAbortClick = async () => {
    setIsAborting(true)
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
      setIsAborting(false)
    }
  }

  const handleInstructAgentClick = () => {
    setIsInstructAgentModalOpen(true)
  }

  const handleInstructAgentModalClose = () => {
    setIsInstructAgentModalOpen(false)
  }

  const handleInstructAgentModalSubmit = async (agentId, message) => {
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
    }
  }

  const handleBackClick = () => {
    router.push(`/projects/${projectId}/simulations`)
  }

  const handleBackToProject = () => {
    router.push(`/projects/${projectId}`)
  }

  const handleBackToSimulations = () => {
    router.push(`/projects/${projectId}/simulations`)
  }

  useEffect(() => {
    if (!simulation || simulation?.status === 'in progress') return
    const fetchData = async () => {
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

    fetchData()
  }, [])

  useEffect(() => {
    if (!simulation || simulation.status !== 'in progress') return

    setIsLoadingTraces(true)

    const eventSource = new EventSource(
      `http://localhost:8000/simulations/${simulation.id}/traces?streaming=true`
    )

    eventSource.onmessage = (event) => {
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

        setTraces((prevTraces) => [...prevTraces, ...traces])
      } catch (error) {
        console.error('Error parsing traces', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error(`Error receiving traces for simulation ${simulation.id}:`, error)
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
        <button
          onClick={handleAbortClick}
          disabled={isAborting}
          className={`bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm rounded mr-2 transition-opacity duration-200 ${
            isAborting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          {isAborting ? 'Aborting...' : 'Abort'}
        </button>

        {/* Instruct Button */}
        <button
          onClick={handleInstructAgentClick}
          disabled={isInstructing}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded transition-opacity duration-200 ${
            isInstructing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          {isInstructing ? 'Sending Instruction...' : 'Instruct'}
        </button>
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
              <span className="loader inline-block mr-2 h-4 w-4"></span>
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

      {/* Modal for sending instruction */}
      <InstructAgentModal
        isOpen={isInstructAgentModalOpen}
        onClose={handleInstructAgentModalClose}
        onSubmit={handleInstructAgentModalSubmit}
        agents={simulation.agents}
      />
    </div>
  )
}

export default SimulationDetails
