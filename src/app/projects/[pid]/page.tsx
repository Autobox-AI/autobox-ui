import { redirect } from 'next/navigation'
import { use } from 'react'

type ProjectDetailsParams = {
  params: Promise<{
    pid: string
  }>
}

const ProjectDetails = ({ params }: ProjectDetailsParams) => {
  const { pid } = use(params)
  redirect(`/projects/${pid}/simulations`)
}

export default ProjectDetails
