'use client'

import SimulationDetails from '@/components/SimulationDetails'
import { Simulation } from '@/schemas'
import { useSearchParams } from 'next/navigation'

async function fetchSimulation(projectId: string, simulationId: string): Promise<Simulation> {
  const response = await fetch(`http://localhost:8000/simulations/${simulationId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch simulation')
  }

  return await response.json()
}

type SimulationDetailsParams = {
  params: {
    pid: string
    sid: string
  }
}

export default async function SimulationPage({ params }: SimulationDetailsParams) {
  const searchParams = useSearchParams()

  const { pid: projectId, sid: simulationId } = params
  const projectName = searchParams.get('projectName') ?? 'Unknown'
  const simulation = await fetchSimulation(projectId, simulationId)

  return (
    <SimulationDetails simulation={simulation} projectId={projectId} projectName={projectName} />
  )
}

// const SimulationDetails = ({ params }: SimulationDetailsParams) => {
//   const { pid: projectId, sid: simulationId } = params
//   const router = useRouter()

//   const { projectsById, projects, loading, error } = useProjectData()

//   const simulation = projectsById[projectId]?.simulations?.find((sim) => sim.id === simulationId)

//   if (!simulation) {
//     return (
//       <div className="text-white p-6">
//         <h1 className="text-2xl font-bold mb-4">Simulation not found</h1>
//         <button
//           onClick={() => router.push(`/projects/${projectId}/simulations`)}
//           className="bg-blue-500 text-white p-2 mt-4 rounded"
//         >
//           Back to Simulations
//         </button>
//       </div>
//     )
//   }

//   return (
//     <div className="text-white p-6">
//       <h1 className="text-2xl font-bold mb-4">{simulation.name}</h1>
//       <p>Startedxx: {simulation.started_at}</p>
//       <p>Finished: {simulation.finished_at}</p>
//       <p>
//         Status:
//         {simulation.status === 'in progress' && <span>🔄</span>}
//         {simulation.status === 'completed' && <span>✅</span>}
//         {simulation.status === 'failed' && <span style={{ color: 'red' }}>❌ Failed</span>}
//         {simulation.status === 'aborted' && <span style={{ color: 'orange' }}>⚠️ Aborted</span>}
//       </p>

//       {/* Button to go back */}
//       <button
//         onClick={() => router.push(`/projects/${projectId}/simulations`)}
//         className="bg-blue-500 text-white p-2 mt-4 rounded"
//       >
//         Back to Simulations
//       </button>
//     </div>
//   )
// }

// export default SimulationDetails
