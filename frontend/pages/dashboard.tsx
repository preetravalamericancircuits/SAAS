import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import UserManagement from '@/components/UserManagement';
import ProtectedRoute from '@/components/ProtectedRoute';
import { XCircleIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Check for error query parameter
    if (router.query.error === 'insufficient_permissions') {
      setShowError(true);
      // Remove the error from URL
      router.replace('/dashboard', undefined, { shallow: true });
    }
  }, [router.query.error, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Error Message */}
          {showError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      You don't have the required permissions to access the requested page. 
                      Please contact your administrator if you believe this is an error.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setShowError(false)}
                      className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user?.role === 'SuperUser' ? (
            <UserManagement />
          ) : (
            <Dashboard />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 