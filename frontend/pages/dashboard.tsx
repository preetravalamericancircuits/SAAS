import { useState } from 'react';
import { ChartBarIcon, UsersIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ModernCard, ModernStatsCard, ModernPageHeader } from '@/components/ui/modern-components';

export default function Dashboard() {
  const [selectedUrl, setSelectedUrl] = useState('https://www.google.com');
  
  const urls = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'CNN', url: 'https://www.cnn.com' },
    { name: 'GitHub', url: 'https://www.github.com' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' }
  ];

  const stats = [
    { 
      name: 'Total Simulations', 
      value: '1,234', 
      icon: ChartBarIcon, 
      color: 'bg-blue-600',
      trend: { value: '+12%', isPositive: true }
    },
    { 
      name: 'Active Users', 
      value: '89', 
      icon: UsersIcon, 
      color: 'bg-blue-500',
      trend: { value: '+5%', isPositive: true }
    },
    { 
      name: 'Success Rate', 
      value: '94.2%', 
      icon: CheckCircleIcon, 
      color: 'bg-green-500',
      trend: { value: '+2.1%', isPositive: true }
    },
    { 
      name: 'Alerts Detected', 
      value: '12', 
      icon: ExclamationTriangleIcon, 
      color: 'bg-red-500',
      trend: { value: '-3', isPositive: true }
    }
  ];

  return (
    <div className="space-y-8">
      <ModernPageHeader 
        title="Dashboard" 
        description="Welcome to your SAAS platform overview"
      />
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <ModernStatsCard
            key={stat.name}
            title={stat.name}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* External Website Preview */}
      <ModernCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Website Preview</h2>
          <select
            value={selectedUrl}
            onChange={(e) => setSelectedUrl(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            {urls.map((url) => (
              <option key={url.url} value={url.url}>
                {url.name}
              </option>
            ))}
          </select>
        </div>
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner">
          <iframe
            src={selectedUrl}
            className="w-full h-96"
            title="Website Preview"
          />
        </div>
      </ModernCard>
    </div>
  );
} 