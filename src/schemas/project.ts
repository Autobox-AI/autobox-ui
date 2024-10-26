
import { z } from 'zod';
import { UuidSchema } from './common/uuid';
import { SimulationStatus } from './simulation';


export const ProjectSimulationSchema = z.object({
  id: UuidSchema,
  name: z.string(),
  status: SimulationStatus,
  progress: z.number(),
  started_at: z.string(),
  finished_at: z.string().nullable(),
  aborted_at: z.string().nullable(),
});

export type ProjectSimulation = z.infer<typeof ProjectSimulationSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  simulations: z.array(ProjectSimulationSchema).default([]),
});

export const ProjectContextSchema = z.object({
    projects: z.array(ProjectSchema),
    projectsById: z.record(ProjectSchema),
    loading: z.boolean(),
    error: z.string().nullable(),
})

export type Project = z.infer<typeof ProjectSchema>

export type ProjectContext = z.infer<typeof ProjectContextSchema>

export interface ProjectContextType extends ProjectContext {
  setProjectsById: React.Dispatch<React.SetStateAction<Record<string, Project>>>
}