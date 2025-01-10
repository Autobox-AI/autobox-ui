
import { z } from 'zod';
import { UuidSchema } from './common/uuid';
import { SimulationStatusSchema } from './simulation';


export const PROJECT_STATUSES = {
    ACTIVE: "active",
    ARCHIVED: "archived",
  } as const


export const ProjectStatusSchema = z.enum([PROJECT_STATUSES.ACTIVE, PROJECT_STATUSES.ARCHIVED]);

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>

export const ProjectSimulationSchema = z.object({
  id: UuidSchema,
  name: z.string(),
  status: SimulationStatusSchema,
  progress: z.number(),
  started_at: z.string(),
  finished_at: z.string().nullable(),
  aborted_at: z.string().nullable(),
});

export type ProjectSimulation = z.infer<typeof ProjectSimulationSchema>;

export const ConfidenceLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH'])

export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  simulations: z.array(ProjectSimulationSchema).default([]),
  confidence_level: ConfidenceLevelSchema
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