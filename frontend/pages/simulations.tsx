import { Flask, Play, Download, Clock } from 'lucide-react';
import { ModernCard, ModernButton, ModernPageHeader, ModernStatsCard, ModernBadge } from '@/components/ui/modern-components';

export default function Simulations() {
  const handleButtonClick = (action: string) => {
    console.log(`Simulations action: ${action}`);
    alert(`${action} clicked!`);
  };

  const simulationStats = [
    { name: 'Running Simulations', value: '8', icon: Play, color: 'bg-green-600' },
    { name: 'Completed Today', value: '24', icon: Flask, color: 'bg-blue-600' },
    { name: 'Queue Length', value: '3', icon: Clock, color: 'bg-yellow-600' },
    { name: 'Success Rate', value: '96.8%', icon: Download, color: 'bg-purple-600' }
  ];

  const recentSimulations = [
    { id: 1, name: 'Load Test Simulation', status: 'Running', progress: 75, duration: '2h 15m' },
    { id: 2, name: 'Performance Analysis', status: 'Completed', progress: 100, duration: '1h 45m' },
    { id: 3, name: 'Stress Test', status: 'Queued', progress: 0, duration: 'Pending' },
    { id: 4, name: 'Security Scan', status: 'Failed', progress: 45, duration: '30m' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running': return 'warning';
      case 'Completed': return 'success';
      case 'Queued': return 'info';
      case 'Failed': return 'error';
      default: return 'primary';
    }
  };

  return (
    <div className="space-y-8 p-6">
      <ModernPageHeader 
        title="Simulations" 
        description="Advanced simulation management system for load testing, performance analysis, and system validation"
        action={
          <ModernButton onClick={() => handleButtonClick('Run New Simulation')}>
            Run New Simulation
          </ModernButton>
        }
      />
      
      {/* Simulation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {simulationStats.map((stat) => (
          <ModernStatsCard
            key={stat.name}
            title={stat.name}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
      
      {/* Simulation Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Load Testing</h3>
          <p className="text-sm text-gray-600 mb-4">Test system performance under expected load conditions</p>
          <ModernButton size="sm" onClick={() => handleButtonClick('Start Load Test')}>Start Load Test</ModernButton>
        </ModernCard>
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stress Testing</h3>
          <p className="text-sm text-gray-600 mb-4">Push system beyond normal capacity to find breaking points</p>
          <ModernButton size="sm" onClick={() => handleButtonClick('Start Stress Test')}>Start Stress Test</ModernButton>
        </ModernCard>
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Scan</h3>
          <p className="text-sm text-gray-600 mb-4">Comprehensive security vulnerability assessment</p>
          <ModernButton size="sm" onClick={() => handleButtonClick('Start Security Scan')}>Start Security Scan</ModernButton>
        </ModernCard>
      </div>
      
      {/* Simulation Controls */}
      <ModernCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Simulation Controls</h2>
        <p className="text-sm text-gray-600 mb-6">Manage your simulation processes with advanced controls and monitoring</p>
        <div className="flex flex-wrap gap-4">
          <ModernButton
            onClick={() => handleButtonClick('Run New Simulation')}
            variant="primary"
          >
            Run New Simulation
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('View Details')}
            variant="secondary"
          >
            View Details
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('Download Report')}
            variant="outline"
          >
            Download Report
          </ModernButton>
          <ModernButton
            onClick={() => handleButtonClick('Pause All')}
            variant="ghost"
          >
            Pause All
          </ModernButton>
        </div>
      </ModernCard>
      
      {/* Recent Simulations */}
      <ModernCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Simulations</h2>
        <div className="space-y-4">
          {recentSimulations.map((sim) => (
            <div key={sim.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <Flask className="h-8 w-8 text-primary-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{sim.name}</h3>
                  <p className="text-sm text-gray-600">Duration: {sim.duration}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{sim.progress}%</div>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${sim.progress}%` }}
                    ></div>
                  </div>
                </div>
                <ModernBadge variant={getStatusColor(sim.status) as any}>
                  {sim.status}
                </ModernBadge>
              </div>
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  );
}