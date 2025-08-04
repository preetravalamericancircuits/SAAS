import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/ui/page-header';
import { PageContainer } from '@/components/ui/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    siteName: 'American Circuits Inc.',
    maintenanceMode: false,
    emailNotifications: true,
    auditLogging: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings' }
  ];

  return (
    <ProtectedRoute allowedRoles={['SuperUser']}>
      <Layout>
        <PageContainer>
          <PageHeader
            title="System Settings"
            description="Configure system-wide settings and preferences"
            breadcrumbs={breadcrumbs}
          />

          <Card>
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">General Settings</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Name</label>
                  <Input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Timeout (minutes)</label>
                    <Input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Login Attempts</label>
                    <Input
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-900 dark:text-white">Maintenance Mode</label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-900 dark:text-white">Email Notifications</label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.auditLogging}
                      onChange={(e) => setSettings({...settings, auditLogging: e.target.checked})}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-900 dark:text-white">Audit Logging</label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageContainer>
      </Layout>
    </ProtectedRoute>
  );
}