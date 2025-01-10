import Simulations from '@/components/Simulations'
import { Project, Simulation } from '@/schemas'

async function fetchProject(projectId: string): Promise<Project> {
  const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch project')
  }

  const project = await response.json()
  return project
}

async function fetchSimulations(projectId: string): Promise<Simulation[]> {
  const response = await fetch(`http://localhost:8000/projects/${projectId}/simulations`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch simulations')
  }

  const { simulations } = await response.json()
  return simulations
}

export default async function SimulationsPage({ params }: { params: { id: string } }) {
  const [project, simulations] = await Promise.all([
    fetchProject(params.id),
    fetchSimulations(params.id),
  ])

  return <Simulations project={project} simulations={simulations} />
}
