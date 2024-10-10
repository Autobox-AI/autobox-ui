"use client";

import { useRouter } from "next/navigation"; // For App Router navigation
import { useEffect, useState } from "react";

const SimulationLogs = ({ simulationId }) => {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  // Mock adding random logs every second
  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogs((prevLogs) => [
        ...prevLogs,
        `Log entry ${prevLogs.length + 1}: Running...`,
      ]);
    }, 1000);

    // Mock progress update every second
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress < 100 ? prevProgress + 10 : 100
      );
    }, 1000);

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, []);

  // Go back to the main simulations page
  const goBack = () => {
    router.push("/projects");
  };

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Simulation Logs</h1>

      {/* Progress Bar */}
      <div className="mb-4">
        <p>Progress: {progress}%</p>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
          <div
            className="bg-blue-500 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Logs Display */}
      <div className="bg-gray-900 p-4 rounded h-64 overflow-y-auto mb-4">
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>

      {/* Back Button */}
      <button onClick={goBack} className="bg-red-500 p-2 rounded">
        Back to Main Screen
      </button>
    </div>
  );
};

export default SimulationLogs;
