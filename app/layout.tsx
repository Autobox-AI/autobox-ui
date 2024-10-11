"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedProject, setSelectedProject] = useState("Project 1"); // Default selected project

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
            {/* Remove the conditional rendering of Simulations here */}
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
