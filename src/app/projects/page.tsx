'use client'

import Projects from '@/components/Projects'
import { Project } from '@/schemas'

interface ApiResponse {
  projects: Project[]
}

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
  if (!projects.length) return <div>No projects found.</div>
  return <Projects projects={projects} />
}
