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
        description="Monitor your platform performance, user activity, and system health in real-time"
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

      {/* System Health & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">CPU Usage</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
                <span className="text-sm text-gray-900">45%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Memory Usage</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '72%'}}></div>
                </div>
                <span className="text-sm text-gray-900">72%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Disk Usage</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '38%'}}></div>
                </div>
                <span className="text-sm text-gray-900">38%</span>
              </div>
            </div>
          </div>
        </ModernCard>
        
        <ModernCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600">User 'preet' logged in</span>
              <span className="ml-auto text-gray-400">2 min ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-600">New simulation started</span>
              <span className="ml-auto text-gray-400">5 min ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Report generated</span>
              <span className="ml-auto text-gray-400">12 min ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Database backup completed</span>
              <span className="ml-auto text-gray-400">1 hour ago</span>
            </div>
          </div>
        </ModernCard>
      </div>
      
      {/* External Website Preview */}
      <ModernCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Website Preview</h2>
            <p className="text-sm text-gray-600 mt-1">Preview external websites and tools for comparison and analysis</p>
          </div>
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
        <div className="mt-4 flex gap-2">
          <button 
            onClick={() => window.open(selectedUrl, '_blank')}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Open in New Tab
          </button>
          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            Take Screenshot
          </button>
        </div>
      </ModernCard>
    </div>
  );
} 