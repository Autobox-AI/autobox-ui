// components/NewSimulationModal.tsx
import { useState } from "react";

const NewSimulationModal = ({ onClose, addSimulation }) => {
  const [configFile, setConfigFile] = useState(null);
  const [formData, setFormData] = useState({
    simulationName: "",
    maxSteps: 150,
    timeout: 600,
    task: "",
    orchestratorName: "",
    instruction: "",
    agent1Name: "",
    agent1Role: "",
    agent2Name: "",
    agent2Role: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e) => {
    setConfigFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRunSimulation = () => {
    // Mock simulation by showing loading for 10 seconds
    setIsLoading(true);

    const newSimulation = {
      id: Math.random().toString(36).substr(2, 9), // Random ID
      name: formData.simulationName || "New Simulation",
      startedAt: new Date().toISOString().split("T")[0],
      finishedAt: new Date().toISOString().split("T")[0],
      progress: 0, // Start with 0% progress
    };

    // Call addSimulation to update the main screen with the new simulation
    addSimulation(newSimulation);

    // Close modal after triggering the simulation
    setTimeout(() => {
      setIsLoading(false);
      onClose(); // Close the modal and return to the main screen
    }, 500); // Close after a short delay
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
      <div className="bg-gray-900 p-6 rounded-lg text-white w-1/2">
        <h2 className="text-2xl mb-4">Create New Simulation</h2>

        {isLoading ? (
          <div className="text-center">
            <p>Running simulation...</p>
            <div className="spinner mt-4"></div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block mb-2">Upload Config File</label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="w-full p-2"
              />
            </div>

            <hr className="my-4" />

            <h3 className="text-xl mb-4">Or fill out the form:</h3>

            <div className="mb-4">
              <label className="block mb-2">Simulation Name</label>
              <input
                type="text"
                name="simulationName"
                value={formData.simulationName}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800"
              />
            </div>

            {/* Other form fields remain the same */}

            <div className="flex justify-between">
              <button onClick={onClose} className="bg-red-500 p-2 rounded">
                Cancel
              </button>
              <button
                onClick={handleRunSimulation}
                className="bg-blue-500 p-2 rounded"
              >
                Run Simulation
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewSimulationModal;
