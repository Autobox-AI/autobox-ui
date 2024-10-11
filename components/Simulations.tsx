"use client";

import { useRouter } from "next/navigation"; // For navigation
import { useState } from "react";
import NewSimulationModal from "./NewSimulationModal"; // Modal for new simulation

const Simulations = ({ selectedProject }) => {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [simulationsData, setSimulationsData] = useState({
    "Project A": [
      {
        id: "1",
        name: "Simulation A",
        startedAt: "2023-10-01",
        finishedAt: "2023-10-02",
        progress: 100,
        status: "success",
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

  // Function to simulate progress over time
  const updateProgress = (simulationId) => {
    const intervalId = setInterval(() => {
      setSimulationsData((prevData) => {
        const updatedSimulations = prevData[selectedProject].map((sim) => {
          if (sim.id === simulationId && sim.progress < 100) {
            return { ...sim, progress: sim.progress + 10 };
          }
          return sim;
        });

        return {
          ...prevData,
          [selectedProject]: updatedSimulations,
        };
      });
    }, 1000);

    // Stop progress updates after it reaches 100%
    setTimeout(() => {
      clearInterval(intervalId);
      setSimulationsData((prevData) => {
        const updatedSimulations = prevData[selectedProject].map((sim) => {
          if (sim.id === simulationId) {
            return {
              ...sim,
              progress: 100,
              finishedAt: new Date().toISOString().split("T")[0], // Set the finished timestamp
              status: Math.random() < 0.5 ? "success" : "failed", // Adjust the randomness for a fair distribution
            };
          }
          return sim;
        });

        return {
          ...prevData,
          [selectedProject]: updatedSimulations,
        };
      });
    }, 10000); // 10 seconds to complete simulation
  };

  // Navigate to simulation logs page
  const goToSimulationLogs = (simulationId) => {
    router.push(`/projects/${selectedProject}/simulations/${simulationId}`);
  };

  // Add a new simulation with progress tracking
  const addSimulation = (newSimulation) => {
    setSimulationsData((prevData) => ({
      ...prevData,
      [selectedProject]: [...prevData[selectedProject], newSimulation],
    }));

    // Start the progress simulation for the new simulation
    updateProgress(newSimulation.id);
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
        {simulationsData[selectedProject].map((simulation) => (
          <div
            key={simulation.id}
            className="p-4 bg-gray-800 rounded cursor-pointer"
            onClick={() => goToSimulationLogs(simulation.id)} // Navigate on click
          >
            <h2 className="text-xl font-semibold mb-2">{simulation.name}</h2>
            <p>Started: {simulation.startedAt}</p>

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

            {/* Always show finished timestamp */}
            {simulation.progress === 100 && (
              <>
                <p>Finished: {simulation.finishedAt}</p>
                {/* Show only the status icon */}
                <p>Status: {simulation.status === "success" ? "✅" : "❌"}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <NewSimulationModal
          onClose={() => setShowModal(false)}
          addSimulation={addSimulation}
        />
      )}
    </div>
  );
};

export default Simulations;
