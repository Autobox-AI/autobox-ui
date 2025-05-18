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
import { headers } from 'next/headers'
import { Suspense } from 'react'

async function fetchProjects(searchParams: { [key: string]: string | string[] | undefined }): Promise<Project[]> {
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'

  // Build query parameters
  const queryParams = new URLSearchParams()
  if (searchParams.search) {
    queryParams.append('search', searchParams.search as string)
  }
  if (searchParams.status && searchParams.status !== 'all') {
    queryParams.append('status', searchParams.status as string)
  }

  try {
    const response = await fetch(`${protocol}://${host}/api/projects?${queryParams.toString()}`, {
      next: {
        revalidate: 30, // Reduce revalidation time to 30 seconds
        tags: ['projects'], // Add cache tag for manual revalidation
      },
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch projects')
    }

    const { projects } = await response.json()
    return projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
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
        <Suspense fallback={<div>Loading...</div>}>
          <ProjectsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}

async function ProjectsContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const projects = await fetchProjects(searchParams)
  return !projects.length ? <div>No projects found.</div> : <Projects projects={projects} />
}
