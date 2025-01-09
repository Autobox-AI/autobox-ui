'use client'
import { Project } from '@/schemas'
import { Calendar, GitGraph, MoreVertical, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

const Projects = ({ projects: initialProjects }: { projects: Project[] }) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [projects, setProjects] = useState(initialProjects)

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query)

      if (!query.trim()) {
        setProjects(initialProjects)
        return
      }

      const filteredProjects = initialProjects.filter(
        (project) =>
          project.name.toLowerCase().includes(query.toLowerCase()) ||
          project.description?.toLowerCase().includes(query.toLowerCase())
      )
      setProjects(filteredProjects)
    },
    [initialProjects]
  )

  const goToProject = (projectId: string) => {
    router.push(`/projects/${projectId}/simulations`)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header and Search Section - Fixed at top */}
      <div className="w-full bg-background px-6 pt-6 pb-4 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Projects</h1>
            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors">
              New Project
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all duration-200 h-[280px] flex flex-col"
                >
                  {/* Project Header */}
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start">
                      <div
                        className="cursor-pointer flex-1 min-w-0"
                        onClick={() => goToProject(project.id)}
                      >
                        <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors truncate pr-2">
                          {project.name}
                        </h2>
                        <p
                          className="text-sm text-zinc-400 mt-1 line-clamp-2"
                          title={project.description || 'No description provided'}
                        >
                          {project.description || 'No description provided'}
                        </p>
                      </div>
                      <button className="p-2 hover:bg-zinc-800 rounded-full shrink-0">
                        <MoreVertical className="h-5 w-5 text-zinc-400" />
                      </button>
                    </div>
                  </div>

                  {/* Project Stats and Footer */}
                  <div className="mt-auto">
                    {/* Project Stats */}
                    <div className="px-6 pb-4 flex items-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1">
                        <GitGraph className="h-4 w-4" />
                        <span>{project.simulations_count || 0} simulations</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Updated {formatDate(project.updated_at || project.created_at)}</span>
                      </div>
                    </div>

                    {/* Project Footer */}
                    <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              project.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                          />
                          <span className="text-sm text-zinc-400 capitalize">
                            {project.status || 'active'}
                          </span>
                        </div>
                        <button
                          onClick={() => goToProject(project.id)}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View Simulations →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-zinc-400">
                <GitGraph className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  {searchQuery ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-sm">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Create your first project to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Projects
