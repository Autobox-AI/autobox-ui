"use client";

import { useRouter } from "next/navigation"; // For navigation
import { useState } from "react";

const ProjectSimulations = ({ params }) => {
  const { pid: projectId } = params; // Correctly map params to get projectId
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  // Sample simulations data
  const simulationsData = {
    "1": [
      {
        id: "1",
        name: "Simulation A",
        startedAt: "2023-10-01",
        finishedAt: "2023-10-02",
        progress: 100,
        status: "success",
      },
    ],
    "2": [
      {
        id: "2",
        name: "Simulation B",
        startedAt: "2023-09-29",
        finishedAt: "2023-09-30",
        progress: 100,
        status: "success",
      },
    ],
    "3": [
      {
        id: "3",
        name: "Simulation C",
        startedAt: "2023-09-25",
        finishedAt: "2023-09-26",
        progress: 100,
        status: "failed",
      },
    ],
  };

  // Navigate to simulation logs page
  const goToSimulationLogs = (simulationId) => {
    router.push(`/projects/${projectId}/simulations/${simulationId}`); // Navigate to simulation page
  };

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Simulations for {projectId}</h1>

      <div className="grid grid-cols-3 gap-4">
        {simulationsData[projectId]?.map((simulation) => (
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
                <p>Status: {simulation.status === "success" ? "✅" : "❌"}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {showModal && <NewSimulationModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default ProjectSimulations;
