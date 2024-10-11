"use client";

import { useRouter } from "next/navigation"; // For navigation

const ProjectsPage = () => {
  const router = useRouter();
  const projects = [
    { id: "1", name: "Project 1" },
    { id: "2", name: "Project 2" },
    { id: "3", name: "Project 3" },
  ];

  // Navigate to a specific project when clicked
  const goToProject = (projectId) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>

      <div className="grid grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-4 bg-gray-800 rounded cursor-pointer"
            onClick={() => goToProject(project.id)} // Navigate on click
          >
            <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
