"use client";

import { useRouter } from "next/navigation";

const ProjectDetails = ({ params }) => {
  const { pid: projectId } = params; // Extract projectId
  const router = useRouter();

  // Mocked project information
  const projectDetails = {
    "1": {
      id: "1",
      name: "Project 1",
      description: "Description of Project 1",
    },
    "2": {
      id: "2",
      name: "Project 2",
      description: "Description of Project 2",
    },
    "3": {
      id: "3",
      name: "Project 3",
      description: "Description of Project 3",
    },
  };

  const project = projectDetails[projectId];

  if (!project) {
    return <p className="text-white">Project not found</p>;
  }

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
      <p>{project.description}</p>

      {/* Button to navigate to simulations */}
      <button
        onClick={() => router.push(`/projects/${projectId}/simulations`)}
        className="bg-blue-500 text-white p-2 mt-4 rounded"
      >
        View Simulations
      </button>
    </div>
  );
};

export default ProjectDetails;
