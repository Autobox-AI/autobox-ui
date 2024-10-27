'use client'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Project, Simulation } from '@/schemas'
import { ProjectSimulation } from '@/schemas/project'
import { formatDateTime } from '@/utils'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NewSimulationModal from './NewSimulationModal'

const Simulations = ({ project }: { project: Project }) => {
  const router = useRouter()
  const [localSimulations, setLocalSimulations] = useState<ProjectSimulation[]>(project.simulations)
  const [showNewSimulationModal, setShowNewSimulationModal] = useState(false)

  useEffect(() => {
    const eventSources: EventSource[] = []

    const inProgressSimulations = localSimulations?.filter(
      (simulation) => simulation.status === 'in progress'
    )

    if (!inProgressSimulations) {
      return
    }

    inProgressSimulations?.forEach((simulation: ProjectSimulation) => {
      const url = `http://localhost:8000/simulations/${simulation.id}?streaming=true`
      const eventSource = new EventSource(url)

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data) as Simulation
        setLocalSimulations((prevSimulations) =>
          prevSimulations.map((sim) => (sim.id === data.id ? { ...sim, ...data } : sim))
        )
        if (data.progress === 100 || data.status !== 'in progress') {
          eventSource.close()
        }
      }

      eventSource.onerror = () => {
        console.error(`Error with EventSource for simulation ${simulation.id}`)
        eventSource.close()
      }

      eventSources.push(eventSource)
    })

    // Cleanup function to close all EventSource instances when the component unmounts
    return () => {
      eventSources.forEach((es) => es.close())
    }
  }, [localSimulations, setLocalSimulations])

  const addSimulation = (newSimulation: Simulation) => {
    const newProjectSimulation: ProjectSimulation = {
      id: newSimulation.id,
      name: newSimulation.name,
      status: 'in progress',
      progress: 0,
      started_at: newSimulation.started_at,
      finished_at: null,
      aborted_at: null,
    }
    setLocalSimulations((prevSimulations) => [...prevSimulations, newProjectSimulation])
  }

  return (
    <div className="text-foreground flex-1 p-4">
      {/* Display project title and description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-lg text-muted-foreground mt-2">{project.description}</p>
      </div>
      <div className="flex justify-between items-center mb-8">
        <Button
          // onClick={() => setShowNewSimulationModal(true)}
          onClick={() => router.push(`/projects/${project.id}/new-simulation`)}
          variant="default"
          className="mt-4"
        >
          New Simulation
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {localSimulations?.map((simulation) => (
          <Card
            key={simulation.id}
            className="bg-transparent p-4 bg-gray-950 rounded cursor-pointer border border-gray-600 text-card-foreground shadow-lg"
            onClick={() =>
              router.push(
                `/projects/${project.id}/simulations/${simulation.id}?projectName=${project.name}`
              )
            }
          >
            <CardHeader>
              <CardTitle className="text-xl text-white">{simulation.name}</CardTitle>
              <CardDescription className="text-m text-white leading-loose">
                <strong>Started:</strong> {formatDateTime(simulation.started_at)}
                {simulation.finished_at && (
                  <>
                    <br />
                    <strong>Finished:</strong> {formatDateTime(simulation.finished_at)}
                  </>
                )}
                {simulation.aborted_at && (
                  <>
                    <br />
                    <strong>Aborted:</strong> {formatDateTime(simulation.aborted_at)}
                  </>
                )}
                {/* Only show Elapsed time if either finished_at or aborted_at is present */}
                {(simulation.finished_at || simulation.aborted_at) && (
                  <>
                    <br />
                    <strong>Elapsed time:</strong>
                    <span>
                      {` ${Math.round(
                        ((simulation.finished_at
                          ? new Date(simulation.finished_at).getTime()
                          : new Date(simulation.aborted_at!).getTime()) -
                          new Date(simulation.started_at).getTime()) /
                          1000
                      )} seconds`}
                    </span>
                  </>
                )}
                {/* Status on a new line */}
                <br />
                <strong>Status:</strong>
                {simulation.status === 'in progress' && <span> 🔄</span>}
                {simulation.status === 'completed' && <span> ✅</span>}
                {simulation.status === 'failed' && <span style={{ color: 'red' }}> ❌ Failed</span>}
                {simulation.status === 'aborted' && (
                  <span style={{ color: 'orange' }}> ⚠️ Aborted</span>
                )}
              </CardDescription>
            </CardHeader>

            {/* Show progress if the simulation is still running */}
            {(simulation.progress < 100 || simulation.status === 'aborted') && (
              <>
                <p className="mt-4">Progress: {simulation.progress}%</p>
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                  <div
                    className={`h-2.5 rounded-full ${
                      simulation.status === 'aborted' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${simulation.progress}%` }}
                  ></div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>

      {showNewSimulationModal && (
        <NewSimulationModal
          onClose={() => setShowNewSimulationModal(false)}
          addSimulation={addSimulation}
        />
      )}
    </div>
  )
}

export default Simulations
