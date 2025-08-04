import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Users, CheckSquare, Activity, TrendingUp } from 'lucide-react';
import { CardSkeleton } from './Skeleton';

export default function Dashboard() {
  const { user, loading } = useAuth();

  const overviewCards = [
    {
      title: 'Total Users',
      value: '1,247',
      icon: Users,
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Tasks',
      value: '89',
      icon: CheckSquare,
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      icon: Activity,
      change: '24h',
      changeType: 'neutral'
    },
    {
      title: 'Performance',
      value: '94%',
      icon: TrendingUp,
      change: '+2%',
      changeType: 'positive'
    }
  ];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-6 bg-gray-50 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold text-blue-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.username}</p>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={card.title} 
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-blue-900 mt-2">{card.value}</p>
                  <p className={`text-sm mt-1 ${
                    card.changeType === 'positive' ? 'text-green-600' :
                    card.changeType === 'negative' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {card.change}
                  </p>
                </div>
                <motion.div 
                  className="p-3 bg-blue-100 rounded-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="w-6 h-6 text-blue-600" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { color: 'bg-green-500', text: 'New user registered - 2 hours ago' },
              { color: 'bg-blue-500', text: 'Task completed - 4 hours ago' },
              { color: 'bg-yellow-500', text: 'System maintenance - 1 day ago' }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="flex items-center space-x-3"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                <span className="text-sm text-gray-600">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              'Create New Task',
              'Manage Users',
              'View Reports'
            ].map((action, index) => (
              <motion.button 
                key={action}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm font-medium text-gray-900">{action}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}