import Simulations from '@/components/Simulations'
import { Project } from '@/schemas'

async function fetchProject(projectId: string): Promise<Project> {
  const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch project')
  }

  return await response.json()
}

type ProjectSimulationsParams = {
  params: {
    pid: string
  }
}

export default async function ProjectSimulations({ params }: ProjectSimulationsParams) {
  const { pid: projectId } = params
  const project = await fetchProject(projectId)

  return (
    <div className="text-foreground p-6">
      {/* <h1 className="text-2xl font-bold mb-4">Simulations for Project {projectId}</h1> */}

      {/* Render the Simulations component */}
      <Simulations project={project} />
    </div>
  )
}
