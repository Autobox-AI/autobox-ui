'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const NewSimulation = ({ params }: { params: { pid: string } }) => {
  const router = useRouter()
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

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:8000/${params.pid}/simulations`, {
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
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create New Simulation</h1>

      <div className="mb-4">
        <Label>Simulation Name</Label>
        <Input name="simulationName" value={formData.simulationName} onChange={handleInputChange} />
      </div>

      <div className="mb-4">
        <Label>Max Steps</Label>
        <Input
          type="number"
          name="maxSteps"
          value={formData.maxSteps}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-4">
        <Label>Timeout (seconds)</Label>
        <Input type="number" name="timeout" value={formData.timeout} onChange={handleInputChange} />
      </div>

      <div className="mb-4">
        <Label>Task</Label>
        <Textarea name="task" value={formData.task} onChange={handleInputChange} />
      </div>

      <div className="mb-4">
        <Label>Orchestrator Name</Label>
        <Input
          name="orchestratorName"
          value={formData.orchestratorName}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-4">
        <Label>Orchestrator Instruction</Label>
        <Textarea name="instruction" value={formData.instruction} onChange={handleInputChange} />
      </div>

      <div className="mb-4">
        <Label>Agents</Label>
        {formData.agents.map((agent, index) => (
          <div key={index} className="mb-2 flex justify-between items-center">
            <Input
              placeholder="Agent Name"
              value={agent.name}
              onChange={(e) => handleAgentChange(index, 'name', e.target.value)}
            />
            <Textarea
              placeholder="Agent Role"
              value={agent.role}
              onChange={(e) => handleAgentChange(index, 'role', e.target.value)}
            />
            <Button variant="destructive" onClick={() => removeAgent(index)}>
              Remove
            </Button>
          </div>
        ))}
        <Button onClick={addAgent} variant="secondary" className="mt-2">
          + Add Agent
        </Button>
      </div>

      <Button onClick={handleSubmit} className="mt-4" variant="default">
        Create Simulation
      </Button>
    </div>
  )
}

export default NewSimulation
