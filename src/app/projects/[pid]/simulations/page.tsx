'use client'

import Simulations from '@/components/Simulations'
import { Simulation } from '@/schemas'

async function fetchSimulations(): Promise<Simulation[]> {
  const response = await fetch('http://localhost:8000/simulations', {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch projects')
  }

  const { projects } = await response.json()
  return projects
}

type ProjectSimulationsParams = {
  params: {
    pid: string
  }
}

export default async function ProjectSimulations({ params }: ProjectSimulationsParams) {
  const { pid: projectId } = params
  const simulations = await fetchSimulations() // TODO: pass projectId after implementing the API

  return (
    <div className="text-foreground p-6">
      <h1 className="text-2xl font-bold mb-4">Simulations for Project {projectId}</h1>

      {/* Render the Simulations component */}
      <Simulations selectedProject={projectId} />
    </div>
  )
}
