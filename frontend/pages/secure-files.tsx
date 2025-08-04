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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <ShieldCheckIcon className="h-8 w-8 text-green-600 mr-3" />
                  Secure Files
                </h1>
                <p className="mt-2 text-sm text-gray-700">
                  Confidential documents and internal audit files
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Access granted by</p>
                  <p className="text-sm font-medium text-gray-900">
                    {secureFilesData?.access_granted_by}
                  </p>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {secureFilesData?.role}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Files</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {secureFilesData?.total_count || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShieldCheckIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Access Level</dt>
                      <dd className="text-lg font-medium text-gray-900">Secure</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Your Role</dt>
                      <dd className="text-lg font-medium text-gray-900">{user?.role}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Confidential Documents
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Internal audit reports and security assessments
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {secureFilesData?.files.map((file) => (
                <li key={file.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <DocumentIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {file.name}
                            </p>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Secure
                            </span>
                          </div>
                          <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
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
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Preview
                        </button>
                        <button className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
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

          {/* Security Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Security Notice</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
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