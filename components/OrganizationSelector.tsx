const OrganizationSelector = () => {
  const organizations = ["Org 1", "Org 2", "Org 3"]; // Mock organizations
  return (
    <div className="mb-4">
      <select className="bg-gray-800 text-white p-2 rounded">
        {organizations.map((org, index) => (
          <option key={index} value={org}>
            {org}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OrganizationSelector;
