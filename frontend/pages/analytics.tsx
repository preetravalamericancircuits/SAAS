import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import large dashboard components
const DashboardStats = dynamic(() => import('../components/DashboardStats'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>,
  ssr: false
});

const AnalyticsChart = dynamic(() => import('../components/AnalyticsChart'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>,
  ssr: false
});

const AnalyticsPage: NextPage = () => {
  const [featureFlags, setFeatureFlags] = useState({
    advancedAnalytics: false,
    realTimeUpdates: true,
    exportEnabled: true
  });

  useEffect(() => {
    // Load feature flags from configuration
    const loadFeatureFlags = async () => {
      try {
        const response = await fetch('/api/feature-flags');
        const flags = await response.json();
        setFeatureFlags(flags);
      } catch (error) {
        console.error('Failed to load feature flags:', error);
      }
    };
    loadFeatureFlags();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
          
          {featureFlags.advancedAnalytics && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Advanced Analytics</h2>
              <DashboardStats />
            </div>
          )}
          
          {featureFlags.realTimeUpdates && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Real-time Updates</h2>
              <AnalyticsChart />
            </div>
          )}
          
          {featureFlags.exportEnabled && (
            <div className="mt-8">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Export Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
