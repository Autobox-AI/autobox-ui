// components/Sidebar.tsx

const Sidebar = ({ selectedProject, onSelectProject }) => {
  const projects = ["Project A", "Project B", "Project C"];

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
              onClick={() => onSelectProject(project)}
              className={`p-2 cursor-pointer rounded ${
                selectedProject === project
                  ? "bg-blue-600 font-bold"
                  : "hover:bg-gray-700"
              }`}
            >
              {project}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
