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
import {
  Calendar,
  GitGraph,
  LayoutGrid,
  List,
  MoreVertical,
  Pause,
  Play,
  Search,
  Thermometer,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'

type SimulationStatus = 'running' | 'completed' | 'failed' | 'pending'
type ViewMode = 'grid' | 'table'

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
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Add effect to handle streaming updates for in-progress simulations
  useEffect(() => {
    // Create event sources for all in-progress simulations
    const eventSources = simulations
      .filter((sim) => sim.status === SIMULATION_STATUSES.IN_PROGRESS)
      .map((simulation) => {
        const eventSource = new EventSource(
          `http://localhost:8000/simulations/${simulation.id}?streaming=true`
        )

        eventSource.onmessage = (event) => {
          const updatedSimulation = JSON.parse(event.data) as Simulation

          setSimulations((prevSimulations) =>
            prevSimulations.map((sim) =>
              sim.id === updatedSimulation.id ? updatedSimulation : sim
            )
          )

          if (
            updatedSimulation.progress >= 100 ||
            updatedSimulation.status !== SIMULATION_STATUSES.IN_PROGRESS
          ) {
            eventSource.close()
          }
        }

        eventSource.onerror = () => {
          console.error(`Error with EventSource for simulation ${simulation.id}`)
          eventSource.close()
        }

        return eventSource
      })

    // Cleanup function to close all EventSource instances
    return () => {
      eventSources.forEach((es) => es.close())
    }
  }, []) // Empty dependency array since we only want to set this up once

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

          {/* Search Bar and View Toggle */}
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

      {/* Content Area */}
      <div className="flex-1 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {viewMode === 'grid' ? (
            // Existing grid view
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

                    {/* Add progress bar for in-progress simulations */}
                    {simulation.status === SIMULATION_STATUSES.IN_PROGRESS && (
                      <div className="px-6 py-2">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${simulation.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-zinc-400 mt-1 text-right">
                          {simulation.progress}%
                        </div>
                      </div>
                    )}
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
          ) : (
            // New table view
            <div className="rounded-md border border-zinc-800">
              <table className="w-full">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                      Agents
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                      Started
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                      Progress
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {simulations && simulations.length > 0 ? (
                    simulations.map((simulation) => (
                      <tr
                        key={simulation.id}
                        className="border-t border-zinc-800 hover:bg-zinc-900/50 cursor-pointer"
                        onClick={() => goToSimulation(simulation.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(simulation.status as SimulationStatus)}
                            <span className="font-medium text-white">{simulation.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize text-zinc-400">{simulation.status}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {simulation.agents?.length || 0} agents
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {formatDate(simulation.started_at)}
                        </td>
                        <td className="px-4 py-3">
                          {simulation.status === SIMULATION_STATUSES.IN_PROGRESS && (
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${simulation.progress}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-2 hover:bg-zinc-800 rounded-full">
                            <MoreVertical className="h-4 w-4 text-zinc-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                        {searchQuery ? 'No simulations found' : 'No simulations yet'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Simulations
