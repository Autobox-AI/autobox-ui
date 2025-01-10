'use client'

import { cn } from '@/lib/utils'
import { Simulation } from '@/schemas'
import { formatDateTime } from '@/utils'
import {
  CaretSortIcon,
  CheckIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  GearIcon,
  PlayIcon,
  StopIcon,
  TimerIcon,
} from '@radix-ui/react-icons'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import ConfirmAbortModal from './ConfirmAbortModal'
import InstructAgentModal from './InstructAgentModal'
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
} from './ui/alert-dialog'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Textarea } from './ui/textarea'

interface Props {
  simulation: Simulation
  projectId: string
  projectName: string
}

const SimulationDetails = ({ simulation, projectId, projectName }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [traces, setTraces] = useState<string[]>([])
  const [loadingState, setLoadingState] = useState({
    isLoadingTraces: false,
    isInstructing: false,
    isAborting: false,
  })

  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [localSimulation, setLocalSimulation] = useState(simulation)
  const [isTracesExpanded, setIsTracesExpanded] = useState(true)
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(true)
  const traceContainerRef = useRef<HTMLDivElement>(null)
  const [isInstructAgentModalOpen, setIsInstructAgentModalOpen] = useState(false)
  const [isAbortModalOpen, setIsAbortModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [openAgentSelector, setOpenAgentSelector] = useState(false)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null)
  const [openDialog, setOpenDialog] = useState(false)

  const eventSourceRef = useRef<EventSource | null>(null)

  const resetInstructModalState = () => {
    setMessage('') // Clear the message
    setSelectedAgent(null) // Reset selected agent
  }

  const handleAbortClick = () => {
    setIsAbortModalOpen(true)
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setMessage(e.target.value)

  const handleAbortConfirm = async () => {
    setIsAbortModalOpen(false)
    setLoadingState({ ...loadingState, isAborting: true })

    try {
      const response = await fetch(`http://localhost:8000/simulations/${simulation?.id}/abort`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to abort the simulation')
      }
    } catch (error) {
      console.error(error)
    } finally {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        console.log('EventSource closed manually on abort.')
      }
      setLoadingState({ ...loadingState, isAborting: false })
    }
  }

  const handleInstructAgentClick = () => {
    setIsInstructAgentModalOpen(true)
  }

  const handleInstructAgentModalClose = () => {
    setIsInstructAgentModalOpen(false)
  }

  const handleInstructAgentModalSubmit = async (agentId: number, message: string) => {
    setLoadingState({ ...loadingState, isInstructing: true })
    try {
      const response = await fetch(
        `http://localhost:8000/simulations/${simulation?.id}/agents/${agentId}/instruction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instruction: message,
          }),
        }
      )
      if (!response.ok) {
        throw new Error('Failed to send instruction')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingState({ ...loadingState, isInstructing: false })
      resetInstructModalState()
    }
  }

  const handleBackToProject = () => {
    router.push(`/projects/${projectId}`)
  }

  // Hook to calculate and update the elapsed time for in-progress simulations
  useEffect(() => {
    if (localSimulation?.status !== 'in progress') return

    // Calculate the initial elapsed time
    const startedAt = new Date(localSimulation.started_at).getTime()
    const now = Date.now()
    setElapsedTime(Math.floor((now - startedAt) / 1000))

    // Start an interval to update the elapsed time every second
    const interval = setInterval(() => {
      setElapsedTime((prevElapsedTime) => prevElapsedTime + 1)
    }, 1000)

    // Clean up the interval when the component unmounts or the simulation ends
    return () => clearInterval(interval)
  }, [localSimulation?.started_at, localSimulation?.status])

  // hook for streaming simulation updates
  useEffect(() => {
    if (localSimulation?.status !== 'in progress') {
      return
    }

    const eventSource = new EventSource(
      `http://localhost:8000/simulations/${localSimulation.id}?streaming=true`
    )

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as Simulation
      setLocalSimulation(data)
      if (data.progress >= 100 || data.status !== 'in progress') {
        eventSource.close()
      }
    }

    eventSource.onerror = () => {
      console.error(`Error with EventSource for simulation ${localSimulation.id}`)
      eventSource.close()
    }

    // Cleanup function to close all EventSource instances when the component unmounts
    return () => {
      if (eventSource) {
        eventSource.close()
        console.log('EventSource closed during cleanup.')
      }
    }
  }, [localSimulation, setLocalSimulation])

  // Hook to fetch traces for the simulation
  useEffect(() => {
    if (simulation?.status === 'in progress') return
    const fetchTraces = async () => {
      try {
        const response = await fetch(`http://localhost:8000/simulations/${simulation?.id}/traces`)
        if (!response.ok) {
          throw new Error('Error fetching data')
        }
        const result = await response.json()
        setTraces(result)
      } catch (err) {
        console.error(err)
      }
      return
    }

    fetchTraces()
  }, [simulation])

  // Hook to listen for streaming simulation traces
  useEffect(() => {
    if (!simulation || simulation.status !== 'in progress') {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        console.log('EventSource closed as simulation is not in progress.')
      }
      return
    }

    setLoadingState({ ...loadingState, isLoadingTraces: true })

    const eventSource = new EventSource(
      `http://localhost:8000/simulations/${simulation.id}/traces?streaming=true`
    )
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      if (!simulation) return
      try {
        const data = JSON.parse(event.data)
        const { traces, progress, status } = data
        setLocalSimulation((prevSimulation) => {
          if (prevSimulation) {
            prevSimulation.progress = progress
            prevSimulation.status = status
          }
          return prevSimulation
        })
        setTraces(traces)
        if (progress === 100 || status !== 'in progress') {
          eventSource.close()
        }
      } catch (error) {
        console.error('Error parsing traces', error)
        eventSource.close()
      }
    }

    eventSource.onerror = (error) => {
      console.error(`Error receiving traces for simulation ${simulation.id}:`, error)
      eventSource.close()
      setLoadingState({ ...loadingState, isLoadingTraces: false })
    }

    eventSource.onopen = () => {
      setLoadingState({ ...loadingState, isLoadingTraces: false })
    }

    return () => {
      if (eventSource) {
        eventSource.close()
        console.log('EventSource closed during cleanup.')
      }
    }
  }, [simulation?.id, simulation?.status])

  useEffect(() => {
    if (traceContainerRef.current) {
      traceContainerRef.current.scrollTop = traceContainerRef.current.scrollHeight
    }
  }, [traces])

  useEffect(() => {
    if (isTracesExpanded && traceContainerRef.current) {
      traceContainerRef.current.scrollTop = traceContainerRef.current.scrollHeight
    }
  }, [isTracesExpanded])

  if (!simulation) {
    return (
      <div className="text-foreground p-6">
        <h1 className="text-2xl font-bold mb-4">Simulation not found</h1>
      </div>
    )
  }

  const combinedParticipants = [
    ...(localSimulation?.agents || []),
    ...(localSimulation?.orchestrator ? [localSimulation.orchestrator] : []),
  ]

  return (
    <div className="w-full py-6">
      <h1 className="text-2xl font-bold mb-4">Simulation: {simulation.name}</h1>

      {/* Link to Dashboards */}
      <div className="mb-4 text-sm">
        <a
          href={simulation.internal_dashboard_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          Go to Dashboard
        </a>
      </div>

      <div className="mb-8">
        {/* Abort Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={loadingState.isAborting || localSimulation?.status !== 'in progress'}
              variant="outline"
              className="mr-2"
            >
              Abort
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently abort this simulation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAbortConfirm}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* <Button
          onClick={handleAbortClick}
          disabled={loadingState.isAborting || localSimulation?.status !== 'in progress'}
          className={`bg-transparent border border-gray-600 text-gray-300 hover:text-white hover:bg-red-700 text-white px-3 py-1 text-sm rounded mr-2 transition-opacity duration-200 aria-labels ${
            loadingState.isAborting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          {loadingState.isAborting ? 'Aborting...' : 'Abort'}
        </Button> */}

        {/* Instruct Button */}
        {/* <Button
          onClick={handleInstructAgentClick}
          disabled={loadingState.isInstructing || localSimulation?.status !== 'in progress'}
          className={`bg-transparent border border-gray-600 text-gray-300 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded transition-opacity duration-200 aria-labels ${
            loadingState.isInstructing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          {loadingState.isInstructing ? 'Sending Instruction...' : 'Instruct'}
        </Button> */}

        <Dialog
          open={openDialog}
          onOpenChange={(isOpen) => {
            setOpenDialog(isOpen)
            if (!isOpen) {
              resetInstructModalState()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              disabled={loadingState.isAborting || localSimulation?.status !== 'in progress'}
              onClick={() => setOpenDialog(true)}
            >
              Instruct
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Instruct Agent</DialogTitle>
              <DialogDescription>
                Send a message to an agent participating in the simulation.
              </DialogDescription>
            </DialogHeader>
            <div className="mb-4">
              <Popover open={openAgentSelector} onOpenChange={setOpenAgentSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openAgentSelector}
                    className="w-[200px] justify-between"
                  >
                    {selectedAgent !== null
                      ? combinedParticipants.find((agent) => agent.id === selectedAgent)?.name
                      : 'Select agent...'}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search agent..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No agent found.</CommandEmpty>
                      <CommandGroup>
                        {combinedParticipants.map((agent) => (
                          <CommandItem
                            key={agent.id}
                            onSelect={() => {
                              setSelectedAgent(agent.id) // Store agent.id (number)
                              setOpenAgentSelector(false)
                            }}
                          >
                            {agent.name} {/* Display agent.name */}
                            <CheckIcon
                              className={cn(
                                'ml-auto h-4 w-4',
                                selectedAgent === agent.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="mb-4 mt-8">
              <Textarea
                value={message}
                onChange={handleMessageChange}
                className="bg-black w-full p-2 text-white rounded"
                rows={6}
                placeholder="Type your instruction here..."
              />
            </div>

            {/* <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" value="Pedro Duarte" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input id="username" value="@peduarte" className="col-span-3" />
              </div>
            </div> */}
            <DialogFooter>
              <Button
                type="submit"
                onClick={() => {
                  if (selectedAgent !== null && message) {
                    handleInstructAgentModalSubmit(selectedAgent, message)
                    setOpenDialog(false)
                  }
                }}
                disabled={selectedAgent === null || !message}
              >
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Simulation details */}
      {localSimulation && (
        <div className="mb-4">
          <p>
            <PlayIcon className="inline-block mr-2" />
            <strong>Started at:</strong> {formatDateTime(localSimulation.started_at)}
          </p>
          {simulation.finished_at && (
            <p>
              <StopIcon className="inline-block mr-2" />
              <strong>Finished at:</strong> {formatDateTime(simulation.finished_at)}
            </p>
          )}
          {simulation.aborted_at && (
            <p>
              <ExclamationTriangleIcon className="inline-block mr-2" />
              <strong>Aborted at:</strong> {formatDateTime(simulation.aborted_at)}
            </p>
          )}
          {/* Show real-time elapsed time while in progress */}
          {localSimulation.status === 'in progress' ? (
            <p>
              <TimerIcon className="inline-block mr-2" />
              <strong>Elapsed time:</strong> {elapsedTime} seconds...
            </p>
          ) : (
            // Show static elapsed time if simulation has finished or been aborted
            (localSimulation.finished_at || localSimulation.aborted_at) && (
              <p>
                <TimerIcon className="inline-block mr-2" />
                <strong>Elapsed time:</strong>
                {` ${Math.round(
                  ((localSimulation.finished_at
                    ? new Date(localSimulation.finished_at).getTime()
                    : new Date(localSimulation.aborted_at!).getTime()) -
                    new Date(localSimulation.started_at).getTime()) /
                    1000
                )} seconds`}
              </p>
            )
          )}
          <p className="flex items-center">
            <span>
              <CubeIcon className="inline-block mr-2" />
              <strong>Status:</strong>
            </span>
            {localSimulation.status === 'in progress' && (
              <span className="ml-2 flex items-center">
                <span className="loader inline-block mr-2 h-4 w-4"></span>
                <span>running...</span>
              </span>
            )}
            {localSimulation.status === 'completed' && <span className="ml-2">✅</span>}
            {localSimulation.status === 'failed' && (
              <span className="ml-2" style={{ color: 'red' }}>
                ❌ Failed
              </span>
            )}
            {simulation.status === 'timeout' && <span style={{ color: 'gray' }}> ⏰ Timeout</span>}
            {localSimulation.status === 'aborted' && (
              <span className="ml-2" style={{ color: 'orange' }}>
                ⚠️ Aborted
              </span>
            )}
          </p>
          {/* Show progress bar if progress is less than 100 */}
          <p>
            <GearIcon className="inline-block mr-2" />
            <strong>Progress:</strong> {localSimulation.progress}%
          </p>
          {(localSimulation.progress < 100 || localSimulation.status === 'aborted') && (
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
              <div
                className={`h-2.5 rounded-full ${
                  simulation.status === 'aborted' ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                style={{ width: `${localSimulation.progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Collapsible traces container */}
      <div
        onClick={() => setIsTracesExpanded(!isTracesExpanded)} // Toggle expand/collapse
        className="bg-gray-800 text-foreground px-4 py-2 rounded-lg cursor-pointer flex justify-between items-center"
      >
        <span className="font-bold">Traces</span>
        <span>{isTracesExpanded ? '▲' : '▼'}</span>
      </div>

      {/* Traces display (conditionally rendered) */}
      {isTracesExpanded && (
        <div
          ref={traceContainerRef}
          className="bg-gray-900 p-4 mt-1 rounded-lg text-green-400 font-mono overflow-y-auto
                   h-64 sm:h-80 md:h-96 lg:h-[32rem] xl:h-[40rem] border border-gray-700 shadow-lg
                   w-full"
        >
          {loadingState.isLoadingTraces && <p>Loading traces...</p>}
          {traces.length === 0 && !loadingState.isLoadingTraces ? (
            <p>No traces available yet.</p>
          ) : (
            traces.map((trace, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {trace}
              </div>
            ))
          )}
        </div>
      )}

      <div
        onClick={() => setIsDashboardExpanded(!isDashboardExpanded)}
        className="bg-gray-800 text-foreground px-4 py-2 rounded-lg cursor-pointer flex justify-between items-center mt-3"
      >
        <span className="font-bold">Metrics</span>
        <span>{isDashboardExpanded ? '▲' : '▼'}</span>
      </div>
      {/* Embedding the URL */}
      {isDashboardExpanded && simulation.internal_dashboard_url && (
        <div className="mt-1 w-full">
          <iframe
            src={simulation.internal_dashboard_url}
            width="100%"
            height="600"
            frameBorder="0"
            className="w-full"
          ></iframe>
        </div>
      )}

      {/* Modal for abort confirmation */}
      <ConfirmAbortModal
        isOpen={isAbortModalOpen}
        onClose={() => setIsAbortModalOpen(false)}
        onConfirm={handleAbortConfirm}
      />

      {/* Modal for sending instruction */}
      <InstructAgentModal
        isOpen={isInstructAgentModalOpen}
        onClose={handleInstructAgentModalClose}
        onSubmit={handleInstructAgentModalSubmit}
        agents={[...(simulation.agents ?? []), simulation.orchestrator ?? { id: 0, name: '' }]}
      />
    </div>
  )
}

export default SimulationDetails
