import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AuditPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const mockAuditLogs = [
    { id: 1, timestamp: '2025-08-04 13:45:23', user: 'preet', action: 'User Login', resource: 'Authentication', status: 'Success', ip: '192.168.1.100' },
    { id: 2, timestamp: '2025-08-04 13:44:15', user: 'admin', action: 'User Created', resource: 'User: kanav', status: 'Success', ip: '192.168.1.101' },
    { id: 3, timestamp: '2025-08-04 13:43:02', user: 'preet', action: 'Role Updated', resource: 'Role: SuperUser', status: 'Success', ip: '192.168.1.100' },
    { id: 4, timestamp: '2025-08-04 13:42:18', user: 'operator1', action: 'File Access', resource: 'secure-files.pdf', status: 'Denied', ip: '192.168.1.102' },
    { id: 5, timestamp: '2025-08-04 13:41:45', user: 'itra1', action: 'Secure File Download', resource: 'confidential-report.pdf', status: 'Success', ip: '192.168.1.103' },
    { id: 6, timestamp: '2025-08-04 13:40:33', user: 'user1', action: 'Password Change', resource: 'User Profile', status: 'Success', ip: '192.168.1.104' },
    { id: 7, timestamp: '2025-08-04 13:39:21', user: 'khash', action: 'User Login', resource: 'Authentication', status: 'Failed', ip: '192.168.1.105' },
    { id: 8, timestamp: '2025-08-04 13:38:09', user: 'cathy', action: 'Dashboard Access', resource: 'Dashboard', status: 'Success', ip: '192.168.1.106' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'text-green-600 bg-green-100';
      case 'Failed': return 'text-red-600 bg-red-100';
      case 'Denied': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['SuperUser', 'Admin', 'ITRA']}>
      <Layout>
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
              <p className="mt-2 text-gray-600">Monitor system activities and security events</p>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">System Activity Log</h2>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Activities</option>
                    <option value="success">Success Only</option>
                    <option value="failed">Failed Only</option>
                    <option value="security">Security Events</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.timestamp}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.resource}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}