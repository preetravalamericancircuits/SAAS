import { useState } from 'react';
import { ChartBarIcon, UsersIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [selectedUrl, setSelectedUrl] = useState('https://www.google.com');
  
  const urls = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'CNN', url: 'https://www.cnn.com' },
    { name: 'GitHub', url: 'https://www.github.com' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' }
  ];

  const stats = [
    { name: 'Total Simulations', value: '1,234', icon: ChartBarIcon, color: 'bg-primary' },
    { name: 'Active Users', value: '89', icon: UsersIcon, color: 'bg-secondary' },
    { name: 'Success Rate', value: '94.2%', icon: CheckCircleIcon, color: 'bg-green-500' },
    { name: 'Alerts Detected', value: '12', icon: ExclamationTriangleIcon, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-background rounded-lg shadow p-6 border hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* External Website Preview */}
      <div className="bg-background rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Website Preview</h2>
          <select
            value={selectedUrl}
            onChange={(e) => setSelectedUrl(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {urls.map((url) => (
              <option key={url.url} value={url.url}>
                {url.name}
              </option>
            ))}
          </select>
        </div>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <iframe
            src={selectedUrl}
            className="w-full h-96"
            title="Website Preview"
          />
        </div>
      </div>
    </div>
  );
} 