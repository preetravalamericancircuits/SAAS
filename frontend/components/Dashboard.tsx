import { useAuth } from '@/contexts/AuthContext';
import { Users, CheckSquare, Activity, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const overviewCards = [
    {
      title: 'Total Users',
      value: '1,247',
      icon: Users,
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Tasks',
      value: '89',
      icon: CheckSquare,
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      icon: Activity,
      change: '24h',
      changeType: 'neutral'
    },
    {
      title: 'Performance',
      value: '94%',
      icon: TrendingUp,
      change: '+2%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.username}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-blue-900 mt-2">{card.value}</p>
                  <p className={`text-sm mt-1 ${
                    card.changeType === 'positive' ? 'text-green-600' :
                    card.changeType === 'negative' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {card.change}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New user registered - 2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Task completed - 4 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System maintenance - 1 day ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-900">Create New Task</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-900">Manage Users</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}