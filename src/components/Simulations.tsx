'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Project, Simulation } from '@/schemas'
import { SIMULATION_STATUSES } from '@/schemas/simulation'
import { Calendar, GitGraph, MoreVertical, Pause, Play, Search, Thermometer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

type SimulationStatus = 'running' | 'completed' | 'failed' | 'pending'

const getStatusColor = (status: SimulationStatus) => {
  switch (status) {
    case 'running':
      return 'text-blue-400'
    case 'completed':
      return 'text-green-400'
    case 'failed':
      return 'text-red-400'
    case 'pending':
      return 'text-yellow-400'
    default:
      return 'text-zinc-400'
  }
}

const getStatusIcon = (status: SimulationStatus) => {
  switch (status) {
    case 'running':
      return <Play className="h-4 w-4 text-blue-400" />
    case 'completed':
      return <Thermometer className="h-4 w-4 text-green-400" />
    case 'failed':
      return <Thermometer className="h-4 w-4 text-red-400" />
    case 'pending':
      return <Pause className="h-4 w-4 text-yellow-400" />
    default:
      return <Thermometer className="h-4 w-4 text-zinc-400" />
  }
}

const Simulations = ({
  project,
  simulations: initialSimulations,
}: {
  project: Project
  simulations: Simulation[]
}) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [simulations, setSimulations] = useState(initialSimulations)
  const [statusFilter, setStatusFilter] = useState<SimulationStatus | 'all'>('all')

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query)

      let filtered = [...initialSimulations]

      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        filtered = filtered.filter((simulation) => simulation.status === statusFilter)
      }

      // Apply search query if exists
      if (query.trim()) {
        filtered = filtered.filter(
          (simulation) =>
            simulation.name.toLowerCase().includes(query.toLowerCase()) ||
            simulation.description?.toLowerCase().includes(query.toLowerCase())
        )
      }

      setSimulations(filtered)
    },
    [initialSimulations, statusFilter]
  )

  // Add useEffect to refilter when status changes
  useEffect(() => {
    handleSearch(searchQuery)
  }, [statusFilter, handleSearch, searchQuery])

  const goToSimulation = (simulationId: string) => {
    router.push(
      `/projects/${project.id}/simulations/${simulationId}?projectName=${encodeURIComponent(project.name)}`
    )
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
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-sm text-zinc-400 mt-1">{project.description}</p>
            </div>
            <button
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
              onClick={() =>
                router.push(`/projects/${project.id}/new-simulation?projectName=${project.name}`)
              }
            >
              New Simulation
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
                placeholder="Search simulations..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: SimulationStatus | 'all') => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value={SIMULATION_STATUSES.IN_PROGRESS}>Running</SelectItem>
                <SelectItem value={SIMULATION_STATUSES.COMPLETED}>Completed</SelectItem>
                <SelectItem value={SIMULATION_STATUSES.ABORTED}>Aborted</SelectItem>
                <SelectItem value={SIMULATION_STATUSES.TIMEOUT}>Timeout</SelectItem>
                <SelectItem value={SIMULATION_STATUSES.FAILED}>Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content Area - Make it scrollable */}
      <div className="flex-1 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations && simulations.length > 0 ? (
              simulations.map((simulation) => (
                <div
                  key={simulation.id}
                  className="group relative bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all duration-200 h-[280px] flex flex-col"
                >
                  {/* Simulation Header */}
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start">
                      <div
                        className="cursor-pointer flex-1 min-w-0"
                        onClick={() => goToSimulation(simulation.id)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors truncate pr-2">
                            {simulation.name}
                          </h2>
                        </div>
                        <p
                          className="text-sm text-zinc-400 mt-1 line-clamp-2"
                          title={simulation.description || 'No description provided'}
                        >
                          {simulation.description || 'No description provided'}
                        </p>
                      </div>
                      <button className="p-2 hover:bg-zinc-800 rounded-full shrink-0">
                        <MoreVertical className="h-5 w-5 text-zinc-400" />
                      </button>
                    </div>
                  </div>

                  {/* Simulation Stats and Footer */}
                  <div className="mt-auto">
                    {/* Simulation Stats */}
                    <div className="px-6 pb-4 flex items-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1">
                        <GitGraph className="h-4 w-4" />
                        <span>{simulation.agents?.length || 0} agents</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Updated {formatDate(simulation.started_at)}</span>
                      </div>
                    </div>

                    {/* Simulation Footer */}
                    <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              simulation.status === 'in progress'
                                ? 'bg-blue-500'
                                : simulation.status === 'completed'
                                  ? 'bg-green-500'
                                  : simulation.status === 'failed'
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                            }`}
                          />
                          <span className="text-sm text-zinc-400 capitalize">
                            {simulation.status || 'pending'}
                          </span>
                        </div>
                        <button
                          onClick={() => goToSimulation(simulation.id)}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View Details →
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
                  {searchQuery ? 'No simulations found' : 'No simulations yet'}
                </h3>
                <p className="text-sm">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Create your first simulation to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Simulations
