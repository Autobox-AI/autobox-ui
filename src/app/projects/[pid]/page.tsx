'use client'

import { useProjectData } from '@/components/ProjectContext'
import { useRouter } from 'next/navigation'

type ProjectDetailsParams = {
  params: {
    pid: string
  }
}

const ProjectDetails = ({ params }: ProjectDetailsParams) => {
  const { pid: projectId } = params // Extract projectId
  const router = useRouter()
  const { projectsById } = useProjectData()

  const project = projectsById[projectId]

  if (!project) {
    return <p className="text-white">Project not found</p>
  }

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
      <p>{project.description}</p>

      {/* Button to navigate to simulations */}
      <button
        onClick={() => router.push(`/projects/${projectId}/simulations`)}
        className="bg-blue-500 text-white p-2 mt-4 rounded"
      >
        View Simulations
      </button>
    </div>
  )
}

export default ProjectDetails
