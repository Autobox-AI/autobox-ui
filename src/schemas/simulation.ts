

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

export const Agent = z.object({
    id: z.number(),
    name: z.string(),
});

export const SimulationSchema = z.object({
  id: UuidSchema,
  name: z.string(),
  status: SimulationStatus,
  started_at: IsoDateStringSchema,
  finished_at: IsoDateStringSchema.nullable(),
  summary: z.string().nullable(),
  progress: z.number(),
  agents: z.array(Agent),
  orchestrator: Agent,
  evaluator: Agent,
  internal_dashboard_url: z.string().nullable(),
  public_dashboard_url: z.string().nullable(),
});

export type Simulation = z.infer<typeof SimulationSchema>;