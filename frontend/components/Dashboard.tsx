import { useAuth } from '@/contexts/AuthContext';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  ChartBarIcon, 
  CogIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user } = useAuth();

  const getRoleBasedContent = () => {
    switch (user?.role) {
      case 'SuperUser':
        return {
          title: 'System Administration Dashboard',
          description: 'Full system control and monitoring',
          stats: [
            { name: 'Total Users', value: '11', icon: UserIcon, color: 'bg-blue-500' },
            { name: 'Active Sessions', value: '5', icon: ShieldCheckIcon, color: 'bg-green-500' },
            { name: 'System Health', value: '100%', icon: CheckCircleIcon, color: 'bg-green-500' },
            { name: 'Docker Services', value: '13', icon: CogIcon, color: 'bg-purple-500' }
          ],
          features: [
            'User Management & Role Assignment',
            'System Configuration & Settings',
            'Audit Logs & Security Monitoring',
            'Database Administration (Adminer)',
            'Container Management (Portainer)',
            'Performance Analytics (Grafana)'
          ]
        };
      
      case 'Admin':
        return {
          title: 'Administrative Dashboard',
          description: 'User management and system oversight',
          stats: [
            { name: 'Team Members', value: '45', icon: UserIcon, color: 'bg-blue-500' },
            { name: 'Active Projects', value: '12', icon: DocumentTextIcon, color: 'bg-green-500' },
            { name: 'Pending Approvals', value: '8', icon: ClockIcon, color: 'bg-yellow-500' },
            { name: 'System Alerts', value: '2', icon: ExclamationTriangleIcon, color: 'bg-red-500' }
          ],
          features: [
            'User Management',
            'Project Oversight',
            'Team Performance Reports',
            'Resource Allocation',
            'Compliance Monitoring',
            'System Maintenance'
          ]
        };
      
      case 'Manager':
        return {
          title: 'Management Dashboard',
          description: 'Team leadership and project management',
          stats: [
            { name: 'Team Size', value: '8', icon: UserIcon, color: 'bg-blue-500' },
            { name: 'Active Tasks', value: '24', icon: DocumentTextIcon, color: 'bg-green-500' },
            { name: 'Completed Today', value: '6', icon: CheckCircleIcon, color: 'bg-green-500' },
            { name: 'Overdue Items', value: '1', icon: ExclamationTriangleIcon, color: 'bg-red-500' }
          ],
          features: [
            'Team Management',
            'Project Tracking',
            'Performance Reviews',
            'Resource Planning',
            'Client Communication',
            'Quality Assurance'
          ]
        };
      
      case 'User':
        return {
          title: 'User Dashboard',
          description: 'Personal workspace and task management',
          stats: [
            { name: 'My Tasks', value: '12', icon: DocumentTextIcon, color: 'bg-blue-500' },
            { name: 'Completed Today', value: '3', icon: CheckCircleIcon, color: 'bg-green-500' },
            { name: 'Pending Reviews', value: '2', icon: ClockIcon, color: 'bg-yellow-500' },
            { name: 'Team Projects', value: '4', icon: UserIcon, color: 'bg-purple-500' }
          ],
          features: [
            'Task Management',
            'Project Collaboration',
            'Personal Calendar',
            'Document Access',
            'Team Communication',
            'Performance Tracking'
          ]
        };
      
      default:
        return {
          title: 'Welcome Dashboard',
          description: 'Get started with your workspace',
          stats: [
            { name: 'Getting Started', value: '5', icon: CheckCircleIcon, color: 'bg-blue-500' },
            { name: 'Available Features', value: '10+', icon: CogIcon, color: 'bg-green-500' },
            { name: 'Support Tickets', value: '0', icon: ShieldCheckIcon, color: 'bg-green-500' },
            { name: 'System Status', value: 'Online', icon: CheckCircleIcon, color: 'bg-green-500' }
          ],
          features: [
            'Profile Setup',
            'Feature Exploration',
            'Documentation Access',
            'Support Resources',
            'Training Materials',
            'System Tour'
          ]
        };
    }
  };

  const content = getRoleBasedContent();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
        <p className="mt-2 text-sm text-gray-700">{content.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {content.stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role-specific content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {content.features.slice(0, 3).map((feature, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <CogIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">{feature}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Task completed</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Document uploaded</p>
                  <p className="text-sm text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Team member joined</p>
                  <p className="text-sm text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific features */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Available Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.features.map((feature, index) => (
              <div key={index} className="flex items-center p-3 border border-gray-200 rounded-md">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-900">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Welcome message for new users */}
      {user?.role === 'User' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Welcome to ACI Dashboard!</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  You have access to basic user features. Contact your administrator if you need additional permissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 