import { BarChart3, Plus, Calendar, Clock, Download } from 'lucide-react';
import { ModernCard, ModernButton, ModernPageHeader, ModernStatsCard, ModernBadge } from '@/components/ui/modern-components';

export default function Reports() {
  const handleButtonClick = (action: string) => {
    console.log(`Reports action: ${action}`);
    alert(`${action} clicked!`);
  };

  const reportStats = [
    { name: 'Total Reports', value: '156', icon: BarChart3, color: 'bg-blue-600' },
    { name: 'Generated Today', value: '12', icon: Plus, color: 'bg-green-600' },
    { name: 'Scheduled', value: '8', icon: Calendar, color: 'bg-yellow-600' },
    { name: 'Downloads', value: '89', icon: Download, color: 'bg-purple-600' }
  ];

  const recentReports = [
    { id: 1, name: 'Monthly Performance Report', type: 'Performance', date: '2024-01-15', status: 'Ready' },
    { id: 2, name: 'User Analytics Summary', type: 'Analytics', date: '2024-01-14', status: 'Generating' },
    { id: 3, name: 'Security Audit Report', type: 'Security', date: '2024-01-13', status: 'Ready' },
    { id: 4, name: 'System Health Check', type: 'System', date: '2024-01-12', status: 'Scheduled' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready': return 'success';
      case 'Generating': return 'warning';
      case 'Scheduled': return 'info';
      default: return 'primary';
    }
  };

  return (
    <div className="space-y-8 p-6">
      <ModernPageHeader 
        title="Reports" 
        description="Comprehensive reporting system with automated generation, scheduling, and advanced analytics"
        action={
          <ModernButton onClick={() => handleButtonClick('Create Report')}>
            Create Report
          </ModernButton>
        }
      />
      
      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportStats.map((stat) => (
          <ModernStatsCard
            key={stat.name}
            title={stat.name}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
      
      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Report</h3>
          <p className="text-sm text-gray-600 mb-4">System performance metrics and analysis</p>
          <ModernButton size="sm" onClick={() => handleButtonClick('Generate Performance Report')}>Generate</ModernButton>
        </ModernCard>
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User Analytics</h3>
          <p className="text-sm text-gray-600 mb-4">User behavior and engagement metrics</p>
          <ModernButton size="sm" onClick={() => handleButtonClick('Generate User Report')}>Generate</ModernButton>
        </ModernCard>
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Audit</h3>
          <p className="text-sm text-gray-600 mb-4">Security assessment and vulnerability report</p>
          <ModernButton size="sm" onClick={() => handleButtonClick('Generate Security Report')}>Generate</ModernButton>
        </ModernCard>
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Report</h3>
          <p className="text-sm text-gray-600 mb-4">Build your own custom report template</p>
          <ModernButton size="sm" onClick={() => handleButtonClick('Create Custom Report')}>Create</ModernButton>
        </ModernCard>
      </div>
      
      {/* Report Management */}
      <ModernCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Management</h2>
        <p className="text-sm text-gray-600 mb-6">Create, schedule, and manage all your reports from one central location</p>
        <div className="flex flex-wrap gap-4">
          <ModernButton
            onClick={() => handleButtonClick('Create Report')}
            variant="primary"
          >
            Create Report
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('Schedule Report')}
            variant="secondary"
          >
            Schedule Report
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('View History')}
            variant="outline"
          >
            View History
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('Export All')}
            variant="ghost"
          >
            Export All
          </ModernButton>
        </div>
      </ModernCard>
      
      {/* Recent Reports */}
      <ModernCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Reports</h2>
        <div className="space-y-4">
          {recentReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <BarChart3 className="h-8 w-8 text-primary-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.type} • {report.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <ModernBadge variant={getStatusColor(report.status) as any}>
                  {report.status}
                </ModernBadge>
                {report.status === 'Ready' && (
                  <ModernButton 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleButtonClick(`Download ${report.name}`)}
                  >
                    Download
                  </ModernButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  );
}