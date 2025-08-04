import { useState } from 'react';
import useSWR from 'swr';
import { Toaster } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserTable from '@/components/UserTable';
import AddUserModal from '@/components/AddUserModal';
import { Plus, Filter } from 'lucide-react';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

export default function UsersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  
  const { data: users, error, mutate, isLoading } = useSWR('/api/users', fetcher);

  const filteredUsers = users?.filter((user: any) => 
    roleFilter === 'all' || user.role === roleFilter
  ) || [];

  const roles = ['all', 'SuperUser', 'Admin', 'User', 'Manager', 'ITRA', 'Operator'];

  return (
    <ProtectedRoute allowedRoles={['SuperUser', 'Admin']}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage system users and their roles</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === 'all' ? 'All Roles' : role}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500">
                {filteredUsers.length} users
              </span>
            </div>
          </div>

          <UserTable users={filteredUsers} onUpdate={mutate} loading={isLoading} />
        </div>

        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            mutate();
            setIsAddModalOpen(false);
          }}
        />
        <Toaster position="top-right" />
      </div>
    </ProtectedRoute>
  );
}