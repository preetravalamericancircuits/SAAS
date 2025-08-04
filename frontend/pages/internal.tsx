import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function InternalLinksPage() {
  const { user } = useAuth();

  const internalLinks = [
    {
      category: 'System Management',
      links: [
        { name: 'Database Admin (Adminer)', url: 'http://localhost:8080', description: 'Direct database access and management' },
        { name: 'Container Management (Portainer)', url: 'http://localhost:9000', description: 'Docker container monitoring and management' },
        { name: 'System Monitoring (Grafana)', url: 'http://localhost:3001', description: 'System metrics and performance dashboards' },
        { name: 'Metrics Collection (Prometheus)', url: 'http://localhost:9090', description: 'System metrics collection and queries' }
      ]
    },
    {
      category: 'Logging & Analytics',
      links: [
        { name: 'Log Search (Kibana)', url: 'http://localhost:5601', description: 'Search and analyze application logs' },
        { name: 'Search Engine (Elasticsearch)', url: 'http://localhost:9200', description: 'Direct access to search engine API' },
        { name: 'Email Testing (MailHog)', url: 'http://localhost:8025', description: 'Test email functionality and view sent emails' }
      ]
    },
    {
      category: 'API & Documentation',
      links: [
        { name: 'API Documentation (Swagger)', url: 'http://localhost:8000/docs', description: 'Interactive API documentation and testing' },
        { name: 'Alternative API Docs (ReDoc)', url: 'http://localhost:8000/redoc', description: 'Alternative API documentation format' },
        { name: 'API Health Check', url: 'http://localhost:8000/api/health', description: 'Backend service health status' }
      ]
    },
    {
      category: 'Development Tools',
      links: [
        { name: 'Frontend Application', url: 'http://localhost:3000', description: 'Main application frontend' },
        { name: 'Backend API', url: 'http://localhost:8000', description: 'Backend API service' },
        { name: 'Redis Cache', url: 'redis://localhost:6379', description: 'Redis cache server (requires client)' },
        { name: 'PostgreSQL Database', url: 'postgresql://localhost:5432', description: 'Main database server (requires client)' }
      ]
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['SuperUser', 'Admin']}>
      <Layout>
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Internal Website Links</h1>
              <p className="mt-2 text-gray-600">Quick access to internal tools and services</p>
            </div>

            <div className="space-y-6">
              {internalLinks.map((category) => (
                <div key={category.category} className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">{category.category}</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.links.map((link) => (
                        <div key={link.name} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{link.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                              <p className="text-xs text-blue-600 mt-2 font-mono">{link.url}</p>
                            </div>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-4 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              Open
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    These internal links provide direct access to system components. Only authorized personnel should access these services.
                    Some services may require additional authentication.
                  </p>
                </div>
              </div>
            </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}