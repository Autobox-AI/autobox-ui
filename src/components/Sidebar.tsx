'use client' // Since you're using client-side features

import { Project } from '@/schemas'
import { Organization } from '@/schemas/organization'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ApiResponse {
  organizations: Organization[]
}

export default function Sidebar({ organizations }: { organizations: Organization[] }) {
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const router = useRouter()
  const pathname = usePathname()

  const projectIdFromRoute = pathname.split('/')[2]

  useEffect(() => {
    console.log('hook for projectIdFromRoute')
    if (!projectIdFromRoute) {
      setSelectedProject(null)
    }
  }, [projectIdFromRoute])

  useEffect(() => {
    console.log('hook for organizations')
    if (organizations.length > 0) {
      setSelectedOrganization(organizations[0])
    }
  }, [organizations])

  const handleSelectOrganization = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOrg = organizations.find((org) => org.id === event.target.value)
    setSelectedOrganization(selectedOrg || null) // Set the selected organization
  }

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project.id)
    router.push(`/projects/${project.id}/simulations`)
  }

  const goHome = () => {
    router.push('/')
  }

  if (!selectedOrganization) return <div>Loading...</div>

  const projects = selectedOrganization.projects || []

  return (
    <div className="w-64 bg-background text-foreground h-screen p-4 flex flex-col justify-between border-r border-muted shadow-md border-gray-700">
      {/* Organization Selector */}
      <div className="mb-8 flex items-center gap-2">
        <button onClick={goHome} className="hover:bg-muted p-2 rounded-lg">
          <Image
            src="/assets/white-box.png"
            alt="Home"
            width={24}
            height={24}
            className="rounded-lg"
          />
        </button>

        <select
          className="w-full bg-card text-foreground p-2 rounded border border-border focus:border-blue-500 focus:outline-none text-sm"
          value={selectedOrganization.id}
          onChange={handleSelectOrganization}
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {/* Projects List */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4 text-foreground text-sm">Projects</h2>
        <ul className="space-y-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <li
                key={project.id}
                onClick={() => handleSelectProject(project)}
                className={`p-2 cursor-pointer rounded text-sm ${
                  selectedProject === project.id
                    ? 'bg-primary-light text-primary-foreground font-bold'
                    : 'hover:bg-muted'
                }`}
              >
                {project.name}
              </li>
            ))
          ) : (
            <p className="text-sm">No projects available</p>
          )}
        </ul>
      </div>
    </div>
  )
}
