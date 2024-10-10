// app/layout.tsx
"use client"; // Add this line at the top

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Simulations from "../components/Simulations";
import "../styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedProject, setSelectedProject] = useState("Project A"); // Default selected project

  const handleSelectProject = (project: string) => {
    setSelectedProject(project);
  };

  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <div className="flex h-screen">
          <Sidebar
            selectedProject={selectedProject}
            onSelectProject={handleSelectProject}
          />
          <div className="flex-1 p-8 bg-gray-900">
            <Simulations selectedProject={selectedProject} />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
