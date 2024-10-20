'use client'

import { Simulation } from '@/schemas'
import { useRouter } from 'next/navigation' // For navigation
import { useState } from 'react'
import NewSimulationModal from './NewSimulationModal' // Modal for new simulation
import { useProjectData } from './ProjectContext'

const Simulations = ({ selectedProject }: { selectedProject: string }) => {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const { projectsById } = useProjectData()
  // const [simulationsData, setSimulationsData] = useState({
  //   "1": [
  //     {
  //       id: "1",
  //       name: "Simulation A",
  //       startedAt: "2023-10-01",
  //       finishedAt: "2023-10-02",
  //       progress: 100,
  //       status: "success",
  //     },
  //   ],
  //   "2": [
  //     {
  //       id: "2",
  //       name: "Simulation B",
  //       startedAt: "2023-09-29",
  //       finishedAt: "2023-09-30",
  //       progress: 100,
  //       status: "success",
  //     },
  //   ],
  //   "3": [
  //     {
  //       id: "3",
  //       name: "Simulation C",
  //       startedAt: "2023-09-25",
  //       finishedAt: "2023-09-26",
  //       progress: 100,
  //       status: "failed",
  //     },
  //   ],
  // });

  // Ensure selectedProject is defined before accessing it
  if (!selectedProject || !projectsById[selectedProject]) {
    return <div className="text-white">No simulations found for this project.</div>
  }

  // Function to update the progress of a simulation
  const updateProgress = (simulationId: string) => {
    // const intervalId = setInterval(() => {
    //   setSimulationsData((prevData) => {
    //     const updatedSimulations = prevData[selectedProject].map((sim) => {
    //       if (sim.id === simulationId && sim.progress < 100) {
    //         return { ...sim, progress: sim.progress + 10 };
    //       }
    //       return sim;
    //     });
    //     return {
    //       ...prevData,
    //       [selectedProject]: updatedSimulations,
    //     };
    //   });
    // }, 1000);
    // Stop progress updates after it reaches 100%
    // setTimeout(() => {
    //   clearInterval(intervalId);
    //   setSimulationsData((prevData) => {
    //     const updatedSimulations = prevData[selectedProject].map((sim) => {
    //       if (sim.id === simulationId) {
    //         return {
    //           ...sim,
    //           progress: 100,
    //           finishedAt: new Date().toISOString().split("T")[0], // Set the finished timestamp
    //           status: Math.random() < 0.5 ? "success" : "failed", // Randomize status for now
    //         };
    //       }
    //       return sim;
    //     });
    //     return {
    //       ...prevData,
    //       [selectedProject]: updatedSimulations,
    //     };
    //   });
    // }, 10000); // 10 seconds to complete simulation
  }

  // Add a new simulation with progress tracking
  const addSimulation = (newSimulation: Simulation) => {
    // Add the new simulation to the project
    // setSimulationsData((prevData) => ({
    //   ...prevData,
    //   [selectedProject]: [...prevData[selectedProject], newSimulation],
    // }));

    // Start the progress simulation for the new simulation
    updateProgress(newSimulation.id)
  }

  return (
    <div className="text-white flex-1 p-4">
      <div className="flex justify-between items-center mb-8">
        {/* <h1 className="text-2xl font-bold">{selectedProject}</h1> */}
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => setShowModal(true)}>
          New Simulation
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {projectsById[selectedProject]?.simulations?.map((simulation) => (
          <div
            key={simulation.id}
            className="p-4 bg-gray-800 rounded cursor-pointer"
            onClick={() => router.push(`/projects/${selectedProject}/simulations/${simulation.id}`)}
          >
            <h2 className="text-xl font-semibold mb-2">{simulation.name}</h2>
            <p>Started: {simulation.started_at}</p>
            {/* Always show finished timestamp */}
            {simulation.progress === 100 && (
              <>
                <p>Finished: {simulation.finished_at}</p>
              </>
            )}

            {/* Show only the status icon */}
            <p>
              Status:
              {simulation.status === 'in_progress' && <span>🔄</span>}
              {simulation.status === 'completed' && <span>✅</span>}
              {simulation.status === 'failed' && <span style={{ color: 'red' }}>❌ Failed</span>}
              {simulation.status === 'aborted' && (
                <span style={{ color: 'orange' }}>⚠️ Aborted</span>
              )}
            </p>

            {/* Show progress if the simulation is still running */}
            {simulation.progress < 100 && (
              <>
                <p>Progress: {simulation.progress}%</p>
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${simulation.progress}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <NewSimulationModal onClose={() => setShowModal(false)} addSimulation={addSimulation} />
      )}
    </div>
  )
}

export default Simulations
