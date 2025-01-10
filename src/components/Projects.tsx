'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfidenceLevel, Project, ProjectStatus } from '@/schemas'
import { PROJECT_STATUSES } from '@/schemas/project'
import { Calendar, GitGraph, MoreVertical, Search, Thermometer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

const getConfidenceIcon = (confidence: ConfidenceLevel) => {
  switch (confidence) {
    case 'LOW':
      return <Thermometer className="h-4 w-4 text-red-400" />
    case 'MEDIUM':
      return <Thermometer className="h-4 w-4 text-yellow-400" />
    case 'HIGH':
      return <Thermometer className="h-4 w-4 text-green-400" />
    default:
      return <Thermometer className="h-4 w-4 text-red-400" />
  }
}

const getConfidenceColor = (confidence: ConfidenceLevel) => {
  switch (confidence) {
    case 'LOW':
      return 'text-red-400'
    case 'MEDIUM':
      return 'text-yellow-400'
    case 'HIGH':
      return 'text-green-400'
    default:
      return 'text-red-400'
  }
}

const Projects = ({ projects: initialProjects }: { projects: Project[] }) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [projects, setProjects] = useState(initialProjects)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query)

      let filtered = [...initialProjects]

      if (statusFilter !== 'all') {
        filtered = filtered.filter((project) => project.status === statusFilter)
      }

      if (query.trim()) {
        filtered = filtered.filter(
          (project) =>
            project.name.toLowerCase().includes(query.toLowerCase()) ||
            project.description?.toLowerCase().includes(query.toLowerCase())
        )
      }

      setProjects(filtered)
    },
    [initialProjects, statusFilter]
  )

  useEffect(() => {
    handleSearch(searchQuery)
  }, [statusFilter, handleSearch, searchQuery])

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
    <div className="flex flex-col min-h-screen">
      {/* Header and Search Section - Fixed at top */}
      <div className="w-full bg-background px-6 pt-6 pb-4 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-sm text-zinc-400 mt-1">Manage your projects and simulations</p>
            </div>
            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors">
              New Project
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
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
            <Select
              value={statusFilter}
              onValueChange={(value: ProjectStatus | 'all') => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value={PROJECT_STATUSES.ACTIVE}>Active</SelectItem>
                <SelectItem value={PROJECT_STATUSES.ARCHIVED}>Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content Area - Make it scrollable */}
      <div className="flex-1 px-6 py-6">
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
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors truncate pr-2">
                            {project.name}
                          </h2>
                          <div className="flex items-center gap-1 shrink-0">
                            {getConfidenceIcon(project.confidence_level || 'LOW')}
                            <span
                              className={`text-xs font-medium ${getConfidenceColor(project.confidence_level || 'LOW')}`}
                            >
                              {project.confidence_level || 'LOW'}
                            </span>
                          </div>
                        </div>
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
                        <span>{project.simulations.length || 0} simulations</span>
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
