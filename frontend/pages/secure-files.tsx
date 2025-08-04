import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard, ModernPageHeader, ModernButton } from '@/components/ui/modern-components';
import { 
  DocumentIcon, 
  LockClosedIcon, 
  EyeIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const secureFiles = [
  {
    id: 1,
    name: 'Security Audit Report Q4 2024',
    type: 'PDF',
    size: '2.4 MB',
    classification: 'CONFIDENTIAL',
    lastModified: '2024-01-15',
    description: 'Comprehensive security audit findings and recommendations',
    accessLevel: ['SuperUser', 'ITRA']
  },
  {
    id: 2,
    name: 'Internal Technical Review Guidelines',
    type: 'DOCX',
    size: '1.8 MB',
    classification: 'RESTRICTED',
    lastModified: '2024-01-10',
    description: 'ITRA process documentation and compliance requirements',
    accessLevel: ['SuperUser', 'ITRA']
  },
  {
    id: 3,
    name: 'System Architecture Blueprints',
    type: 'PDF',
    size: '5.2 MB',
    classification: 'CONFIDENTIAL',
    lastModified: '2024-01-08',
    description: 'Detailed system architecture and infrastructure diagrams',
    accessLevel: ['SuperUser', 'ITRA', 'Admin']
  },
  {
    id: 4,
    name: 'Compliance Checklist 2024',
    type: 'XLSX',
    size: '890 KB',
    classification: 'INTERNAL',
    lastModified: '2024-01-05',
    description: 'Annual compliance requirements and verification checklist',
    accessLevel: ['SuperUser', 'ITRA']
  },
  {
    id: 5,
    name: 'Incident Response Procedures',
    type: 'PDF',
    size: '3.1 MB',
    classification: 'RESTRICTED',
    lastModified: '2024-01-03',
    description: 'Emergency response protocols and escalation procedures',
    accessLevel: ['SuperUser', 'ITRA', 'Admin']
  }
];

export default function SecureFiles() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Check if user has access to secure files
    if (!user || !['SuperUser', 'ITRA', 'Admin'].includes(user.role)) {
      setAccessDenied(true);
    }
  }, [user]);

  const handleFileView = (file: any) => {
    if (file.accessLevel.includes(user?.role)) {
      setSelectedFile(file);
    } else {
      alert('Access denied: Insufficient permissions');
    }
  };

  const handleFileDownload = (file: any) => {
    if (file.accessLevel.includes(user?.role)) {
      // Simulate file download
      alert(`Downloading ${file.name}...`);
    } else {
      alert('Access denied: Insufficient permissions');
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'CONFIDENTIAL': return 'bg-red-100 text-red-800';
      case 'RESTRICTED': return 'bg-orange-100 text-orange-800';
      case 'INTERNAL': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (accessDenied) {
    return (
        <div className="space-y-6 p-6">
          <ModernCard>
            <div className="p-8 text-center">
              <LockClosedIcon className="mx-auto h-16 w-16 text-red-500" />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Access Denied</h2>
              <p className="mt-2 text-gray-600">
                You don't have permission to access secure files. This area is restricted to ITRA and SuperUser roles only.
              </p>
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Required: ITRA or SuperUser Role
                </span>
              </div>
            </div>
          </ModernCard>
        </div>
    );
  }

  return (
      <div className="space-y-6 p-6">
        <ModernPageHeader
          title="Secure Files"
          description={`Access confidential documents and restricted materials - ${secureFiles.length} Files Available`}
        />

        {/* Security Notice */}
        <ModernCard className="border-l-4 border-red-500">
          <div className="p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Security Notice</h3>
                <p className="text-sm text-red-700 mt-1">
                  All file access is logged and monitored. Unauthorized sharing or distribution of these materials is strictly prohibited.
                </p>
              </div>
            </div>
          </div>
        </ModernCard>

        {/* Files Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {secureFiles.map((file) => (
            <ModernCard key={file.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <DocumentIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {file.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{file.type}</span>
                        <span>{file.size}</span>
                        <span>Modified: {file.lastModified}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(file.classification)}`}>
                      {file.classification}
                    </span>
                    {file.accessLevel.includes(user?.role || '') ? (
                      <ShieldCheckIcon className="h-4 w-4 text-green-500" title="Access Granted" />
                    ) : (
                      <LockClosedIcon className="h-4 w-4 text-red-500" title="Access Denied" />
                    )}
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileView(file)}
                    disabled={!file.accessLevel.includes(user?.role || '')}
                    className="flex items-center space-x-1"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>View</span>
                  </ModernButton>
                  <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileDownload(file)}
                    disabled={!file.accessLevel.includes(user?.role || '')}
                    className="flex items-center space-x-1"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Download</span>
                  </ModernButton>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  <span>Access Level: {file.accessLevel.join(', ')}</span>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>

        {/* File Viewer Modal */}
        {selectedFile && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedFile.name}
                  </h3>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <div className="bg-gray-100 p-8 rounded-lg text-center">
                  <DocumentIcon className="mx-auto h-16 w-16 text-gray-400" />
                  <p className="mt-4 text-gray-600">
                    File preview would be displayed here in a real implementation.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedFile.description}
                  </p>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <ModernButton
                    variant="outline"
                    onClick={() => setSelectedFile(null)}
                  >
                    Close
                  </ModernButton>
                  <ModernButton
                    onClick={() => handleFileDownload(selectedFile)}
                  >
                    Download
                  </ModernButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Access Statistics */}
        <ModernCard>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Access Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {secureFiles.filter(f => f.accessLevel.includes(user?.role || '')).length}
                </div>
                <div className="text-sm text-gray-500">Accessible Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {secureFiles.filter(f => f.classification === 'CONFIDENTIAL').length}
                </div>
                <div className="text-sm text-gray-500">Confidential</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {secureFiles.filter(f => f.classification === 'RESTRICTED').length}
                </div>
                <div className="text-sm text-gray-500">Restricted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{user?.role}</div>
                <div className="text-sm text-gray-500">Your Access Level</div>
              </div>
            </div>
          </div>
        </ModernCard>
      </div>
  );
}