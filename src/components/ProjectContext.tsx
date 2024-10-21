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
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsById, setProjectsById] = useState<Record<string, Project>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8000/projects')
        const jsonData = await res.json()
        setProjectsById(
          jsonData.projects.reduce(
            (acc: Project, project: Project) => ({ ...acc, [project.id]: project }),
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
