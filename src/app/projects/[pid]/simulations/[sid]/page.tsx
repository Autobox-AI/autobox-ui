import SimulationDetails from '@/components/SimulationDetails'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Simulation } from '@/schemas'

async function fetchSimulation(projectId: string, simulationId: string): Promise<Simulation> {
  const response = await fetch(`http://localhost:8000/simulations/${simulationId}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    console.error('Failed to fetch simulation')
    throw new Error('Failed to fetch simulation')
  }

  return await response.json()
}

async function fetchProject(projectId: string) {
  const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch project')
  }

  return await response.json()
}

type SimulationDetailsParams = {
  params: {
    pid: string
    sid: string
  }
}

export default async function SimulationPage({ params }: SimulationDetailsParams) {
  const { pid: projectId, sid: simulationId } = params
  const [simulation, project] = await Promise.all([
    fetchSimulation(projectId, simulationId),
    fetchProject(projectId),
  ])

  return (
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
              <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projects/${projectId}/simulations`}>
                {project.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{simulation.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-6">
        <SimulationDetails
          simulation={simulation}
          projectId={projectId}
          projectName={project.name}
        />
      </div>
    </div>
  )
}
