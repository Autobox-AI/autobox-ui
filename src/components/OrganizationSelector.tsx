const OrganizationSelector = () => {
  const organizations = ['Acme', 'Mars', 'Darma', 'Marvel'] // Mock organizations
  return (
    <div className="mb-4">
      <select className="bg-gray-800 text-foreground p-2 rounded">
        {organizations.map((org, index) => (
          <option key={index} value={org}>
            {org}
          </option>
        ))}
      </select>
    </div>
  )
}

export default OrganizationSelector
