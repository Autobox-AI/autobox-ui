'use client'
import { MoodSlider } from '@/components/MoodSlider'
import ToolsTable from '@/components/ToolsTable'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { CalendarIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const initialMoodSpectrums = [
  { labelLeft: 'Calm', labelRight: 'Anxious', defaultValue: 50 },
  { labelLeft: 'Optimistic', labelRight: 'Pessimistic', defaultValue: 60 },
  { labelLeft: 'Trusting', labelRight: 'Suspicious', defaultValue: 40 },
  { labelLeft: 'Friendly', labelRight: 'Hostile', defaultValue: 70 },
  { labelLeft: 'Energetic', labelRight: 'Tired', defaultValue: 55 },
  { labelLeft: 'Curious', labelRight: 'Apathetic', defaultValue: 65 },
  { labelLeft: 'Logical', labelRight: 'Emotional', defaultValue: 75 },
  { labelLeft: 'Confident', labelRight: 'Insecure', defaultValue: 80 },
  { labelLeft: 'Aggressive', labelRight: 'Peaceful', defaultValue: 45 },
  { labelLeft: 'Organized', labelRight: 'Chaotic', defaultValue: 60 },
  { labelLeft: 'Strategic', labelRight: 'Impulsive', defaultValue: 50 },
  { labelLeft: 'Ambitious', labelRight: 'Content', defaultValue: 70 },
  { labelLeft: 'Altruistic', labelRight: 'Selfish', defaultValue: 30 },
]

// First, define interfaces for the metric structure
interface Metric {
  name: string
  description: string
  prometheus_type: string
  unit: string
}

interface FormData {
  simulationName: string
  maxSteps: number
  timeout: number
  task: string
  orchestratorName: string
  instruction: string
  metrics: Record<string, Metric> // This allows string indexing of Metric objects
  agents: {
    name: string
    role: string
    backstory: string
    tools: string[]
  }[]
  simulationType: string
  scheduleDate: Date | null
  mood: number[]
}

const NewSimulation = ({ params }: { params: { pid: string } }) => {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const searchParams = useSearchParams()
  const projectName = searchParams.get('projectName') ?? 'Unknown'
  const [moodSpectrums, setMoodSpectrums] = useState(initialMoodSpectrums)
  const [moodValues, setMoodValues] = useState(moodSpectrums.map((mood) => mood.defaultValue))
  const [newMoodLeft, setNewMoodLeft] = useState('')
  const [newMoodRight, setNewMoodRight] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGenerativeMetricsEnabled, setIsGenerativeMetricsEnabled] = useState(true)
  const [isGenerativeAlertsEnabled, setIsGenerativeAlertsEnabled] = useState(true)
  const [isHumanInTheLoopEnabled, setIsHumanInTheLoopEnabled] = useState(true)
  const [expandedAgentsTools, setExpandedAgentsTools] = useState<boolean[]>([true])
  const [expandedAgentsMood, setExpandedAgentsMood] = useState<boolean[]>([true])
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

  const toggleExpandAgentsTools = (index: number) => {
    const newExpandedAgentsTools = [...expandedAgentsTools]
    newExpandedAgentsTools[index] = !newExpandedAgentsTools[index]
    setExpandedAgentsTools(newExpandedAgentsTools)
  }

  const toggleExpandAgentsMood = (index: number) => {
    const newExpandedAgentsMood = [...expandedAgentsMood]
    newExpandedAgentsMood[index] = !newExpandedAgentsMood[index]
    setExpandedAgentsMood(newExpandedAgentsMood)
  }

  const toggleHumanInTheLoop = () => {
    setIsHumanInTheLoopEnabled(!isHumanInTheLoopEnabled)
  }

  const toggleGenerativeMetrics = () => {
    setIsGenerativeMetricsEnabled(!isGenerativeMetricsEnabled)
  }

  const toggleGenerativeAlerts = () => {
    setIsGenerativeAlertsEnabled(!isGenerativeAlertsEnabled)
  }

  const handleMoodChange = (index: number, value: number) => {
    const newMoodValues = [...moodValues]
    newMoodValues[index] = value
    setMoodValues(newMoodValues)
  }

  const handleAddMood = () => {
    if (newMoodLeft && newMoodRight) {
      const newMood = { labelLeft: newMoodLeft, labelRight: newMoodRight, defaultValue: 50 }
      setMoodSpectrums([...moodSpectrums, newMood])
      setMoodValues([...moodValues, 50]) // Default value for new mood
      setNewMoodLeft('')
      setNewMoodRight('')
      setIsDialogOpen(false)
    }
  }

  const handleBackToProject = () => {
    router.push(`/projects/${params.pid}`)
  }

  const [formData, setFormData] = useState<FormData>({
    simulationName: '',
    maxSteps: 150,
    timeout: 600,
    task: '',
    orchestratorName: '',
    instruction: '',
    metrics: {}, // Now TypeScript knows this can be indexed with strings
    agents: [],
    simulationType: 'default',
    scheduleDate: null,
    mood: [50],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleToolChange = (agentIndex: number, tool: string, selected: boolean) => {
    const agents = [...formData.agents]
    if (selected) {
      agents[agentIndex].tools = [...agents[agentIndex].tools, tool]
    } else {
      agents[agentIndex].tools = agents[agentIndex].tools.filter((t) => t !== tool)
    }
    setFormData({ ...formData, agents })
  }

  const handleAgentChange = (
    index: number,
    field: 'name' | 'role' | 'backstory',
    value: string
  ) => {
    const agents = [...formData.agents]
    agents[index][field] = value
    setFormData({ ...formData, agents })
  }

  const addAgent = () =>
    setFormData({
      ...formData,
      agents: [...formData.agents, { name: '', role: '', backstory: '', tools: [] }],
    })

  const removeAgent = (index: number) =>
    setFormData({ ...formData, agents: formData.agents.filter((_, i) => i !== index) })

  // const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0]
  //   if (!file) return
  //   setSelectedFile(file)

  //   const reader = new FileReader()
  //   reader.onload = (event) => {
  //     try {
  //       const jsonData = JSON.parse(event.target?.result as string)
  //       setFormData(jsonData)
  //     } catch (error) {
  //       console.error('Error parsing JSON:', error)
  //       alert('Invalid file format')
  //     }
  //   }
  //   reader.readAsText(file)
  // }
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string)

        // Update the form data based on the JSON data
        setFormData({
          simulationName: jsonData.name || '',
          maxSteps: jsonData.max_steps || 150,
          timeout: jsonData.timeout || 600,
          task: jsonData.task || '',
          orchestratorName: jsonData.orchestrator?.name || '',
          instruction: jsonData.orchestrator?.instruction || '',
          metrics: jsonData.metrics || {},
          agents:
            jsonData.agents?.map((agent: any) => ({
              name: agent.name || '',
              role: agent.role || '',
              backstory: agent.backstory || '',
              tools: agent.tools || [], // Assuming 'tools' is part of the agent data in the JSON
            })) || [],
          simulationType: jsonData.type || 'default',
          scheduleDate: jsonData.schedule ? new Date(jsonData.schedule) : null,
          mood: [50], // Adjust mood handling as needed, since it's not in the JSON
        })

        // Set additional state variables
        setIsHumanInTheLoopEnabled(jsonData.is_hitl_enabled || false)
        setIsGenerativeMetricsEnabled(!!jsonData.metrics) // Assuming metrics presence enables generative metrics
        // Adjust more states based on other JSON fields if necessary
      } catch (error) {
        console.error('Error parsing JSON:', error)
        alert('Invalid file format')
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    try {
      const filteredData = {
        name: formData.simulationName, // "name" field
        max_steps: formData.maxSteps, // "max_steps" field
        timeout: formData.timeout, // "timeout" field
        task: formData.task, // "task" field
        orchestrator: {
          name: formData.orchestratorName, // "orchestrator.name" field
          instruction: formData.instruction, // "orchestrator.instruction" field
          mailbox: { max_size: 400 }, // Hardcoded mailbox value
          llm: { model: 'gpt-4o-2024-08-06' }, // Hardcoded LLM model value
        },
        agents: formData.agents.map((agent) => ({
          name: agent.name, // "agent.name" field
          role: agent.role, // "agent.role" field
          backstory: agent.backstory, // "agent.backstory" field
          llm: { model: 'gpt-4o-2024-08-06' }, // Hardcoded LLM model value
          mailbox: { max_size: 100 }, // Hardcoded mailbox value for each agent
        })),
        metrics_path: '/Users/martin.dagostino/workspace/margostino/autobox/metrics',
        logging: {
          log_path: '/Users/martin.dagostino/workspace/margostino/autobox/logs',
          verbose: true, // Hardcoded verbose logging option
        },
        evaluator: {
          name: 'EVALUATOR', // Hardcoded evaluator name
          mailbox: { max_size: 400 }, // Hardcoded mailbox value for evaluator
          llm: { model: 'gpt-4o-2024-08-06' }, // Hardcoded LLM model for evaluator
        },
      }
      const response = await fetch(`http://localhost:8000/simulations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredData),
      })
      if (!response.ok) throw new Error('Failed to create simulation')

      setIsConfirmationOpen(false)
      router.push(`/projects/${params.pid}/simulations`)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to create simulation')
    }
  }

  const handleRunSimulation = () => {
    setIsConfirmationOpen(true)
  }

  const handleMetricChange = (metricKey: string, field: keyof Metric, value: string) => {
    setFormData((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [metricKey]: {
          ...prev.metrics[metricKey],
          [field]: value,
        },
      },
    }))
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen w-full">
        <div className="sticky top-0 z-10 w-full bg-background px-6 py-4 border-b border-zinc-800 ml-[var(--sidebar-width-icon)] md:ml-[220px]">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1">
                    <BreadcrumbEllipsis className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>Documentation</DropdownMenuItem>
                    <DropdownMenuItem>Examples</DropdownMenuItem>
                    <DropdownMenuItem>Usage</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={handleBackToProject} className="cursor-pointer">
                  {projectName}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New Simulation</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Create New Simulation</h1>

            {/* File Upload */}
            <div className="mb-4">
              <Label>Upload Configuration File</Label>
              <Input type="file" onChange={handleFileUpload} className="w-800 mt-2" />
            </div>

            {/* General Settings */}
            <h2 className="text-2xl font-semibold mb-4">General Settings</h2>
            <div className="mb-4">
              <Tooltip>
                <TooltipTrigger>
                  <Label>Max Steps</Label>
                </TooltipTrigger>
                <TooltipContent>Set the maximum steps for the simulation.</TooltipContent>
              </Tooltip>
              <Input
                type="number"
                className="w-24 mt-2"
                name="maxSteps"
                value={formData.maxSteps}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <Tooltip>
                <TooltipTrigger>
                  <Label>Timeout (seconds)</Label>
                </TooltipTrigger>
                <TooltipContent>Set the timeout duration in seconds.</TooltipContent>
              </Tooltip>
              <Input
                type="number"
                className="w-24 mt-2"
                name="timeout"
                value={formData.timeout}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4 mt-3">
              <Label className="mr-2">Schedule</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-[240px] justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Separator className="my-8" />

            {/* Simulation Section */}
            <h2 className="text-2xl font-semibold mb-4">Simulation</h2>
            <div className="mb-4">
              <Tooltip>
                <TooltipTrigger>
                  <Label>Simulation Name</Label>
                </TooltipTrigger>
                <TooltipContent>Enter a unique name for your simulation.</TooltipContent>
              </Tooltip>
              <Input
                className="w-1/2 mt-2"
                name="simulationName"
                value={formData.simulationName}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <Label>Type</Label>
              <RadioGroup
                className="mt-2"
                defaultValue={formData.simulationType}
                onValueChange={(type) => setFormData({ ...formData, simulationType: type })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="r1" />
                  <Label htmlFor="r1">Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="r2" />
                  <Label htmlFor="r2">Advanced</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <Switch
                id="hitl"
                checked={isHumanInTheLoopEnabled}
                onCheckedChange={toggleHumanInTheLoop}
              />
              <Label htmlFor="hitl">Enable Human-in-the-loop </Label>
            </div>

            <Separator className="my-8" />

            {/* Observability */}
            <h2 className="text-2xl font-semibold mb-4">Observability</h2>
            {/* Predefined Metrics Section */}
            <h2 className="text-xl font-semibold mb-4">Metrics</h2>
            <div className="flex items-center space-x-4 mb-4">
              <Switch
                id="generative-metrics"
                checked={isGenerativeMetricsEnabled}
                onCheckedChange={toggleGenerativeMetrics}
              />
              <Label htmlFor="generative-metrics">Enable Generative Metrics</Label>
            </div>

            {isGenerativeMetricsEnabled && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Generative Metrics are enabled. The system will automatically generate metrics
                  based on the simulation's settings.
                </p>
              </div>
            )}

            <h2 className="text-xl font-semibold mb-4">Alerts</h2>
            <div className="flex items-center space-x-4 mb-4">
              <Switch
                id="generative-alerts"
                checked={isGenerativeAlertsEnabled}
                onCheckedChange={toggleGenerativeAlerts}
              />
              <Label htmlFor="generative-metrics">Enable Generative Alerts</Label>
            </div>

            {isGenerativeAlertsEnabled && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Generative Alerts are enabled. The system will automatically generate alerts based
                  on the simulation's settings.
                </p>
              </div>
            )}

            <Separator className="my-8" />

            {/* Orchestrator */}
            <h2 className="text-2xl font-semibold mb-4">Orchestrator</h2>
            <div className="mb-4">
              <Tooltip>
                <TooltipTrigger>
                  <Label>Orchestrator Name</Label>
                </TooltipTrigger>
                <TooltipContent>Enter the name of the orchestrator.</TooltipContent>
              </Tooltip>
              <Input
                className="w-1/2 mt-2"
                name="orchestratorName"
                value={formData.orchestratorName}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <Tooltip>
                <TooltipTrigger>
                  <Label>Orchestrator Instruction</Label>
                </TooltipTrigger>
                <TooltipContent>Enter instructions for the orchestrator.</TooltipContent>
              </Tooltip>
              <Textarea
                className="mt-2 w-full"
                name="instruction"
                value={formData.instruction}
                onChange={handleInputChange}
              />
            </div>

            <Separator className="my-8" />

            {/* Agents */}
            <h2 className="text-2xl font-semibold mb-4">Agents</h2>
            {formData.agents.length > 0 &&
              formData.agents.map((agent, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <Input
                      className="w-1/2 mt-2"
                      placeholder="Agent Name"
                      value={agent.name}
                      onChange={(e) => handleAgentChange(index, 'name', e.target.value)}
                    />
                    <Button variant="destructive" onClick={() => removeAgent(index)}>
                      Remove
                    </Button>
                    {/* <button onClick={() => removeAgent(index)} className="ml-2">
                    <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                  </button> */}
                  </div>
                  <Textarea
                    className="w-full mt-2"
                    placeholder="Agent Role"
                    rows={1}
                    value={agent.role}
                    onChange={(e) => handleAgentChange(index, 'role', e.target.value)}
                  />
                  <Textarea
                    className="w-full mt-2"
                    placeholder="Agent Backstory"
                    value={agent.backstory}
                    rows={4}
                    onChange={(e) => handleAgentChange(index, 'backstory', e.target.value)}
                  />
                  {/* Tools Table for Each Agent */}
                  {/* Expand/Collapse on "Tools for X" click */}
                  <div
                    className="cursor-pointer mt-4 mb-2 text-lg font-semibold"
                    onClick={() => toggleExpandAgentsTools(index)}
                  >
                    Tools for {agent.name} {expandedAgentsTools[index] ? '▲' : '▼'}
                  </div>

                  {/* Conditionally show ToolsTable */}
                  {expandedAgentsTools[index] && (
                    <div className="mt-2">
                      <ToolsTable />
                    </div>
                  )}
                  {/* <div className="flex items-center space-x-4 mt-4">
                  <span>Sad</span>
                  <Slider
                    defaultValue={formData.mood}
                    max={100}
                    step={1}
                    onValueChange={(value) => setFormData({ ...formData, mood: value })}
                    className="w-[60%]"
                  />
                  <span>Happy</span>
                </div> */}
                  <div
                    className="cursor-pointer mt-4 mb-2 text-lg font-semibold"
                    onClick={() => toggleExpandAgentsMood(index)}
                  >
                    Mood for {agent.name} {expandedAgentsMood[index] ? '▲' : '▼'}
                  </div>
                  {expandedAgentsMood[index] && (
                    <div className="container mx-auto p-8">
                      {moodSpectrums.map((mood, index) => (
                        <MoodSlider
                          key={index}
                          labelLeft={mood.labelLeft}
                          labelRight={mood.labelRight}
                          defaultValue={moodValues[index]}
                          onChange={(value: number) => handleMoodChange(index, value)}
                        />
                      ))}
                      {/* Dialog for adding new mood */}
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            onClick={() => setIsDialogOpen(true)}
                            className="mt-5 ml-6"
                          >
                            + Add New Mood
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Mood Spectrum</DialogTitle>
                          </DialogHeader>
                          <div className="flex items-center space-x-4 mt-4">
                            <Input
                              placeholder="Left Mood Label"
                              value={newMoodLeft}
                              onChange={(e) => setNewMoodLeft(e.target.value)}
                            />
                            <Input
                              placeholder="Right Mood Label"
                              value={newMoodRight}
                              onChange={(e) => setNewMoodRight(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAddMood} variant="default">
                              Add Mood
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              ))}
            <Button onClick={addAgent} variant="secondary" className="mt-2">
              + Add Agent
            </Button>

            {/* Buttons at the bottom */}
            <div className="flex justify-end space-x-4 mt-8">
              <Button onClick={handleBackToProject} variant="secondary">
                Cancel
              </Button>
              <Button onClick={handleRunSimulation} variant="default">
                Run Simulation
              </Button>
            </div>
            {/* Confirmation Dialog */}
            <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Confirm Simulation Details</DialogTitle>
                </DialogHeader>

                {/* Display Metrics Confirmation */}
                <div className="space-y-4">
                  {/* Additional simulation details */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg text-white">
                    <div className="col-span-2">
                      <h3 className="font-semibold text-lg">Simulation Details</h3>
                      <Separator className="my-2 border-gray-600" />
                    </div>

                    <div>
                      <Label className="font-semibold text-gray-400">Simulation Name:</Label>
                      <p className="text-gray-200">{formData.simulationName}</p>
                    </div>

                    <div>
                      <Label className="font-semibold text-gray-400">Max Steps:</Label>
                      <p className="text-gray-200">{formData.maxSteps}</p>
                    </div>

                    <div>
                      <Label className="font-semibold text-gray-400">Timeout:</Label>
                      <p className="text-gray-200">{formData.timeout} seconds</p>
                    </div>

                    <div>
                      <Label className="font-semibold text-gray-400">Task:</Label>
                      <p className="text-gray-200">{formData.task}</p>
                    </div>

                    <div>
                      <Label className="font-semibold text-gray-400">Orchestrator Name:</Label>
                      <p className="text-gray-200">{formData.orchestratorName}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />
                  <h3 className="font-semibold text-lg">Metrics</h3>

                  {/* Make this section scrollable and collapsible */}
                  <div className="max-h-[50vh] overflow-y-auto space-y-4">
                    {formData.metrics ? (
                      Object.keys(formData.metrics).map((metricKey, index) => (
                        <div key={index} className="border border-gray-300 rounded-lg p-2">
                          {/* Collapsible section for each metric */}
                          <details>
                            <summary className="cursor-pointer text-sm font-medium">
                              {formData.metrics[metricKey].name}
                            </summary>
                            <div className="space-y-2 mt-2">
                              <div>
                                <Label>Metric Name</Label>
                                <Input
                                  value={formData.metrics[metricKey].name}
                                  onChange={(e) =>
                                    handleMetricChange(metricKey, 'name', e.target.value)
                                  }
                                />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Textarea
                                  value={formData.metrics[metricKey].description}
                                  onChange={(e) =>
                                    handleMetricChange(metricKey, 'description', e.target.value)
                                  }
                                />
                              </div>
                              <div>
                                <Label>Type</Label>
                                <Input
                                  value={formData.metrics[metricKey].prometheus_type}
                                  onChange={(e) =>
                                    handleMetricChange(metricKey, 'prometheus_type', e.target.value)
                                  }
                                />
                              </div>
                              <div>
                                <Label>Unit</Label>
                                <Input
                                  value={formData.metrics[metricKey].unit}
                                  onChange={(e) =>
                                    handleMetricChange(metricKey, 'unit', e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </details>
                        </div>
                      ))
                    ) : (
                      <p>No metrics available</p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={() => setIsConfirmationOpen(false)} variant="secondary">
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} variant="default">
                    Confirm & Run
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default NewSimulation
