import ProtectedRoute from '@/components/ProtectedRoute';
import { Settings as SettingsIcon, Shield, Database, Server } from 'lucide-react';

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['SuperUser']}>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-blue-900">System Settings</h1>
            <p className="text-gray-600 mt-2">Configure system-wide settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-blue-900">Security Settings</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Two-Factor Authentication</span>
                  <button className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Enabled
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Session Timeout</span>
                  <span className="text-sm text-gray-500">30 minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Password Policy</span>
                  <span className="text-sm text-gray-500">Strong</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Database className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-blue-900">Database Settings</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Backup Frequency</span>
                  <span className="text-sm text-gray-500">Daily</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Connection Pool</span>
                  <span className="text-sm text-gray-500">20 connections</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Query Timeout</span>
                  <span className="text-sm text-gray-500">30 seconds</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Server className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-blue-900">System Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Server Status</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Uptime</span>
                  <span className="text-sm text-gray-500">15 days, 4 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Version</span>
                  <span className="text-sm text-gray-500">v1.0.0</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <SettingsIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-blue-900">Application Settings</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Maintenance Mode</span>
                  <button className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    Disabled
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Debug Mode</span>
                  <button className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Development
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">API Rate Limit</span>
                  <span className="text-sm text-gray-500">1000/hour</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </ProtectedRoute>
  );
}