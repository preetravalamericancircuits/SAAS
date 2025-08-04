import { ChartBarIcon, DocumentArrowDownIcon, EyeIcon, TrendingUpIcon } from '@heroicons/react/24/outline';
import { ModernCard, ModernButton, ModernPageHeader, ModernStatsCard } from '@/components/ui/modern-components';

export default function Analytics() {
  const handleButtonClick = (action: string) => {
    console.log(`Analytics action: ${action}`);
    alert(`${action} clicked!`);
  };

  const analyticsStats = [
    { name: 'Page Views', value: '45,231', icon: EyeIcon, color: 'bg-blue-600', trend: { value: '+15%', isPositive: true } },
    { name: 'Conversion Rate', value: '3.24%', icon: TrendingUpIcon, color: 'bg-green-600', trend: { value: '+0.5%', isPositive: true } },
    { name: 'Bounce Rate', value: '42.1%', icon: ChartBarIcon, color: 'bg-yellow-600', trend: { value: '-2.3%', isPositive: true } },
    { name: 'Revenue', value: '$12,450', icon: DocumentArrowDownIcon, color: 'bg-purple-600', trend: { value: '+8%', isPositive: true } }
  ];

  return (
    <div className="space-y-8">
      <ModernPageHeader 
        title="Analytics" 
        description="Track your platform performance and user engagement"
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
      
      {/* Chart Placeholder */}
      <ModernCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
        <div className="h-64 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ChartBarIcon className="h-16 w-16 text-primary-400 mx-auto mb-4" />
            <p className="text-gray-600">Interactive charts will be displayed here</p>
          </div>
        </div>
      </ModernCard>
    </div>
  );
}