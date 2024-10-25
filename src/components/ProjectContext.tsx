import { Project } from '@/schemas'
import { ProjectContextType } from '@/schemas/project'
import { createContext, useContext, useEffect, useState } from 'react'

export interface ProjectContextTypex {
  projects: Project[]
  projectsById: Record<string, Project>
  loading: boolean
  error: string | null
  setProjectsById: React.Dispatch<React.SetStateAction<Record<string, Project>>>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

// export const useProjectData = () => useContext(ProjectContext)
export const useProjectData = (): ProjectContextType => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjectData must be used within a ProjectProvider')
  }
  return context
}

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const [projects, setProjects] = useState<any[]>([])
  const [projectsById, setProjectsById] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const res = await fetch('http://localhost:8000/projects')
        // const jsonData = await res.json()
        const jsonData = {
          projects: [
            {
              id: '1',
              name: 'Project 1',
              description: 'Description 1',
              simulations: [
                {
                  id: '1',
                  name: 'Simulation 1',
                  status: 'in progress',
                  progress: 0,
                },
              ],
            },
            {
              id: '2',
              name: 'Project 2',
              description: 'Description 2',
              simulations: [
                {
                  id: '2',
                  name: 'Simulation 2',
                  status: 'in progress',
                  progress: 0,
                },
              ],
            },
          ],
        }
        setProjectsById(
          jsonData.projects.reduce(
            (acc: any, project: any) => ({ ...acc, [project.id]: project }),
            {}
          )
        )
        setProjects(jsonData.projects)
        setLoading(false)
      } catch (err) {
        setError((err as Error).message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <ProjectContext.Provider value={{ projects, projectsById, setProjectsById, loading, error }}>
      {children}
    </ProjectContext.Provider>
  )
}
