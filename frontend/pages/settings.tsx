import { CogIcon, UserIcon, KeyIcon, BellIcon, ShieldCheckIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { ModernCard, ModernButton, ModernPageHeader, ModernInput } from '@/components/ui/modern-components';
import { useState } from 'react';

export default function Settings() {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    company: 'SAAS Company'
  });

  const handleButtonClick = (action: string) => {
    console.log(`Settings action: ${action}`);
    alert(`${action} clicked!`);
  };

  const settingsSections = [
    {
      title: 'Profile Settings',
      icon: UserIcon,
      description: 'Manage your personal information and account details',
      actions: ['Update Profile', 'Change Avatar']
    },
    {
      title: 'Security',
      icon: ShieldCheckIcon,
      description: 'Password, two-factor authentication, and security preferences',
      actions: ['Change Password', 'Enable 2FA']
    },
    {
      title: 'Notifications',
      icon: BellIcon,
      description: 'Configure email and push notification preferences',
      actions: ['Email Settings', 'Push Notifications']
    },
    {
      title: 'Appearance',
      icon: PaintBrushIcon,
      description: 'Customize the look and feel of your dashboard',
      actions: ['Theme Settings', 'Layout Options']
    }
  ];

  return (
    <div className="space-y-8">
      <ModernPageHeader 
        title="Settings" 
        description="Comprehensive system configuration, user preferences, security settings, and platform customization options"
      />
      
      {/* Profile Information */}
      <ModernCard className="p-6">
        <div className="flex items-center mb-6">
          <UserIcon className="h-6 w-6 text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModernInput
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
          />
          <ModernInput
            label="Email Address"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({...profile, email: e.target.value})}
          />
          <ModernInput
            label="Company"
            value={profile.company}
            onChange={(e) => setProfile({...profile, company: e.target.value})}
            className="md:col-span-2"
          />
        </div>
        
        <div className="mt-6 flex gap-4">
          <ModernButton onClick={() => handleButtonClick('Save Profile')}>
            Save Changes
          </ModernButton>
          <ModernButton variant="outline" onClick={() => handleButtonClick('Cancel')}>
            Cancel
          </ModernButton>
        </div>
      </ModernCard>
      
      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section) => (
          <ModernCard key={section.title} className="p-6">
            <div className="flex items-center mb-4">
              <section.icon className="h-6 w-6 text-primary-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{section.description}</p>
            <div className="space-y-3">
              {section.actions.map((action) => (
                <ModernButton
                  key={action}
                  variant="outline"
                  size="sm"
                  onClick={() => handleButtonClick(action)}
                  className="w-full justify-start"
                >
                  {action}
                </ModernButton>
              ))}
            </div>
          </ModernCard>
        ))}
      </div>
      
      {/* System Configuration */}
      <ModernCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Platform Settings</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Maintenance Mode</span>
                <button className="w-10 h-6 bg-gray-200 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Auto Backup</span>
                <button className="w-10 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Email Notifications</span>
                <button className="w-10 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                </button>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Security Settings</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Two-Factor Auth</span>
                <button className="w-10 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Session Timeout</span>
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Login Attempts</span>
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>3 attempts</option>
                  <option>5 attempts</option>
                  <option>10 attempts</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </ModernCard>
      
      {/* Quick Actions */}
      <ModernCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <p className="text-sm text-gray-600 mb-6">Frequently used settings and configuration options for quick access</p>
        <div className="flex flex-wrap gap-4">
          <ModernButton
            onClick={() => handleButtonClick('Update Profile')}
            variant="primary"
          >
            Update Profile
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('Change Password')}
            variant="secondary"
          >
            Change Password
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('Manage Preferences')}
            variant="outline"
          >
            Manage Preferences
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('Export Data')}
            variant="ghost"
          >
            Export Data
          </ModernButton>
        </div>
      </ModernCard>
    </div>
  );
}