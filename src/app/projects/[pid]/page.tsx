'use client'

import { redirect } from 'next/navigation'

type ProjectDetailsParams = {
  params: {
    pid: string
  }
}

const ProjectDetails = ({ params }: ProjectDetailsParams) => {
  redirect(`/projects/${params.pid}/simulations`)
}

export default ProjectDetails
