'use client'

import { useProjectData } from '@/components/ProjectContext'
import { useRouter } from 'next/navigation'

const SimulationDetails = ({ params }) => {
  const { pid: projectId, sid: simulationId } = params // Extract projectId and simulationId
  const router = useRouter()

  const { projectsById, projects, loading, error } = useProjectData()

  // Sample simulations data
  const simulationsData = {
    '1': [
      {
        id: '1',
        name: 'Simulation A',
        startedAt: '2023-10-01',
        finishedAt: '2023-10-02',
        status: 'success',
      },
    ],
    '2': [
      {
        id: '2',
        name: 'Simulation B',
        startedAt: '2023-09-29',
        finishedAt: '2023-09-30',
        status: 'success',
      },
    ],
    '3': [
      {
        id: '3',
        name: 'Simulation C',
        startedAt: '2023-09-25',
        finishedAt: '2023-09-26',
        status: 'failed',
      },
    ],
  }

  // Find the simulation based on projectId and simulationId
  const simulation = projectsById[projectId]?.simulations?.find((sim) => sim.id === simulationId)

  if (!simulation) {
    return (
      <div className="text-white p-6">
        <h1 className="text-2xl font-bold mb-4">Simulation not found</h1>
        <button
          onClick={() => router.push(`/projects/${projectId}/simulations`)}
          className="bg-blue-500 text-white p-2 mt-4 rounded"
        >
          Back to Simulations
        </button>
      </div>
    )
  }

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">{simulation.name}</h1>
      <p>Started: {simulation.started_at}</p>
      <p>Finished: {simulation.finished_at}</p>
      <p>
        Status:
        {simulation.status === 'in_progress' && <span>🔄</span>}
        {simulation.status === 'completed' && <span>✅</span>}
        {simulation.status === 'failed' && <span style={{ color: 'red' }}>❌ Failed</span>}
        {simulation.status === 'aborted' && <span style={{ color: 'orange' }}>⚠️ Aborted</span>}
      </p>

      {/* Button to go back */}
      <button
        onClick={() => router.push(`/projects/${projectId}/simulations`)}
        className="bg-blue-500 text-white p-2 mt-4 rounded"
      >
        Back to Simulations
      </button>
    </div>
  )
}

export default SimulationDetails
