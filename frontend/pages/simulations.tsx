export default function Simulations() {
  const handleButtonClick = (action: string) => {
    console.log(`Simulations action: ${action}`);
    alert(`${action} clicked!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Simulations</h1>
        <p className="text-gray-600 mb-6">This is the Simulations page</p>
        
        <div className="flex space-x-4">
          <button
            onClick={() => handleButtonClick('Run New Simulation')}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Run New Simulation
          </button>
          <button
            onClick={() => handleButtonClick('View Details')}
            className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-500"
          >
            View Details
          </button>
          <button
            onClick={() => handleButtonClick('Download Report')}
            className="border border-primary text-primary px-4 py-2 rounded-md hover:bg-primary hover:text-white"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}