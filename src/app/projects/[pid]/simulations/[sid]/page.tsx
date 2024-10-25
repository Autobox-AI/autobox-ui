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
