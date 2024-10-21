'use client'

import { useProjectData } from '@/components/ProjectContext'
import { useRouter } from 'next/navigation'

// TODO: Implement the ProjectsPage component
const ProjectsPage = () => {
  const router = useRouter()
  const { projects } = useProjectData()

  const goToProject = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>

      <div className="grid grid-cols-3 gap-4">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className="p-4 bg-gray-800 rounded cursor-pointer"
              onClick={() => goToProject(project.id)} // Navigate on click
            ></div>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  )
}

export default ProjectsPage
