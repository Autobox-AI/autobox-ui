const SimulationDetails = () => {
  // Mock data for simulation details
  const simulation = {
    name: "Simulation 1",
    startedAt: "2023-10-01",
    finishedAt: "2023-10-02",
    results: "Simulation was successful and all agents completed the task.",
  };

  return (
    <div className="text-white">
      <h1 className="text-2xl mb-4">{simulation.name}</h1>
      <p>Started at: {simulation.startedAt}</p>
      <p>Finished at: {simulation.finishedAt}</p>
      <h2 className="text-xl mt-4">Results</h2>
      <p>{simulation.results}</p>
    </div>
  );
};

export default SimulationDetails;
