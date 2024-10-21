import { Project } from '@/schemas'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useProjectData } from './ProjectContext'

const Sidebar = ({
  selectedProject,
  onSelectProject,
}: {
  selectedProject: string
  onSelectProject: (project: string) => void
}) => {
  const router = useRouter()
  const pathname = usePathname()

  const { projects, loading, error } = useProjectData()

  useEffect(() => {
    const projectIdFromUrl = pathname.split('/')[2]
    if (projectIdFromUrl) {
      onSelectProject(projectIdFromUrl)
    }
  }, [pathname, onSelectProject])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const handleSelectProject = (project: Project) => {
    onSelectProject(project.id)
    router.push(`/projects/${project.id}`)
  }

  return (
    <div className="w-64 bg-gray-900 text-white h-full p-4 flex flex-col">
      <div className="mb-8">
        <select className="w-full bg-gray-800 text-white p-2 rounded">
          <option>Org 1</option>
          <option>Org 2</option>
          <option>Org 3</option>
        </select>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Projects</h2>
        <ul className="space-y-4">
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <li
                key={project.id}
                onClick={() => handleSelectProject(project)}
                className={`p-2 cursor-pointer rounded ${
                  selectedProject === project.id ? 'bg-blue-600 font-bold' : 'hover:bg-gray-700'
                }`}
              >
                {project.name}
              </li>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Sidebar
