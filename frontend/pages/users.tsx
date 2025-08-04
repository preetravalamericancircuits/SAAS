import { useState } from 'react';
import { UsersIcon, UserPlusIcon, ShieldCheckIcon, EyeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { ModernCard, ModernButton, ModernPageHeader, ModernStatsCard, ModernBadge, ModernInput } from '@/components/ui/modern-components';

export default function Users() {
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'User' });
  
  const handleButtonClick = (action: string) => {
    switch(action) {
      case 'Add User':
        setShowAddUserForm(true);
        break;
      case 'Save User':
        if (newUser.name && newUser.email) {
          alert(`User ${newUser.name} added successfully!`);
          setNewUser({ name: '', email: '', role: 'User' });
          setShowAddUserForm(false);
        } else {
          alert('Please fill all fields');
        }
        break;
      case 'Cancel':
        setShowAddUserForm(false);
        setNewUser({ name: '', email: '', role: 'User' });
        break;
      case 'Export Users':
        const userData = recentUsers.map(u => `${u.name},${u.email},${u.role},${u.status}`).join('\n');
        const blob = new Blob([`Name,Email,Role,Status\n${userData}`], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        break;
      default:
        alert(`${action} executed!`);
    }
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
        description="Comprehensive user administration with role-based access control, permissions management, and activity monitoring"
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
      
      {/* Role Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">SuperUsers</h3>
          <p className="text-sm text-gray-600 mb-2">Full system access</p>
          <div className="text-2xl font-bold text-red-600">4</div>
          <p className="text-xs text-gray-500">preet, kanav, khash, tony</p>
        </ModernCard>
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Operators</h3>
          <p className="text-sm text-gray-600 mb-2">System operations</p>
          <div className="text-2xl font-bold text-yellow-600">2</div>
          <p className="text-xs text-gray-500">kris, abhishek</p>
        </ModernCard>
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Users</h3>
          <p className="text-sm text-gray-600 mb-2">Standard access</p>
          <div className="text-2xl font-bold text-blue-600">2</div>
          <p className="text-xs text-gray-500">pratiksha, cathy</p>
        </ModernCard>
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ITRA</h3>
          <p className="text-sm text-gray-600 mb-2">Technical review</p>
          <div className="text-2xl font-bold text-purple-600">1</div>
          <p className="text-xs text-gray-500">itra1</p>
        </ModernCard>
      </div>
      
      {/* User Management Tools */}
      <ModernCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management Tools</h2>
        <p className="text-sm text-gray-600 mb-6">Complete user administration toolkit with role assignment, permission management, and activity tracking</p>
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
                <UserCircleIcon className="h-10 w-10 text-blue-600" />
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
      
      {/* Add User Form Modal */}
      {showAddUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ModernCard className="p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
            <div className="space-y-4">
              <ModernInput
                label="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                placeholder="Enter full name"
              />
              <ModernInput
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="Enter email address"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="User">User</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                  <option value="SuperUser">SuperUser</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <ModernButton onClick={() => handleButtonClick('Save User')} className="flex-1">
                Save User
              </ModernButton>
              <ModernButton variant="outline" onClick={() => handleButtonClick('Cancel')} className="flex-1">
                Cancel
              </ModernButton>
            </div>
          </ModernCard>
        </div>
      )}
    </div>
  );
}