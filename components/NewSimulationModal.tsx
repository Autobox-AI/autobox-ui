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
    agents: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handle file upload and pre-fill inputs
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setConfigFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const configData = JSON.parse(event.target.result);

        // Pre-fill the form inputs with the parsed config data, including agents
        setFormData({
          simulationName: configData.simulation?.name || "",
          maxSteps: configData.simulation?.max_steps || 150,
          timeout: configData.simulation?.timeout || 600,
          task: configData.simulation?.task || "",
          orchestratorName: configData.orchestrator?.name || "",
          instruction: configData.orchestrator?.instruction || "",
          agents: configData.agents || [], // Pre-fill agents if available
        });
      } catch (error) {
        alert("Invalid JSON file format");
      }
    };
    reader.readAsText(file);
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle agent input changes
  const handleAgentChange = (index, field, value) => {
    const newAgents = [...formData.agents];
    newAgents[index][field] = value;
    setFormData({ ...formData, agents: newAgents });
  };

  // Add new agent
  const addAgent = () => {
    setFormData({
      ...formData,
      agents: [...formData.agents, { name: "", role: "" }],
    });
  };

  // Remove agent
  const removeAgent = (index) => {
    const newAgents = formData.agents.filter((_, i) => i !== index);
    setFormData({ ...formData, agents: newAgents });
  };

  // Handle running the simulation
  const handleRunSimulation = () => {
    setIsLoading(true);

    // Mock the simulation process
    const newSimulation = {
      id: Math.random().toString(36).substr(2, 9), // Generate random ID
      name: formData.simulationName || "New Simulation",
      startedAt: new Date().toISOString().split("T")[0],
      finishedAt: "",
      progress: 0, // Start with 0% progress
      status: "loading", // Initial status is 'loading'
    };

    // Call addSimulation to update the main screen with the new simulation
    addSimulation(newSimulation);

    // Close modal after triggering the simulation
    setTimeout(() => {
      setIsLoading(false);
      onClose(); // Close the modal and return to the main screen
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
      <div className="bg-gray-900 p-6 rounded-lg text-white w-1/2 h-[600px] max-h-[600px] overflow-y-auto">
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

            <div className="mb-4">
              <label className="block mb-2">Max Steps</label>
              <input
                type="number"
                name="maxSteps"
                value={formData.maxSteps}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">Timeout (seconds)</label>
              <input
                type="number"
                name="timeout"
                value={formData.timeout}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">Task</label>
              <textarea
                name="task"
                value={formData.task}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">Orchestrator Name</label>
              <input
                type="text"
                name="orchestratorName"
                value={formData.orchestratorName}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">Orchestrator Instruction</label>
              <textarea
                name="instruction"
                value={formData.instruction}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800"
              />
            </div>

            {/* Agents Section */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl">Add Agents</h3>
              <button
                onClick={addAgent}
                className="bg-blue-500 p-2 rounded-full text-xl w-10 h-10 flex items-center justify-center"
              >
                +
              </button>
            </div>

            {formData.agents.map((agent, index) => (
              <div key={index} className="mb-4 border-b border-gray-700 pb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg">Agent {index + 1}</h4>
                  <button
                    onClick={() => removeAgent(index)}
                    className="bg-red-500 p-1 rounded text-xs"
                  >
                    Remove Agent
                  </button>
                </div>

                <div className="mb-2">
                  <label className="block mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={agent.name}
                    onChange={(e) =>
                      handleAgentChange(index, "name", e.target.value)
                    }
                    className="w-full p-2 bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block mb-2">Agent Role</label>
                  <textarea
                    value={agent.role}
                    onChange={(e) =>
                      handleAgentChange(index, "role", e.target.value)
                    }
                    className="w-full p-2 bg-gray-800"
                  />
                </div>
              </div>
            ))}

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
