import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import UserManagement from '@/components/UserManagement';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/ui/page-header';
import { PageContainer } from '@/components/ui/page-container';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (router.query.error === 'insufficient_permissions') {
      toast.error('Access denied. You don\'t have the required permissions.');
      router.replace('/dashboard', undefined, { shallow: true });
    }
  }, [router.query.error, router]);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard' }
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <PageContainer>
          <PageHeader
            title="Dashboard"
            description={`Welcome back, ${user?.username}! Here's what's happening.`}
            breadcrumbs={breadcrumbs}
          />
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {user?.role === 'SuperUser' ? (
              <UserManagement />
            ) : (
              <Dashboard />
            )}
          </div>
        </PageContainer>
      </Layout>
    </ProtectedRoute>
  );
} 