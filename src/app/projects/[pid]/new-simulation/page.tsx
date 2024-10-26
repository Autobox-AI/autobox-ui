'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const NewSimulation = ({ params }: { params: { pid: string } }) => {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    simulationName: '',
    maxSteps: 150,
    timeout: 600,
    task: '',
    orchestratorName: '',
    instruction: '',
    agents: [{ name: '', role: '' }],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAgentChange = (index: number, field: 'name' | 'role', value: string) => {
    const agents = [...formData.agents]
    agents[index][field] = value
    setFormData({ ...formData, agents })
  }

  const addAgent = () =>
    setFormData({ ...formData, agents: [...formData.agents, { name: '', role: '' }] })

  const removeAgent = (index: number) =>
    setFormData({ ...formData, agents: formData.agents.filter((_, i) => i !== index) })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string)
        setFormData(jsonData)
      } catch (error) {
        console.error('Error parsing JSON:', error)
        alert('Invalid file format')
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:8000/simulations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Failed to create simulation')

      router.push(`/projects/${params.pid}/simulations`)
    } catch (err) {
      console.error(err)
      alert('Failed to create simulation')
    }
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Create New Simulation</h1>

        {/* File Upload */}
        <div className="mb-4">
          <Label>Upload Configuration File</Label>
          <Input type="file" onChange={handleFileUpload} className="w-800 mt-2" />
        </div>

        {/* Simulation Name */}
        <div className="mb-4">
          <Tooltip>
            <TooltipTrigger>
              <Label>Simulation Name</Label>
            </TooltipTrigger>
            <TooltipContent>Enter a unique name for your simulation.</TooltipContent>
          </Tooltip>
          <Input
            className="w-1/2 mt-2" // Smaller width for the name
            name="simulationName"
            value={formData.simulationName}
            onChange={handleInputChange}
          />
        </div>

        {/* Max Steps */}
        <div className="mb-4">
          <Tooltip>
            <TooltipTrigger>
              <Label>Max Steps</Label>
            </TooltipTrigger>
            <TooltipContent>Set the maximum steps for the simulation.</TooltipContent>
          </Tooltip>
          <Input
            type="number"
            className="w-24 mt-2" // Smaller width for numbers
            name="maxSteps"
            value={formData.maxSteps}
            onChange={handleInputChange}
          />
        </div>

        {/* Timeout */}
        <div className="mb-4">
          <Tooltip>
            <TooltipTrigger>
              <Label>Timeout (seconds)</Label>
            </TooltipTrigger>
            <TooltipContent>Set the timeout duration in seconds.</TooltipContent>
          </Tooltip>
          <Input
            type="number"
            className="w-24 mt-2" // Smaller width for numbers
            name="timeout"
            value={formData.timeout}
            onChange={handleInputChange}
          />
        </div>

        {/* Task */}
        <div className="mb-4">
          <Tooltip>
            <TooltipTrigger>
              <Label>Task</Label>
            </TooltipTrigger>
            <TooltipContent>Describe the task for this simulation.</TooltipContent>
          </Tooltip>
          <Textarea name="task" value={formData.task} onChange={handleInputChange} />
        </div>

        {/* Orchestrator Name */}
        <div className="mb-4">
          <Tooltip>
            <TooltipTrigger>
              <Label>Orchestrator Name</Label>
            </TooltipTrigger>
            <TooltipContent>Enter the name of the orchestrator for this simulation.</TooltipContent>
          </Tooltip>
          <Input
            className="w-1/2 mt-2" // Smaller width for the name
            name="orchestratorName"
            value={formData.orchestratorName}
            onChange={handleInputChange}
          />
        </div>

        {/* Orchestrator Instruction */}
        <div className="mb-4">
          <Tooltip>
            <TooltipTrigger>
              <Label>Orchestrator Instruction</Label>
            </TooltipTrigger>
            <TooltipContent>Describe the instructions for the orchestrator.</TooltipContent>
          </Tooltip>
          <Textarea name="instruction" value={formData.instruction} onChange={handleInputChange} />
        </div>

        {/* Agents */}
        <div className="mb-4">
          <Tooltip>
            <TooltipTrigger>
              <Label>Agents</Label>
            </TooltipTrigger>
            <TooltipContent>Add or remove agents for the simulation.</TooltipContent>
          </Tooltip>
          {formData.agents.map((agent, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between items-center">
                <Input
                  className="w-1/2 mt-2"
                  placeholder="Agent Name"
                  value={agent.name}
                  onChange={(e) => handleAgentChange(index, 'name', e.target.value)}
                />
                <Button variant="destructive" onClick={() => removeAgent(index)}>
                  Remove
                </Button>
              </div>
              <Textarea
                className="mt-2 w-full mt-2"
                placeholder="Agent Role"
                value={agent.role}
                onChange={(e) => handleAgentChange(index, 'role', e.target.value)}
              />
            </div>
          ))}
          <Button onClick={addAgent} variant="secondary" className="mt-2">
            + Add Agent
          </Button>
        </div>

        {/* Submit Button */}
        <Button onClick={handleSubmit} className="mt-4" variant="default">
          Run Simulation
        </Button>
      </div>
    </TooltipProvider>
  )
}

export default NewSimulation
