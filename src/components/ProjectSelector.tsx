'use client'
import { Project } from '@/schemas/project'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export function ProjectSelector() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      const projectName = encodeURIComponent(project.name)
      router.push(`/projects/${project.id}/new-simulation?projectName=${projectName}`)
    }
  }

  const handleProceed = () => {
    if (selectedProjectId) {
      handleSelectProject(selectedProjectId)
    }
  }

  // if (loading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
  //       <div className="text-white">Loading projects...</div>
  //     </div>
  //   )
  // }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
        <div className="text-red-500">{error}</div>
        <Button onClick={() => router.push('/')} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-lg shadow-lg border border-zinc-800">
        <h1 className="text-2xl font-bold mb-6 text-white">Select Project for New Simulation</h1>

        {projects.length === 0 ? (
          <div className="text-center">
            <p className="text-zinc-300 mb-4">No projects found. Create a project first.</p>
            <Button onClick={() => router.push('/projects/new')}>Create New Project</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-zinc-300 mb-2">Select a project</label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {projects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      className="text-white hover:bg-zinc-800 focus:bg-zinc-800"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{project.name}</span>
                        {project.description && (
                          <span className="text-xs text-zinc-400 mt-0.5">
                            {project.description.length > 50
                              ? `${project.description.substring(0, 50)}...`
                              : project.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProjectId && (
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                {(() => {
                  const selectedProject = projects.find((p) => p.id === selectedProjectId)
                  return selectedProject ? (
                    <>
                      <h3 className="text-sm font-semibold text-zinc-300 mb-2">Project Details</h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-zinc-400">
                          <span className="text-zinc-500">Name:</span> {selectedProject.name}
                        </p>
                        {selectedProject.description && (
                          <p className="text-zinc-400">
                            <span className="text-zinc-500">Description:</span>{' '}
                            {selectedProject.description}
                          </p>
                        )}
                        <p className="text-zinc-400">
                          <span className="text-zinc-500">Confidence:</span>{' '}
                          {selectedProject.confidence_level}
                        </p>
                        <p className="text-zinc-400">
                          <span className="text-zinc-500">Simulations:</span>{' '}
                          {selectedProject.simulations?.length || 0}
                        </p>
                      </div>
                    </>
                  ) : null
                })()}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.push('/')}>
                Cancel
              </Button>
              <Button onClick={handleProceed} disabled={!selectedProjectId}>
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
