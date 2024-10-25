'use client'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Simulation } from '@/schemas'
import { formatDateTime } from '@/utils'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NewSimulationModal from './NewSimulationModal'
import { useProjectData } from './ProjectContext'

const Simulations = ({ simulations }: { simulations: Simulation[] }) => {
  const router = useRouter()
  const [showNewSimulationModal, setShowNewSimulationModal] = useState(false)
  const { projectsById, setProjectsById } = useProjectData()

  if (simulations.length === 0) {
    return <div className="text-foreground">No simulations found for this project.</div>
  }

  useEffect(() => {
    const eventSources: EventSource[] = []

    const inProgressSimulations = simulations?.filter(
      (simulation) => simulation.status === 'in progress'
    )

    simulations?.forEach((simulation) => {
      const url = `http://localhost:8000/simulations/${simulation.id}?streaming=true`
      const eventSource = new EventSource(url)

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data) as Simulation

        // setProjectsById((prevData) => {
        //   if (!prevData || !prevData[selectedProject]) {
        //     return prevData
        //   }

        //   const updatedSimulations = prevData[selectedProject].simulations?.map((sim) => {
        //     if (sim.id === data.id) {
        //       return {
        //         ...data,
        //       }
        //     }
        //     return sim
        //   })

        //   return {
        //     ...prevData,
        //     [selectedProject]: {
        //       ...prevData[selectedProject],
        //       simulations: updatedSimulations,
        //     },
        //   }
        // })
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
  }, [projectsById, setProjectsById]) // Re-run the hook when selectedProject or projectsById changes

  const addSimulation = (newSimulation: Simulation) => {
    setProjectsById((prevData) => {
      const updatedProject = {
        ...prevData[selectedProject],
        simulations: [...(prevData[selectedProject].simulations || []), newSimulation], // Add new simulation
      }

      return {
        ...prevData,
        [selectedProject]: updatedProject, // Update the specific project
      }
    })
  }
  return (
    <div className="text-foreground flex-1 p-4">
      <div className="flex justify-between items-center mb-8">
        <Button onClick={() => setShowNewSimulationModal(true)} variant="default" className="mt-4">
          New Simulation
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {projectsById[selectedProject]?.simulations?.map((simulation) => (
          <Card
            key={simulation.id}
            className="p-4 bg-slate-800 rounded cursor-pointer"
            onClick={() => router.push(`/projects/${selectedProject}/simulations/${simulation.id}`)}
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
  // return (
  //   <div className="text-foreground flex-1 p-4">
  //     <div className="flex justify-between items-center mb-8">
  //       <Button onClick={() => setShowNewSimulationModal(true)} variant="default" className="mt-4">
  //         New Simulation
  //       </Button>
  //     </div>

  //     <div className="grid grid-cols-3 gap-4">
  //       {projectsById[selectedProject]?.simulations?.map((simulation) => (
  //         <div
  //           key={simulation.id}
  //           className="p-4 bg-gray-800 rounded cursor-pointer"
  //           onClick={() => router.push(`/projects/${selectedProject}/simulations/${simulation.id}`)}
  //         >
  //           <h2 className="text-xl font-semibold mb-2">{simulation.name}</h2>
  //           <p>
  //             <strong>Started:</strong> {formatDateTime(simulation.started_at)}
  //           </p>
  //           {simulation.finished_at && (
  //             <>
  //               <p>
  //                 <strong>Finished:</strong> {formatDateTime(simulation.finished_at)}
  //               </p>
  //             </>
  //           )}
  //           <p>
  //             <strong>Status:</strong>
  //             {simulation.status === 'in progress' && <span> 🔄</span>}
  //             {simulation.status === 'completed' && <span> ✅</span>}
  //             {simulation.status === 'failed' && <span style={{ color: 'red' }}> ❌ Failed</span>}
  //             {simulation.status === 'aborted' && (
  //               <span style={{ color: 'orange' }}> ⚠️ Aborted</span>
  //             )}
  //           </p>

  //           {/* Show progress if the simulation is still running */}
  //           {simulation.progress < 100 && (
  //             <>
  //               <p>Progress: {simulation.progress}%</p>
  //               {/* Progress Bar */}
  //               <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
  //                 <div
  //                   className="bg-blue-500 h-2.5 rounded-full"
  //                   style={{ width: `${simulation.progress}%` }}
  //                 ></div>
  //               </div>
  //             </>
  //           )}
  //         </div>
  //       ))}
  //     </div>

  //     {showNewSimulationModal && (
  //       <NewSimulationModal
  //         onClose={() => setShowNewSimulationModal(false)}
  //         addSimulation={addSimulation}
  //       />
  //     )}
  //   </div>
  // )
}

export default Simulations
