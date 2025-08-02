import AllSimulations from '@/components/AllSimulations'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Simulation } from '@/schemas'

async function fetchAllSimulations(organizationId: string): Promise<{
  simulations: (Simulation & { project_name: string; project_id: string })[]
}> {
  try {
    const apiUrl = process.env.API_URL
    const response = await fetch(`${apiUrl}/organizations/${organizationId}/simulations`, {
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
      return JSON.parse(text)
    } catch (_e) {
      console.error('Failed to parse simulations response:', text)
      throw new Error('Invalid JSON response from server')
    }
  } catch (error) {
    console.error('Error in fetchAllSimulations:', error)
    throw error
  }
}

export default async function SimulationsPage() {
  const organizationId = process.env.ORG_ID

  if (!organizationId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Configuration Error</h1>
        <p className="text-zinc-400">Organization ID is not configured</p>
      </div>
    )
  }

  try {
    const data = await fetchAllSimulations(organizationId)
    const simulations = data.simulations || []

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
                <BreadcrumbPage>All Simulations</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex-1">
          <AllSimulations simulations={simulations} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in SimulationsPage:', error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Simulations</h1>
        <p className="text-zinc-400">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
      </div>
    )
  }
}
