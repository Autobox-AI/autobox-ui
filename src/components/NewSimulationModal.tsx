import { Button } from '@/components/ui/button'
import { Simulation } from '@/schemas'
import { useEffect, useState } from 'react'

type NewSimulationModalProps = {
  onClose: () => void
  addSimulation: (newSimulation: Simulation) => void
}

const NewSimulationModal = ({ onClose, addSimulation }: NewSimulationModalProps) => {
  const [configFile, setConfigFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<{
    simulationName: string
    maxSteps: number
    timeout: number
    task: string
    orchestratorName: string
    instruction: string
    agents: { name: string; role: string }[]
  }>({
    simulationName: '',
    maxSteps: 150,
    timeout: 600,
    task: '',
    orchestratorName: '',
    instruction: '',
    agents: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [newSimulationConfig, setNewSimulationConfig] = useState(null)
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    const formValid =
      !!formData.simulationName &&
      !!formData.maxSteps &&
      !!formData.timeout &&
      !!formData.task &&
      !!formData.orchestratorName &&
      !!formData.instruction &&
      formData.agents.length >= 2 &&
      formData.agents.every((agent) => agent.name && agent.role)

    setIsFormValid(formValid)
  }, [formData])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files ? e.target.files[0] : null
    if (file) {
      setConfigFile(file)
    }

    const reader = new FileReader()
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const result = event.target?.result

        if (typeof result === 'string') {
          const configData = JSON.parse(result)
          setNewSimulationConfig(configData)
          // Pre-fill the form inputs with the parsed config data, including agents
          setFormData({
            simulationName: configData.name || '',
            maxSteps: configData.max_steps || 150,
            timeout: configData.timeout || 600,
            task: configData.task || '',
            orchestratorName: configData.orchestrator?.name || '',
            instruction: configData.orchestrator?.instruction || '',
            agents: configData.agents || [], // Pre-fill agents if available
          })
        } else {
          alert('Invalid file format')
        }
      } catch (error) {
        alert('Invalid JSON file format')
      }
    }
    if (file) {
      reader.readAsText(file)
    }
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle agent input changes
  const handleAgentChange = (
    index: number,
    field: keyof (typeof formData.agents)[0],
    value: string
  ) => {
    const newAgents = [...formData.agents]
    newAgents[index][field] = value
    setFormData({ ...formData, agents: newAgents })
  }

  // Add new agent
  const addAgent = () => {
    setFormData({
      ...formData,
      agents: [...formData.agents, { name: '', role: '' }],
    })
  }

  // Remove agent
  const removeAgent = (index: number) => {
    const newAgents = formData.agents.filter((_, i) => i !== index)
    setFormData({ ...formData, agents: newAgents })
  }

  // Handle running the simulation
  const handleRunSimulation = async () => {
    setIsLoading(true)

    // Mock the simulation process
    const newSimulation2 = {
      id: Math.random().toString(36).substr(2, 9), // Generate random ID
      name: formData.simulationName || 'New Simulation',
      startedAt: new Date().toISOString().split('T')[0],
      finishedAt: '',
      progress: 0, // Start with 0% progress
      status: 'loading', // Initial status is 'loading'
    }

    try {
      const response = await fetch(`http://localhost:8000/simulations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSimulationConfig),
      })
      if (!response.ok) {
        throw new Error('Failed to create simulation')
      }

      const newSimulation = await response.json()

      // Call addSimulation to update the main screen with the new simulation
      addSimulation(newSimulation)

      setIsLoading(false)
      onClose() // Close the modal and return to the main screen
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      alert('Failed to create simulation')
    }

    // Close modal after triggering the simulation
    setTimeout(() => {
      setIsLoading(false)
      onClose() // Close the modal and return to the main screen
    }, 500)
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
      <div className="bg-card p-6 rounded-lg text-card-foreground w-1/2 h-[600px] max-h-[600px] flex flex-col relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground text-2xl focus:outline-none"
        >
          &times;
        </button>

        <h2 className="text-2xl mb-4">Create New Simulation</h2>

        {isLoading ? (
          <div className="text-center flex-grow">
            <p>Running simulation...</p>
            <div className="spinner mt-4"></div>
          </div>
        ) : (
          <>
            {/* Scrollable content container */}
            <div className="flex-grow overflow-y-auto">
              <div className="mb-4">
                <label className="block mb-2">Upload Config File</label>
                <input type="file" onChange={handleFileUpload} className="w-full p-2" />
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
                {/* <button
                  onClick={addAgent}
                  className="bg-blue-500 p-2 rounded-full text-xl w-10 h-10 flex items-center justify-center"
                >
                  +
                </button> */}
                <Button
                  onClick={addAgent}
                  variant="default"
                  className="mt-1 rounded-full justify-center items-center flex"
                >
                  +
                </Button>
              </div>

              {formData.agents.map((agent, index) => (
                <div key={index} className="mb-4 border-b border-border pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg">Agent {index + 1}</h4>
                    <Button onClick={() => removeAgent(index)} variant="default" className="mt-4">
                      Remove Agent
                    </Button>
                  </div>

                  <div className="mb-2">
                    <label className="block mb-2">Agent Name</label>
                    <input
                      type="text"
                      value={agent.name}
                      onChange={(e) => handleAgentChange(index, 'name', e.target.value)}
                      className="w-full p-2 bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Agent Role</label>
                    <textarea
                      value={agent.role}
                      onChange={(e) => handleAgentChange(index, 'role', e.target.value)}
                      className="w-full p-2 bg-gray-800"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky buttons */}
            <div className="flex justify-between mt-4 sticky bottom-0 bg-background p-4">
              <Button onClick={onClose} variant="default" className="mt-4">
                Cancel
              </Button>
              <Button
                onClick={handleRunSimulation}
                variant="default"
                // disabled={!isFormValid}
                className={`mt-4 ${
                  isFormValid ? 'cursor-pointer' : 'bg-gray-500 cursor-not-allowed'
                }`}
              >
                Run Simulation
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default NewSimulationModal
