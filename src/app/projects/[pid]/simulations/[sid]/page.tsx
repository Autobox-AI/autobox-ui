import SimulationDetails from '@/components/SimulationDetails'
import { Simulation } from '@/schemas'

async function fetchSimulation(projectId: string, simulationId: string): Promise<Simulation> {
  const response = await fetch(`http://localhost:8000/simulations/${simulationId}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    console.error('Failed to fetch simulation')
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
  const { pid: projectId, sid: simulationId } = params
  const simulation = await fetchSimulation(projectId, simulationId)

  return <SimulationDetails simulation={simulation} projectId={projectId} />
}
