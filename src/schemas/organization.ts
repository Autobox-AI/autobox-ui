
import { z } from 'zod';
import { ProjectSchema } from './project';

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  projects: z.array(ProjectSchema).nullish(),
});

export type Organization = z.infer<typeof OrganizationSchema>