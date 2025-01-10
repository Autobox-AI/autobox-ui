export {
    ConfidenceLevelSchema,
    ProjectSchema,
    ProjectStatusSchema,
    type ConfidenceLevel,
    type Project,
    type ProjectContext,
    type ProjectContextType,
    type ProjectStatus
} from './project'
export { AgentSchema, SimulationSchema, SimulationStatusSchema, type Agent, type Simulation, type SimulationStatus } from './simulation'

// export interface Project {
//   id: string
//   name: string
//   description?: string
//   status?: string
//   created_at: string
//   updated_at?: string
//   simulations_count?: number
//   confidence_level?: 'LOW' | 'MEDIUM' | 'HIGH'
// }

