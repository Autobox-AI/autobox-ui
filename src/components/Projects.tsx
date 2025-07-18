'use client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { ConfidenceLevel, Project, ProjectStatus } from '@/schemas'
import { PROJECT_STATUSES } from '@/schemas/project'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  GitGraph,
  LayoutGrid,
  List,
  MoreVertical,
  Plus,
  Search,
  Thermometer,
  Trash2,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip'
import { BookmarkButton } from './BookmarkButton'
import { BOOKMARK_TYPES } from '@/schemas'

// Move static functions outside component
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

const formatDate = (date: string | null | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Helper function to generate pagination items with dots
const generatePaginationItems = (currentPage: number, totalPages: number) => {
  const items: (number | 'dots')[] = []

  if (totalPages <= 5) {
    // Show all pages if 5 or fewer
    for (let i = 1; i <= totalPages; i++) {
      items.push(i)
    }
    return items
  }

  // Always show first page
  items.push(1)

  if (currentPage <= 3) {
    // Near the beginning
    items.push(2, 3, 4)
    if (totalPages > 4) {
      items.push('dots')
      items.push(totalPages)
    }
  } else if (currentPage >= totalPages - 2) {
    // Near the end
    items.push('dots')
    items.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
  } else {
    // In the middle
    items.push('dots')
    items.push(currentPage - 1, currentPage, currentPage + 1)
    items.push('dots')
    items.push(totalPages)
  }

  return items
}

type ViewMode = 'grid' | 'table'

interface ProjectCardProps {
  project: Project
  onClick: () => void
  onDelete: (projectId: string) => void
}

const ProjectCard = React.memo(({ project, onClick, onDelete }: ProjectCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(project.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDropdownOpenChange = (open: boolean) => {
    setIsDropdownOpen(open)
  }

  return (
    <div className="group relative bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all duration-200 h-[280px] flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start">
          <div className="cursor-pointer flex-1 min-w-0" onClick={onClick}>
            <div className="flex items-center gap-2 mb-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors truncate pr-2">
                    {project.name}
                  </h2>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px]">
                  <div className="space-y-1">
                    <p className="font-semibold">{project.name}</p>
                    <p className="text-sm text-zinc-400">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
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
          <div className="flex items-center gap-2 shrink-0">
            <BookmarkButton
              type={BOOKMARK_TYPES.PROJECT}
              itemId={project.id}
              itemName={project.name}
              itemDescription={project.description}
              size="sm"
              variant="ghost"
            />
            <DropdownMenu open={isDropdownOpen} onOpenChange={handleDropdownOpenChange}>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-zinc-800 rounded-full shrink-0">
                  <MoreVertical className="h-5 w-5 text-zinc-400" />
                </button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-400 focus:bg-red-400/10"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{project.name}&quot;? This action cannot
                      be undone and will permanently remove the project and all its simulations.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsDropdownOpen(false)}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        await handleDelete()
                        setIsDropdownOpen(false)
                      }}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Project'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Project Stats and Footer */}
      <div className="mt-auto">
        {/* Project Stats */}
        <div className="px-6 pb-4 flex items-center justify-between text-sm text-zinc-400">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 cursor-pointer">
                  <GitGraph className="h-4 w-4" />
                  <span>{project.simulations?.length || 0}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">Total simulations</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 cursor-pointer">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(project.updated_at || project.created_at)}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">Last update</TooltipContent>
            </Tooltip>
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
              <span className="text-sm text-zinc-400 capitalize">{project.status || 'active'}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookmarkButton
                type={BOOKMARK_TYPES.PROJECT}
                itemId={project.id}
                itemName={project.name}
                itemDescription={project.description}
                size="sm"
                variant="ghost"
              />
              <button
                onClick={onClick}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View Simulations →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

ProjectCard.displayName = 'ProjectCard'

const NewProjectCard = React.memo(() => {
  const router = useRouter()

  return (
    <div
      className="group relative bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-700 overflow-hidden hover:border-zinc-600 transition-all duration-200 h-[280px] flex flex-col cursor-pointer"
      onClick={() => router.push('/projects/new')}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
          <Plus className="h-8 w-8 text-zinc-400 group-hover:text-zinc-300" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-300 mb-2 group-hover:text-zinc-200 transition-colors">
          Create New Project
        </h3>
        <p className="text-sm text-zinc-500 text-center max-w-32 group-hover:text-zinc-400 transition-colors">
          Start a new project to organize your simulations
        </p>
      </div>
    </div>
  )
})

NewProjectCard.displayName = 'NewProjectCard'

const Projects = ({ projects: initialProjects }: { projects: Project[] }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const projectsPerPage = 8
  const [projects, setProjects] = useState(initialProjects)

  // Get initial values from URL
  const initialSearch = searchParams.get('search') || ''
  const initialStatus = (searchParams.get('status') as ProjectStatus | 'all') || 'all'
  const initialPage = Number(searchParams.get('page')) || 1

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>(initialStatus)
  const [currentPage, setCurrentPage] = useState(initialPage)

  // Calculate pagination
  const totalPages = Math.ceil(projects.length / projectsPerPage)
  const startIndex = (currentPage - 1) * projectsPerPage
  const endIndex = startIndex + projectsPerPage
  const currentProjects = projects.slice(startIndex, endIndex)

  // Debounce search input
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Update URL when filters change
  const updateFilters = useCallback(
    (search: string, status: ProjectStatus | 'all', page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) {
        params.set('search', search)
      } else {
        params.delete('search')
      }
      if (status !== 'all') {
        params.set('status', status)
      } else {
        params.delete('status')
      }
      if (page > 1) {
        params.set('page', page.toString())
      } else {
        params.delete('page')
      }
      router.push(`/projects?${params.toString()}`)
    },
    [router, searchParams]
  )

  // Handle search changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Handle status filter changes
  const handleStatusChange = useCallback((value: ProjectStatus | 'all') => {
    setStatusFilter(value)
  }, [])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateFilters(debouncedSearch, statusFilter, page)
  }

  // Update URL when debounced search or status changes
  useEffect(() => {
    updateFilters(debouncedSearch, statusFilter, currentPage)
  }, [debouncedSearch, statusFilter, currentPage, updateFilters])

  // Update projects state when initialProjects changes
  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  const goToProject = useCallback(
    (projectId: string) => {
      router.push(`/projects/${projectId}/simulations`)
    },
    [router]
  )

  const handleDeleteProject = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete project')
      }

      // Remove the project from the local state
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId))

      // Revalidate the projects cache
      await fetch('/api/revalidate?tag=projects', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      // You could add a toast notification here to show the error
      alert('Failed to delete project. Please try again.')
    }
  }, [])

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
      {/* Header and Search Section - Fixed at top */}
      <div className="w-full bg-background px-6 pt-6 pb-4 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-sm text-zinc-400 mt-1">Manage your projects and simulations</p>
            </div>
          </div>

          {/* Search Bar and View Toggle */}
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
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value={PROJECT_STATUSES.ACTIVE}>Active</SelectItem>
                <SelectItem value={PROJECT_STATUSES.ARCHIVED}>Archived</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="h-10 w-10"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('table')}
                className="h-10 w-10"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid/Table */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <NewProjectCard />
              {currentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => goToProject(project.id)}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Confidence</th>
                    <th className="text-left py-3 px-4">Last Updated</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-zinc-800 hover:bg-zinc-900 cursor-pointer"
                      onClick={() => goToProject(project.id)}
                    >
                      <td className="py-3 px-4">{project.name}</td>
                      <td className="py-3 px-4">{project.status}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {getConfidenceIcon(project.confidence_level || 'LOW')}
                          <span className={getConfidenceColor(project.confidence_level || 'LOW')}>
                            {project.confidence_level || 'LOW'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{formatDate(project.updated_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <BookmarkButton
                            type={BOOKMARK_TYPES.PROJECT}
                            itemId={project.id}
                            itemName={project.name}
                            itemDescription={project.description}
                            size="sm"
                            variant="ghost"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {generatePaginationItems(currentPage, totalPages).map((item, index) =>
                  item === 'dots' ? (
                    <span key={`dots-${index}`} className="px-2 text-zinc-400">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={item}
                      variant={currentPage === item ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => handlePageChange(item)}
                      className="h-8 w-8"
                    >
                      {item}
                    </Button>
                  )
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
    </TooltipProvider>
  )
}

export default Projects
