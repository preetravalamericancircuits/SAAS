export default function Users() {
  const handleButtonClick = (action: string) => {
    console.log(`User Management action: ${action}`);
    alert(`${action} clicked!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User Management</h1>
        <p className="text-gray-600 mb-6">This is the User Management page</p>
        
        <div className="flex space-x-4">
          <button
            onClick={() => handleButtonClick('Add User')}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Add User
          </button>
          <button
            onClick={() => handleButtonClick('Edit Permissions')}
            className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-500"
          >
            Edit Permissions
          </button>
          <button
            onClick={() => handleButtonClick('View Activity')}
            className="border border-primary text-primary px-4 py-2 rounded-md hover:bg-primary hover:text-white"
          >
            View Activity
          </button>
        </div>
      </div>
    </div>
  );
}