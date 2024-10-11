"use client";

import { useRouter } from "next/navigation"; // For navigation
import { useEffect } from "react"; // Import useEffect from React

const ProjectsPage = () => {
  const router = useRouter();
  const projects = [
    { id: "1", name: "Project A" },
    { id: "2", name: "Project B" },
    { id: "3", name: "Project C" },
  ];

  // Automatically navigate to the first project on page load
  useEffect(() => {
    if (projects.length > 0) {
      router.push(`/projects/${projects[0].id}/simulations`);
    }
  }, [router, projects]);

  return (
    <div className="text-white flex">
      {/* Left panel with project list */}
      <div className="w-64 bg-gray-900 p-4">
        <h1 className="text-2xl font-bold mb-4">Projects</h1>
        <ul>
          {projects.map((project) => (
            <li key={project.id} className="mb-4">
              {/* Navigate to the project simulations page */}
              <a
                href={`/projects/${project.id}/simulations`}
                className="text-blue-500 underline"
              >
                {project.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Placeholder for main content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">
          Select a project from the left panel
        </h1>
      </div>
    </div>
  );
};

export default ProjectsPage;
