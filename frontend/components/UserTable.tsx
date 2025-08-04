import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { TableSkeleton } from './Skeleton';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

interface UserTableProps {
  users: User[];
  onUpdate: () => void;
  loading?: boolean;
}

export default function UserTable({ users, onUpdate, loading = false }: UserTableProps) {
  const [sortField, setSortField] = useState<keyof User>('username');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SuperUser': return 'bg-purple-100 text-purple-800';
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Manager': return 'bg-blue-100 text-blue-800';
      case 'ITRA': return 'bg-green-100 text-green-800';
      case 'Operator': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success('User deleted successfully');
        onUpdate();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Mobile Card Layout */}
      <div className="block md:hidden space-y-4 p-4">
        {sortedUsers.map((user, index) => (
          <motion.div
            key={user.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-gray-900">{user.username}</div>
              <Menu as="div" className="relative">
                <Menu.Button className="p-2 rounded-full hover:bg-gray-100">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <Menu.Item>
                    {({ active }) => (
                      <button className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}>
                        <Edit className="w-4 h-4 mr-3" />Edit User
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-red-600`}
                      >
                        <Trash2 className="w-4 h-4 mr-3" />Delete User
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-500">Email:</span> {user.email}</div>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">Role:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div><span className="text-gray-500">Created:</span> {new Date(user.created_at).toLocaleDateString()}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              onClick={() => handleSort('username')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              Username
              {sortField === 'username' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              onClick={() => handleSort('email')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              Email
              {sortField === 'email' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              onClick={() => handleSort('role')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              Role
              {sortField === 'role' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedUsers.map((user, index) => (
            <motion.tr 
              key={user.id} 
              className="hover:bg-gray-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.username}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button className="p-2 rounded-full hover:bg-gray-100">
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                          >
                            <Edit className="w-4 h-4 mr-3" />
                            Edit User
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-red-600`}
                          >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Delete User
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      
      {sortedUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
}