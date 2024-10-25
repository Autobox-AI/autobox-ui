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
  const [localSimulations, setLocalSimulations] = useState(project.simulations)
  const [showNewSimulationModal, setShowNewSimulationModal] = useState(false)

  useEffect(() => {
    const eventSources: EventSource[] = []

    const inProgressSimulations = project.simulations?.filter(
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
        const updatedSimulations = localSimulations.map((sim) =>
          sim.id === data.id ? { ...sim, ...data } : sim
        )
        setLocalSimulations(updatedSimulations)
        if (data.progress === 100) {
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
  }, [project]) // Re-run the hook when selectedProject or projectsById changes

  const addSimulation = (newSimulation: Simulation) => {
    setLocalSimulations((prevSimulations) => [...prevSimulations, newSimulation])
  }

  return (
    <div className="text-foreground flex-1 p-4">
      {/* Display project title and description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-lg text-muted-foreground mt-2">{project.description}</p>
      </div>
      <div className="flex justify-between items-center mb-8">
        <Button onClick={() => setShowNewSimulationModal(true)} variant="default" className="mt-4">
          New Simulation
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {localSimulations?.map((simulation) => (
          <Card
            key={simulation.id}
            className="p-4 bg-slate-800 rounded cursor-pointer"
            onClick={() =>
              router.push(
                `/projects/${project.id}/simulations/${simulation.id}?projectName=${project.name}`
              )
            }
          >
            <CardHeader>
              <CardTitle className="text-xl mb-2">{simulation.name}</CardTitle>
              <CardDescription>
                <strong>Started:</strong> {formatDateTime(simulation.started_at)}
                {simulation.finished_at && (
                  <>
                    <br />
                    <strong>Finished:</strong> {formatDateTime(simulation.finished_at)}
                  </>
                )}
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
            {simulation.progress < 100 && (
              <>
                <p className="mt-4">Progress: {simulation.progress}%</p>
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
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
