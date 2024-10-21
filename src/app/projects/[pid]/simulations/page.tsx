'use client'

import Simulations from '@/components/Simulations' // Import Simulations component

const ProjectSimulations = ({ params }) => {
  const { pid: projectId } = params // Extract projectId

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Simulations for Project {projectId}</h1>

      {/* Render the Simulations component */}
      <Simulations selectedProject={projectId} />
    </div>
  )
}

export default ProjectSimulations
