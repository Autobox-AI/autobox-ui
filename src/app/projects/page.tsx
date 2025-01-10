import Projects from '@/components/Projects'
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
import { Project } from '@/schemas'

async function fetchProjects(): Promise<Project[]> {
  const response = await fetch('http://localhost:8000/projects', {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch projects')
  }

  const { projects } = await response.json()
  return projects
}

export default async function ProjectsPage() {
  const projects = await fetchProjects()

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
              <BreadcrumbPage>Projects</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1">
        {!projects.length ? <div>No projects found.</div> : <Projects projects={projects} />}
      </div>
    </div>
  )
}
