// components/Sidebar.tsx

import { useRouter } from "next/navigation"; // Import the useRouter hook

const Sidebar = ({ selectedProject, onSelectProject }) => {
  const router = useRouter(); // Initialize router for navigation
  const projects = [
    { id: "1", name: "Project 1" },
    { id: "2", name: "Project 2" },
    { id: "3", name: "Project 3" },
  ];

  const handleSelectProject = (project) => {
    onSelectProject(project.id); // Update selected project state
    router.push(`/projects/${project.id}`); // Navigate to project simulations page
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-full p-4 flex flex-col">
      <div className="mb-8">
        <select className="w-full bg-gray-800 text-white p-2 rounded">
          <option>Org 1</option>
          <option>Org 2</option>
          <option>Org 3</option>
        </select>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Projects</h2>
        <ul className="space-y-4">
          {projects.map((project, index) => (
            <li
              key={index}
              onClick={() => handleSelectProject(project)} // Call the handler for navigation
              className={`p-2 cursor-pointer rounded ${
                selectedProject === project.name
                  ? "bg-blue-600 font-bold"
                  : "hover:bg-gray-700"
              }`}
            >
              {project.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
