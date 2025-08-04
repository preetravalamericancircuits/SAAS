import { UsersIcon, UserPlusIcon, ShieldCheckIcon, EyeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { ModernCard, ModernButton, ModernPageHeader, ModernStatsCard, ModernBadge } from '@/components/ui/modern-components';

export default function Users() {
  const handleButtonClick = (action: string) => {
    console.log(`User Management action: ${action}`);
    alert(`${action} clicked!`);
  };

  const userStats = [
    { name: 'Total Users', value: '89', icon: UsersIcon, color: 'bg-blue-600' },
    { name: 'Active Today', value: '67', icon: UserCircleIcon, color: 'bg-green-600' },
    { name: 'New This Week', value: '12', icon: UserPlusIcon, color: 'bg-yellow-600' },
    { name: 'Admin Users', value: '8', icon: ShieldCheckIcon, color: 'bg-purple-600' }
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', lastLogin: '1 day ago' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Manager', status: 'Inactive', lastLogin: '3 days ago' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'User', status: 'Active', lastLogin: '5 minutes ago' }
  ];

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'success' : 'error';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Manager': return 'warning';
      case 'User': return 'primary';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-8">
      <ModernPageHeader 
        title="User Management" 
        description="Manage users, roles, and permissions"
        action={
          <ModernButton onClick={() => handleButtonClick('Add User')}>
            Add User
          </ModernButton>
        }
      />
      
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userStats.map((stat) => (
          <ModernStatsCard
            key={stat.name}
            title={stat.name}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
      
      {/* User Management Actions */}
      <ModernCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management Tools</h2>
        <div className="flex flex-wrap gap-4">
          <ModernButton
            onClick={() => handleButtonClick('Add User')}
            variant="primary"
          >
            Add User
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('Edit Permissions')}
            variant="secondary"
          >
            Edit Permissions
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('View Activity')}
            variant="outline"
          >
            View Activity
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('Export Users')}
            variant="ghost"
          >
            Export Users
          </ModernButton>
        </div>
      </ModernCard>
      
      {/* Recent Users */}
      <ModernCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Users</h2>
        <div className="space-y-4">
          {recentUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <UserCircleIcon className="h-10 w-10 text-primary-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">Last login: {user.lastLogin}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ModernBadge variant={getRoleColor(user.role) as any}>
                  {user.role}
                </ModernBadge>
                <ModernBadge variant={getStatusColor(user.status) as any}>
                  {user.status}
                </ModernBadge>
                <ModernButton 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleButtonClick(`Edit ${user.name}`)}
                >
                  Edit
                </ModernButton>
              </div>
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  );
}