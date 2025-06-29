import Simulations from '@/components/Simulations'
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
import { Project, Simulation } from '@/schemas'

async function fetchProject(projectId: string): Promise<Project> {
  try {
    const response = await fetch(`http://localhost:8080/projects/${projectId}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch project:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`Failed to fetch project: ${response.status} ${response.statusText}`)
    }

    const text = await response.text()
    if (!text) {
      throw new Error('Empty response from server')
    }

    try {
      return JSON.parse(text)
    } catch (_e) {
      console.error('Failed to parse project response:', text)
      throw new Error('Invalid JSON response from server')
    }
  } catch (error) {
    console.error('Error in fetchProject:', error)
    throw error
  }
}

async function fetchSimulations(projectId: string): Promise<Simulation[]> {
  try {
    const response = await fetch(`http://localhost:8080/projects/${projectId}/simulations`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch simulations:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`Failed to fetch simulations: ${response.status} ${response.statusText}`)
    }

    const text = await response.text()
    if (!text) {
      throw new Error('Empty response from server')
    }

    try {
      const data = JSON.parse(text)
      return data.simulations || []
    } catch (_e) {
      console.error('Failed to parse simulations response:', text)
      throw new Error('Invalid JSON response from server')
    }
  } catch (error) {
    console.error('Error in fetchSimulations:', error)
    throw error
  }
}

type ProjectSimulationsParams = {
  params: Promise<{
    pid: string
  }>
}

export default async function ProjectSimulations({ params }: ProjectSimulationsParams) {
  const resolvedParams = await params

  // Ensure params.pid is available
  if (!resolvedParams?.pid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Project</h1>
        <p className="text-zinc-400">Project ID is required</p>
      </div>
    )
  }

  try {
    // Fetch data sequentially to avoid race conditions
    const project = await fetchProject(resolvedParams.pid)
    const simulations = await fetchSimulations(resolvedParams.pid)

    return (
      <div className="flex flex-col min-h-screen w-full">
        <div className="sticky top-0 z-10 w-full bg-background px-6 py-4 border-b border-zinc-800">
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
                <BreadcrumbPage>{project.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex-1">
          <Simulations project={project} simulations={simulations} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in ProjectSimulations:', error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Project</h1>
        <p className="text-zinc-400">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
      </div>
    )
  }
}
