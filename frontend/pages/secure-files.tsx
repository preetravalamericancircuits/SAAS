import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

import { 
  DocumentIcon, 
  ArrowDownTrayIcon, 
  EyeIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface SecureFile {
  id: number;
  name: string;
  size: string;
  uploaded_at: string;
  uploaded_by: string;
}

interface SecureFilesResponse {
  files: SecureFile[];
  total_count: number;
  access_granted_by: string;
  role: string;
}

export default function SecureFilesPage() {
  const { user } = useAuth();

  const { data: secureFilesData, isLoading, error } = useQuery<SecureFilesResponse>(
    'secure-files',
    async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/secure-files`, {
        withCredentials: true
      });
      return response.data;
    },
    {
      retry: false,
      onError: (error: any) => {
        console.error('Failed to fetch secure files:', error);
      }
    }
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['ITRA', 'SuperUser']}>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={['ITRA', 'SuperUser']}>
        <Layout>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading secure files</h3>
                <div className="mt-2 text-sm text-red-700">
                  Failed to load secure files. You may not have the required permissions.
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['ITRA', 'SuperUser']}>
      <Layout>
        <div className="max-w-7xl mx-auto">
          {/* Header */} 
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">

                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center">
                    <ShieldCheckIcon className="h-8 w-8 text-accent mr-3" />
                    Secure Files
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Confidential documents and internal audit files
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Access granted by</p>
                  <p className="text-sm font-medium text-foreground">
                    {secureFilesData?.access_granted_by}
                  </p>
                </div>
                <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {secureFilesData?.role}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
            <div className="bg-card overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Total Files</dt>
                      <dd className="text-lg font-medium text-foreground">
                        {secureFilesData?.total_count || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShieldCheckIcon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Access Level</dt>
                      <dd className="text-lg font-medium text-foreground">Secure</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Your Role</dt>
                      <dd className="text-lg font-medium text-foreground">{user?.role}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="bg-card shadow overflow-hidden sm:rounded-md animate-fade-in">
            <div className="px-4 py-5 sm:px-6 border-b border-border">
              <h3 className="text-lg leading-6 font-medium text-foreground">
                Confidential Documents
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Internal audit reports and security assessments
              </p>
            </div>
            <ul className="divide-y divide-border">
              {secureFilesData?.files.map((file) => (
                <li key={file.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <DocumentIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-foreground">
                              {file.name}
                            </p>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                              Secure
                            </span>
                          </div>
                          <div className="flex items-center mt-1 space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {formatDate(file.uploaded_at)}
                            </div>
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-1" />
                              {file.uploaded_by}
                            </div>
                            <div>{file.size}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="inline-flex items-center px-3 py-1 border border-border shadow-sm text-sm leading-4 font-medium rounded-md text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Preview
                        </button>
                        <button className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-background bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring">
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 bg-accent/20 border-accent rounded-lg border p-4">
            <div className="p-4">
              <div className="flex">
                <ShieldCheckIcon className="h-5 w-5 text-accent flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-accent-foreground">Security Notice</h3>
                  <p className="mt-2 text-sm text-accent-foreground/80">
                    These files contain confidential information. Please ensure you have proper authorization 
                    before accessing or downloading any documents. All access is logged and monitored.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
