"use client";

import { useRouter } from "next/navigation";

const SimulationDetails = ({ params }) => {
  const { pid: projectId, sid: simulationId } = params; // Extract projectId and simulationId
  const router = useRouter();

  // Sample simulation data for demonstration purposes
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
    "4": [
      {
        id: "4",
        name: "Simulation D",
        startedAt: "2023-10-08",
        finishedAt: "",
        progress: 70, // Simulation still in progress
        status: "in-progress",
      },
    ],
  };

  // Find the simulation based on projectId and simulationId
  const simulation = simulationsData[projectId]?.find(
    (sim) => sim.id === simulationId
  );

  if (!simulation) {
    // Render only the "Simulation not found" message if no simulation is found
    return (
      <div className="text-white p-6">
        <h1 className="text-2xl font-bold mb-4">Simulation not found</h1>
        <button
          onClick={() => router.push(`/projects/${projectId}/simulations`)}
          className="bg-blue-500 text-white p-2 mt-4 rounded"
        >
          Back to Simulations
        </button>
      </div>
    );
  }

  // Render the simulation details only if found
  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">{simulation.name}</h1>

      {/* Show progress if the simulation is still in progress */}
      {simulation.progress < 100 ? (
        <>
          <p>Started at: {simulation.startedAt}</p>
          <p>Progress: {simulation.progress}%</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${simulation.progress}%` }}
            ></div>
          </div>
        </>
      ) : (
        <>
          {/* Show finished details if simulation is complete */}
          <p>Started at: {simulation.startedAt}</p>
          <p>Finished at: {simulation.finishedAt}</p>
          <p>
            Status:{" "}
            {simulation.status === "success" ? "✅ Success" : "❌ Failed"}
          </p>
        </>
      )}

      {/* Back button to go back to the list */}
      <button
        onClick={() => router.push(`/projects/${projectId}/simulations`)}
        className="bg-blue-500 text-white p-2 mt-4 rounded"
      >
        Back to Simulations
      </button>
    </div>
  );
};

export default SimulationDetails;
