export default function Settings() {
  const handleButtonClick = (action: string) => {
    console.log(`Settings action: ${action}`);
    alert(`${action} clicked!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
        <p className="text-gray-600 mb-6">This is the Settings page</p>
        
        <div className="flex space-x-4">
          <button
            onClick={() => handleButtonClick('Update Profile')}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Update Profile
          </button>
          <button
            onClick={() => handleButtonClick('Change Password')}
            className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-500"
          >
            Change Password
          </button>
          <button
            onClick={() => handleButtonClick('Manage Preferences')}
            className="border border-primary text-primary px-4 py-2 rounded-md hover:bg-primary hover:text-white"
          >
            Manage Preferences
          </button>
        </div>
      </div>
    </div>
  );
}