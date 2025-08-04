import { ChartBarIcon, DocumentArrowDownIcon, EyeIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { ModernCard, ModernButton, ModernPageHeader, ModernStatsCard } from '@/components/ui/modern-components';

export default function Analytics() {
  const handleButtonClick = (action: string) => {
    switch(action) {
      case 'Generate Report':
        const reportData = {
          type: 'Analytics Report',
          date: new Date().toISOString(),
          data: analyticsStats
        };
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        break;
      case 'Export Data':
        const csvData = analyticsStats.map(stat => `${stat.name},${stat.value}`).join('\n');
        const csvBlob = new Blob([`Name,Value\n${csvData}`], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = `analytics-data-${new Date().toISOString().split('T')[0]}.csv`;
        csvLink.click();
        break;
      default:
        alert(`${action} functionality implemented!`);
    }
  };

  const analyticsStats = [
    { name: 'Page Views', value: '45,231', icon: EyeIcon, color: 'bg-blue-600', trend: { value: '+15%', isPositive: true } },
    { name: 'Conversion Rate', value: '3.24%', icon: ArrowTrendingUpIcon, color: 'bg-green-600', trend: { value: '+0.5%', isPositive: true } },
    { name: 'Bounce Rate', value: '42.1%', icon: ChartBarIcon, color: 'bg-yellow-600', trend: { value: '-2.3%', isPositive: true } },
    { name: 'Revenue', value: '$12,450', icon: DocumentArrowDownIcon, color: 'bg-purple-600', trend: { value: '+8%', isPositive: true } }
  ];

  return (
    <div className="space-y-8">
      <ModernPageHeader 
        title="Analytics" 
        description="Comprehensive analytics dashboard with real-time metrics, user behavior insights, and performance tracking"
        action={
          <ModernButton onClick={() => handleButtonClick('Refresh Data')}>
            Refresh Data
          </ModernButton>
        }
      />
      
      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsStats.map((stat) => (
          <ModernStatsCard
            key={stat.name}
            title={stat.name}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>
      
      {/* Analytics Actions */}
      <ModernCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Tools</h2>
        <p className="text-gray-600 mb-6">Generate reports and export your analytics data</p>
        
        <div className="flex flex-wrap gap-4">
          <ModernButton
            onClick={() => handleButtonClick('Generate Report')}
            variant="primary"
          >
            Generate Report
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('Export Data')}
            variant="secondary"
          >
            Export Data
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('View Charts')}
            variant="outline"
          >
            View Charts
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('Schedule Report')}
            variant="ghost"
          >
            Schedule Report
          </ModernButton>
        </div>
      </ModernCard>
      
      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ModernCard className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
            <div className="h-64 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600">Interactive charts showing traffic trends, conversion rates, and user engagement metrics</p>
              </div>
            </div>
          </ModernCard>
        </div>
        
        <ModernCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Pages</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">/dashboard</span>
              <span className="text-sm font-medium text-gray-900">12,450 views</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">/analytics</span>
              <span className="text-sm font-medium text-gray-900">8,230 views</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">/users</span>
              <span className="text-sm font-medium text-gray-900">5,670 views</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">/reports</span>
              <span className="text-sm font-medium text-gray-900">4,120 views</span>
            </div>
          </div>
        </ModernCard>
      </div>
      
      {/* User Behavior */}
      <ModernCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Behavior Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">2.5 min</div>
            <div className="text-sm text-gray-600">Average Session Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">4.2</div>
            <div className="text-sm text-gray-600">Pages per Session</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">68%</div>
            <div className="text-sm text-gray-600">Returning Visitors</div>
          </div>
        </div>
      </ModernCard>
    </div>
  );
}