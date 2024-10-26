

import { z } from 'zod';
import { IsoDateStringSchema } from './common/date';
import { UuidSchema } from './common/uuid';

export const SIMULATION_STATUSES = {
    IN_PROGRESS: "in progress",
    COMPLETED: "completed",
    FAILED: "failed",
    ABORTED: "aborted",
  } as const

export const SimulationStatus = z.enum([SIMULATION_STATUSES.IN_PROGRESS, SIMULATION_STATUSES.COMPLETED, SIMULATION_STATUSES.FAILED, SIMULATION_STATUSES.ABORTED]);

export const AgentSchema = z.object({
    id: z.number(),
    name: z.string(),
});

export const SimulationSchema = z.object({
  id: UuidSchema,
  name: z.string(),
  status: SimulationStatus,
  started_at: IsoDateStringSchema,
  finished_at: IsoDateStringSchema.nullable(),
  aborted_at: IsoDateStringSchema.nullable(),
  summary: z.string().nullable(),
  progress: z.number(),
  agents: z.array(AgentSchema),
  orchestrator: AgentSchema,
  evaluator: AgentSchema,
  internal_dashboard_url: z.string().nullable(),
  public_dashboard_url: z.string().nullable(),
});

export type Agent = z.infer<typeof AgentSchema>;
export type Simulation = z.infer<typeof SimulationSchema>;