

import { z } from 'zod';
import { IsoDateStringSchema } from './common/date';
import { UuidSchema } from './common/uuid';

export const SIMULATION_STATUSES = {
    IN_PROGRESS: "in progress",
    COMPLETED: "completed",
    FAILED: "failed",
    ABORTED: "aborted",
    TIMEOUT: "timeout",
  } as const


export const SimulationStatusSchema = z.enum([SIMULATION_STATUSES.IN_PROGRESS, SIMULATION_STATUSES.COMPLETED, SIMULATION_STATUSES.FAILED, SIMULATION_STATUSES.ABORTED, SIMULATION_STATUSES.TIMEOUT]);

export type SimulationStatus = z.infer<typeof SimulationStatusSchema>

export const AgentSchema = z.object({
    id: z.number(),
    name: z.string(),
});

export const SimulationSchema = z.object({
  id: UuidSchema,
  name: z.string(),
  status: SimulationStatusSchema,
  started_at: IsoDateStringSchema,
  finished_at: IsoDateStringSchema.nullable(),
  aborted_at: IsoDateStringSchema.nullable(),
  summary: z.string().nullish(),
  progress: z.number(),
  agents: z.array(AgentSchema).nullish(),
  orchestrator: AgentSchema.nullish(),
  evaluator: AgentSchema.nullish(),
  internal_dashboard_url: z.string().nullish(),
  public_dashboard_url: z.string().nullish(),
  description: z.string().nullish(),
});

export type Agent = z.infer<typeof AgentSchema>;
export type Simulation = z.infer<typeof SimulationSchema>;