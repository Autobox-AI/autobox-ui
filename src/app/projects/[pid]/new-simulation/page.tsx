'use client'
import { AgentFormCard } from '@/components/forms/AgentFormCard'
import { SimulationFormField } from '@/components/forms/SimulationFormField'
import { SimulationFormSection } from '@/components/forms/SimulationFormSection'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  simulationFormSchema,
  transformFormToApiPayload,
  type SimulationFormData,
} from '@/schemas/simulationForm'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Loader2, Plus, Upload } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

const NewSimulation = ({ params }: { params: Promise<{ pid: string }> }) => {
  const router = useRouter()
  const { toast } = useToast()
  const unwrappedParams = React.use(params)
  const searchParams = useSearchParams()
  const projectName = searchParams.get('projectName') ?? 'Unknown Project'

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SimulationFormData>({
    resolver: zodResolver(simulationFormSchema),
    defaultValues: {
      simulationName: '',
      maxSteps: 150,
      timeout: 600,
      task: '',
      instruction: '',
      metricsTemplateId: '',
      agents: [{ name: '', role: '', backstory: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'agents',
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const jsonData = JSON.parse(text)

      // Populate form with uploaded data
      setValue('simulationName', jsonData.name || '')
      setValue('maxSteps', jsonData.max_steps || 150)
      setValue('timeout', jsonData.timeout_seconds || 600)
      setValue('task', jsonData.task || '')
      setValue('instruction', jsonData.description || '')
      setValue('metricsTemplateId', jsonData.metrics?.template_id || '')

      if (jsonData.agents?.length) {
        setValue(
          'agents',
          jsonData.agents.map((agent: any) => ({
            name: agent.name || '',
            role: agent.role || '',
            backstory: agent.backstory || '',
          }))
        )
      }

      toast({
        title: 'Configuration loaded',
        description: 'Successfully imported simulation configuration',
      })
    } catch (error) {
      console.error('Error parsing file:', error)
      toast({
        title: 'Error',
        description: 'Invalid configuration file format',
        variant: 'destructive',
      })
    }
  }

  const onSubmit = async (data: SimulationFormData) => {
    setIsSubmitting(true)
    try {
      const payload = transformFormToApiPayload(data, unwrappedParams.pid)

      const response = await fetch(`/api/projects/${unwrappedParams.pid}/simulations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create simulation')
      }

      toast({
        title: 'Success',
        description: 'Simulation created successfully',
        duration: 3000,
      })

      router.push(`/projects/${unwrappedParams.pid}/simulations`)
    } catch (error) {
      console.error('Error creating simulation:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create simulation',
        variant: 'destructive',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Progress indicator based on filled fields
  const formProgress = () => {
    const values = watch()
    const requiredFields = [
      values.simulationName,
      values.task,
      values.instruction,
      values.agents?.length > 0 && values.agents.every((a) => a.name && a.role && a.backstory),
    ]
    const filledFields = requiredFields.filter(Boolean).length
    return (filledFields / requiredFields.length) * 100
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/projects/${unwrappedParams.pid}`}>
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

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${formProgress()}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create New Simulation</h1>
            <p className="text-muted-foreground mt-2">
              Configure and launch a new AI agent simulation for {projectName}
            </p>
          </div>

          {/* File Upload Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="config-upload" className="text-base">
                    Import Configuration
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Upload a JSON configuration file to pre-fill the form
                  </p>
                </div>
                <Button variant="outline" size="sm" className="relative">
                  <input
                    id="config-upload"
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Config
                </Button>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General Settings</TabsTrigger>
                <TabsTrigger value="agents">Agents</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <SimulationFormSection
                  title="Basic Information"
                  description="Define the core parameters of your simulation"
                >
                  <SimulationFormField
                    label="Simulation Name"
                    required
                    error={errors.simulationName?.message}
                  >
                    <Input
                      {...register('simulationName')}
                      placeholder="e.g., Climate Policy Negotiation"
                      className={cn(errors.simulationName && 'border-destructive')}
                    />
                  </SimulationFormField>

                  <SimulationFormField
                    label="Task Description"
                    required
                    error={errors.task?.message}
                    description="What should the agents accomplish in this simulation?"
                  >
                    <Textarea
                      {...register('task')}
                      placeholder="e.g., Negotiate a comprehensive climate policy that balances economic growth with environmental protection"
                      rows={3}
                      className={cn(errors.task && 'border-destructive')}
                    />
                  </SimulationFormField>

                  <div className="grid grid-cols-2 gap-4">
                    <SimulationFormField
                      label="Maximum Steps"
                      error={errors.maxSteps?.message}
                      description="Maximum iterations before simulation ends"
                    >
                      <Controller
                        name="maxSteps"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className={cn(errors.maxSteps && 'border-destructive')}
                          />
                        )}
                      />
                    </SimulationFormField>

                    <SimulationFormField
                      label="Timeout (seconds)"
                      error={errors.timeout?.message}
                      description="Maximum runtime before timeout"
                    >
                      <Controller
                        name="timeout"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className={cn(errors.timeout && 'border-destructive')}
                          />
                        )}
                      />
                    </SimulationFormField>
                  </div>
                </SimulationFormSection>
                <SimulationFormSection
                  title="Orchestrator Configuration"
                  description="Define how the simulation should be managed and coordinated"
                >
                  <SimulationFormField
                    label="Orchestrator Instructions"
                    required
                    error={errors.instruction?.message}
                    description="Provide detailed instructions for how the orchestrator should manage the simulation"
                  >
                    <Textarea
                      {...register('instruction')}
                      placeholder="e.g., Facilitate a structured negotiation between agents, ensuring all perspectives are heard. Guide the discussion towards consensus while managing conflicts constructively."
                      rows={5}
                      className={cn(errors.instruction && 'border-destructive')}
                    />
                  </SimulationFormField>
                </SimulationFormSection>
              </TabsContent>

              <TabsContent value="agents" className="space-y-6">
                <SimulationFormSection
                  title="Agent Configuration"
                  description="Define the agents that will participate in the simulation"
                  icon={<Plus className="h-5 w-5" />}
                >
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <AgentFormCard
                        key={field.id}
                        index={index}
                        register={register}
                        errors={errors}
                        onRemove={() => remove(index)}
                        canRemove={fields.length > 1}
                      />
                    ))}

                    {fields.length < 10 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ name: '', role: '', backstory: '' })}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Agent
                      </Button>
                    )}
                  </div>
                </SimulationFormSection>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <SimulationFormSection
                  title="Metrics Configuration"
                  description="Configure how simulation performance will be measured"
                >
                  <SimulationFormField
                    label="Metrics Template ID"
                    error={errors.metricsTemplateId?.message}
                    description="Optional: Use a predefined metrics template (UUID format)"
                  >
                    <Input
                      {...register('metricsTemplateId')}
                      placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                    />
                  </SimulationFormField>
                </SimulationFormSection>

                <Card className="p-6 bg-muted/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Advanced Features Coming Soon</p>
                      <p className="text-sm text-muted-foreground">
                        Additional configuration options like custom LLM models, tools integration,
                        and scheduling will be available in future updates.
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/projects/${unwrappedParams.pid}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                {formProgress() === 100 && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Ready to create
                  </div>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Simulation'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewSimulation
