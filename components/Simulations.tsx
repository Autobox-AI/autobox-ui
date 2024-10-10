import { useState } from "react";
import NewSimulationModal from "./NewSimulationModal"; // Modal for new simulation

// You can use better icons or images for "Success" and "Failed"
const STATUS_ICONS = {
  success: "✅",
  failed: "❌",
};

const Simulations = ({ selectedProject }) => {
  const [showModal, setShowModal] = useState(false);

  // State to store simulations for the selected project, including progress and status
  const [simulationsData, setSimulationsData] = useState({
    "Project A": [
      {
        id: "1",
        name: "Simulation A",
        startedAt: "2023-10-01",
        finishedAt: "2023-10-02", // Finished timestamp
        progress: 100,
        status: "success", // Status can be 'success' or 'failed'
      },
    ],
    "Project B": [
      {
        id: "2",
        name: "Simulation B",
        startedAt: "2023-09-29",
        finishedAt: "2023-09-30",
        progress: 100,
        status: "success",
      },
    ],
    "Project C": [
      {
        id: "3",
        name: "Simulation C",
        startedAt: "2023-09-25",
        finishedAt: "2023-09-26",
        progress: 100,
        status: "failed",
      },
    ],
  });

  // Get simulations for the currently selected project
  const simulations = simulationsData[selectedProject] || [];

  // Function to add a new simulation with progress tracking
  const addSimulation = (newSimulation) => {
    setSimulationsData((prevSimulations) => ({
      ...prevSimulations,
      [selectedProject]: [...prevSimulations[selectedProject], newSimulation],
    }));

    // Simulate progress over 10 seconds
    const intervalId = setInterval(() => {
      setSimulationsData((prevSimulations) => {
        const updatedSimulations = prevSimulations[selectedProject].map((sim) =>
          sim.id === newSimulation.id
            ? { ...sim, progress: sim.progress + 10 } // Increment progress by 10
            : sim
        );
        return { ...prevSimulations, [selectedProject]: updatedSimulations };
      });
    }, 1000);

    // Stop progress updates after 10 seconds and randomly decide success/failure
    setTimeout(() => {
      clearInterval(intervalId);
      setSimulationsData((prevSimulations) => {
        const updatedSimulations = prevSimulations[selectedProject].map((sim) =>
          sim.id === newSimulation.id
            ? {
                ...sim,
                progress: 100, // Set progress to 100%
                finishedAt: new Date().toISOString().split("T")[0], // Set finished timestamp
                status: Math.random() > 0.2 ? "success" : "failed", // Randomly succeed or fail
              }
            : sim
        );
        return { ...prevSimulations, [selectedProject]: updatedSimulations };
      });
    }, 10000); // After 10 seconds, stop updating progress
  };

  return (
    <div className="text-white flex-1 p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{selectedProject}</h1>
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={() => setShowModal(true)}
        >
          New Simulation
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {simulations.map((simulation) => (
          <div key={simulation.id} className="p-4 bg-gray-800 rounded">
            <h2 className="text-xl font-semibold mb-2">{simulation.name}</h2>
            <p>Started: {simulation.startedAt}</p>

            {/* Only show progress if the simulation is not finished */}
            {simulation.progress < 100 && (
              <p>Progress: {simulation.progress}%</p>
            )}

            {/* Show finished timestamp and status only when the simulation is done */}
            {simulation.progress === 100 && (
              <>
                <p>Finished: {simulation.finishedAt}</p>
                <p>Status: {STATUS_ICONS[simulation.status]}</p>
              </>
            )}

            {/* Show progress bar only if the simulation is still in progress */}
            {simulation.progress < 100 && (
              <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{ width: `${simulation.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <NewSimulationModal
          onClose={() => setShowModal(false)}
          addSimulation={addSimulation} // Pass the function to add a new simulation
        />
      )}
    </div>
  );
};

export default Simulations;
