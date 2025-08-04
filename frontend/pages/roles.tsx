import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function RolesPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const mockRoles = [
    { id: 1, name: 'SuperUser', description: 'Full system access', users: 3, permissions: 24 },
    { id: 2, name: 'Admin', description: 'Administrative access', users: 1, permissions: 18 },
    { id: 3, name: 'Manager', description: 'Manager access', users: 1, permissions: 12 },
    { id: 4, name: 'User', description: 'Standard user access', users: 4, permissions: 6 },
    { id: 5, name: 'ITRA', description: 'Internal Technical Review Authority', users: 1, permissions: 8 },
    { id: 6, name: 'Operator', description: 'System operator access', users: 1, permissions: 10 }
  ];

  const mockPermissions = [
    'user:read', 'user:create', 'user:update', 'user:delete',
    'role:read', 'role:create', 'role:update', 'role:delete',
    'system:admin', 'system:read', 'secure_files:read', 'audit:read'
  ];

  return (
    <ProtectedRoute allowedRoles={['SuperUser', 'Admin']}>
      <Layout>
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
              <p className="mt-2 text-gray-600">Manage user roles and their permissions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Roles Section */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">System Roles</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {mockRoles.map((role) => (
                      <div key={role.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{role.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                            <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                              <span>{role.users} users</span>
                              <span>{role.permissions} permissions</span>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Available Permissions</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-2">
                    {mockPermissions.map((permission) => (
                      <div key={permission} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                        <span className="text-sm font-mono text-gray-700">{permission}</span>
                        <span className="text-xs text-gray-500">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}