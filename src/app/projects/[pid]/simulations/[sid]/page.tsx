'use client'

import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePrefetch } from '@/hooks/usePrefetch'
import { useRunPolling } from '@/hooks/useRunPolling'
import { format } from 'date-fns'
import { ArrowUpDown, ChevronRight, GitGraph, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useCallback, useEffect, useState } from 'react'

interface _Agent {
  id: string
  name: string
}

interface Run {
  id: string
  simulation_id: string
  status: string
  progress: number
  started_at: string
  finished_at?: string
  updated_at: string
  summary?: string
  observation?: string
}

interface SimulationRunsResponse {
  total: number
  runs: Run[]
}

async function getProject(projectId: string) {
  const response = await fetch(`http://localhost:8888/api/projects/${projectId}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch project')
  }

  return response.json()
}

async function getSimulation(projectId: string, simulationId: string) {
  const response = await fetch(`/api/simulations/${simulationId}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch simulation')
  }

  return response.json()
}

async function getSimulationRuns(simulationId: string): Promise<SimulationRunsResponse> {
  const response = await fetch(`/api/simulations/${simulationId}/runs`, {
    next: { revalidate: 10 },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch simulation runs')
  }

  return response.json()
}

type SortDirection = 'asc' | 'desc'
type SortField = 'status' | 'progress' | 'started_at' | 'finished_at' | 'summary' | 'observation'

export default function SimulationRunsPage({
  params,
}: {
  params: Promise<{ pid: string; sid: string }>
}) {
  const router = useRouter()
  const { pid, sid } = use(params)
  const [project, setProject] = useState<any>(null)
  const [simulation, setSimulation] = useState<any>(null)
  const [runs, setRuns] = useState<Run[]>([])
  const [sortField, setSortField] = useState<SortField>('started_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreatingRun, setIsCreatingRun] = useState(false)

  // Callback function to update a specific run in the runs array
  const handleRunUpdate = useCallback((updatedRun: Run) => {
    setRuns((prevRuns) => prevRuns.map((run) => (run.id === updatedRun.id ? updatedRun : run)))
  }, [])

  // Use the polling hook for runs that are in progress
  useRunPolling({
    runs,
    onRunUpdate: handleRunUpdate,
    pollingInterval: 3000, // Poll every 3 seconds
  })

  // Use prefetch hook for faster navigation
  const { prefetchRun, cancelPrefetch } = usePrefetch({
    enabled: true,
    delay: 200, // Prefetch after 200ms hover
  })

  useEffect(() => {
    const fetchData = async () => {
      const [projectData, simulationData, runsData] = await Promise.all([
        getProject(pid),
        getSimulation(pid, sid),
        getSimulationRuns(sid),
      ])
      setProject(projectData)
      setSimulation(simulationData)
      setRuns(runsData.runs)
    }
    fetchData()
  }, [pid, sid])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedRuns = [...runs]
    .filter((run) => statusFilter === 'all' || run.status === statusFilter)
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'progress':
          comparison = a.progress - b.progress
          break
        case 'started_at':
          comparison = new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
          break
        case 'finished_at':
          comparison =
            (a.finished_at ? new Date(a.finished_at).getTime() : 0) -
            (b.finished_at ? new Date(b.finished_at).getTime() : 0)
          break
        case 'summary':
          comparison = (a.summary || '').localeCompare(b.summary || '')
          break
        case 'observation':
          comparison = (a.observation || '').localeCompare(b.observation || '')
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

  const handleCreateRun = async () => {
    setIsCreatingRun(true)
    try {
      const response = await fetch(`/api/simulations/${sid}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeout_seconds: 300,
          verbose: false,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create run')
      }

      // Refresh the runs data to get the latest state including the new run
      const runsData = await getSimulationRuns(sid)
      setRuns(runsData.runs)
    } catch (error) {
      console.error('Error creating run:', error)
      // You might want to show a toast notification here
    } finally {
      setIsCreatingRun(false)
    }
  }

  if (!project || !simulation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-zinc-700 border-t-blue-500 rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"
              style={{ animationDuration: '1.5s' }}
            ></div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-zinc-300 mb-2">Loading Simulation</h2>
            <p className="text-sm text-zinc-500">
              Please wait while we fetch the simulation data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="sticky top-0 z-10 w-full bg-background px-6 py-4 border-b border-zinc-800">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Documentation</DropdownMenuItem>
                  <DropdownMenuItem>Examples</DropdownMenuItem>
                  <DropdownMenuItem>Usage</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projects/${pid}/simulations`}>{project.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projects/${pid}/simulations/${sid}`}>
                {simulation.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Runs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{simulation.name}</h1>
            <p className="text-sm text-zinc-400 mt-1">Simulation Runs</p>
          </div>
          <Button
            onClick={handleCreateRun}
            disabled={isCreatingRun}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isCreatingRun ? 'Creating...' : 'Run'}
          </Button>
        </div>

        <div className="mb-4 flex justify-end">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortField === 'status' && <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('progress')}
                  >
                    <div className="flex items-center gap-1">
                      Progress
                      {sortField === 'progress' && <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('started_at')}
                  >
                    <div className="flex items-center gap-1">
                      Started At
                      {sortField === 'started_at' && <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('finished_at')}
                  >
                    <div className="flex items-center gap-1">
                      Finished At
                      {sortField === 'finished_at' && <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('summary')}
                  >
                    <div className="flex items-center gap-1">
                      Summary
                      {sortField === 'summary' && <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('observation')}
                  >
                    <div className="flex items-center gap-1">
                      Observations
                      {sortField === 'observation' && <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedRuns.length > 0 ? (
                  filteredAndSortedRuns.map((run) => (
                    <TableRow
                      key={run.id}
                      className="cursor-pointer hover:bg-accent/50 group transition-colors"
                      onClick={() =>
                        router.push(`/projects/${pid}/simulations/${sid}/runs/${run.id}`)
                      }
                      onMouseEnter={() => prefetchRun(run.id)}
                      onMouseLeave={() => cancelPrefetch()}
                    >
                      <TableCell>
                        <Badge
                          variant={
                            run.status === 'completed'
                              ? 'success'
                              : run.status === 'in progress'
                                ? 'outline'
                                : run.status === 'created'
                                  ? 'outline'
                                  : run.status === 'aborted'
                                    ? 'outline'
                                    : 'outline'
                          }
                          className={`${run.status === 'in progress' ? 'animate-pulse bg-green-500/10 text-green-500 border-green-500/20' : ''} ${
                            run.status === 'aborted'
                              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              : ''
                          } ${
                            run.status === 'failed'
                              ? 'bg-red-500/10 text-red-500 border-red-500/20'
                              : ''
                          } ${
                            run.status === 'created'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : ''
                          } ${
                            run.status === 'completed' && !run.summary
                              ? 'animate-pulse bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : ''
                          }`}
                        >
                          {run.status === 'completed' && !run.summary ? 'completed*' : run.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={run.progress}
                            className={`w-[100px] ${
                              run.status === 'failed' || run.status === 'aborted'
                                ? 'bg-zinc-200/20 [&>div]:bg-zinc-500'
                                : ''
                            }`}
                          />
                          <span>{Math.round(run.progress)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(run.started_at), 'PPp')}</TableCell>
                      <TableCell>
                        {run.finished_at ? format(new Date(run.finished_at), 'PPp') : '-'}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger className="w-full text-left">
                              <div className="truncate text-ellipsis overflow-hidden text-left">
                                {run.status === 'completed' && !run.summary ? (
                                  <span className="text-blue-400 animate-pulse">
                                    Generating summary...
                                  </span>
                                ) : (
                                  run.summary || '-'
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[400px]">
                              <p className="break-words text-left">
                                {run.status === 'completed' && !run.summary ? (
                                  <span className="text-blue-400">Generating summary...</span>
                                ) : (
                                  run.summary || '-'
                                )}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger className="w-full text-left">
                              <div className="truncate text-ellipsis overflow-hidden text-left">
                                {run.status === 'failed'
                                  ? run.observation || 'No reason provided'
                                  : '-'}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[400px]">
                              <p className="break-words text-left">
                                {run.status === 'failed'
                                  ? run.observation || 'No reason provided'
                                  : '-'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32">
                      <div className="flex flex-col items-center justify-center text-zinc-400">
                        <GitGraph className="h-12 w-12 mb-4" />
                        <h3 className="text-xl font-medium mb-2">No runs yet</h3>
                        <p className="text-sm">Start a new run to begin your simulation</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
