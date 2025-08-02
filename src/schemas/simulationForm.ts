import { z } from 'zod'

export const simulationFormSchema = z.object({
  // General Settings
  simulationName: z
    .string()
    .min(1, 'Simulation name is required')
    .max(100, 'Simulation name must be less than 100 characters'),

  maxSteps: z.number().min(1, 'Must be at least 1 step').max(1000, 'Cannot exceed 1000 steps'),

  timeout: z.number().min(30, 'Must be at least 30 seconds').max(3600, 'Cannot exceed 1 hour'),

  task: z
    .string()
    .min(1, 'Task description is required')
    .max(500, 'Task description must be less than 500 characters'),

  // Orchestrator
  instruction: z
    .string()
    .min(1, 'Orchestrator instructions are required')
    .max(1000, 'Instructions must be less than 1000 characters'),

  // Metrics (optional)
  metricsTemplateId: z.string().uuid('Must be a valid UUID').optional().or(z.literal('')),

  // Agents
  agents: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, 'Agent name is required')
          .max(50, 'Agent name must be less than 50 characters'),

        role: z
          .string()
          .min(1, 'Agent role is required')
          .max(100, 'Agent role must be less than 100 characters'),

        backstory: z
          .string()
          .min(1, 'Agent backstory is required')
          .max(500, 'Agent backstory must be less than 500 characters'),
      })
    )
    .min(1, 'At least one agent is required')
    .max(10, 'Maximum 10 agents allowed'),
})

export type SimulationFormData = z.infer<typeof simulationFormSchema>

// API payload transformation
export const transformFormToApiPayload = (data: SimulationFormData, projectId: string) => ({
  name: data.simulationName,
  max_steps: data.maxSteps,
  timeout_seconds: data.timeout,
  description: data.instruction,
  task: data.task,
  metrics: data.metricsTemplateId
    ? {
        template_id: data.metricsTemplateId,
      }
    : undefined,
  evaluator: {
    name: 'EVALUATOR',
    mailbox: { max_size: 400 },
    llm: { model: 'gpt-4o-2024-08-06' },
  },
  reporter: {
    name: 'REPORTER',
    mailbox: { max_size: 400 },
    llm: { model: 'gpt-4o-2024-08-06' },
  },
  planner: {
    name: 'PLANNER',
    mailbox: { max_size: 400 },
    llm: { model: 'gpt-4o-2024-08-06' },
  },
  orchestrator: {
    name: 'ORCHESTRATOR',
    mailbox: { max_size: 400 },
    llm: { model: 'gpt-4o-2024-08-06' },
  },
  agents: data.agents.map((agent) => ({
    name: agent.name,
    role: agent.role,
    backstory: agent.backstory,
    llm: { model: 'gpt-4o-2024-08-06' },
    mailbox: { max_size: 100 },
  })),
})
