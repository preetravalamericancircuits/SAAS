export default function Analytics() {
  const handleButtonClick = (action: string) => {
    console.log(`Analytics action: ${action}`);
    alert(`${action} clicked!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>
        <p className="text-gray-600 mb-6">This is the Analytics page</p>
        
        <div className="flex space-x-4">
          <button
            onClick={() => handleButtonClick('Generate Report')}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Generate Report
          </button>
          <button
            onClick={() => handleButtonClick('Export Data')}
            className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-500"
          >
            Export Data
          </button>
          <button
            onClick={() => handleButtonClick('View Charts')}
            className="border border-primary text-primary px-4 py-2 rounded-md hover:bg-primary hover:text-white"
          >
            View Charts
          </button>
        </div>
      </div>
    </div>
  );
}