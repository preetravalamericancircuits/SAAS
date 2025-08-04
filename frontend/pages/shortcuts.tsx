import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard, ModernPageHeader, ModernButton } from '@/components/ui/modern-components';
import { 
  Globe, 
  BookOpen, 
  BarChart3,
  Settings,
  ShieldCheck,
  Cloud,
  Code,
  GraduationCap
} from 'lucide-react';

const shortcuts = [
  {
    category: 'Development Tools',
    links: [
      { name: 'GitHub', url: 'https://github.com', icon: Code, description: 'Code repository and version control' },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: BookOpen, description: 'Developer Q&A community' },
      { name: 'VS Code Web', url: 'https://vscode.dev', icon: Code, description: 'Online code editor' },
      { name: 'CodePen', url: 'https://codepen.io', icon: Code, description: 'Online code playground' }
    ]
  },
  {
    category: 'Cloud Services',
    links: [
      { name: 'AWS Console', url: 'https://console.aws.amazon.com', icon: Cloud, description: 'Amazon Web Services dashboard' },
      { name: 'Google Cloud', url: 'https://console.cloud.google.com', icon: Cloud, description: 'Google Cloud Platform' },
      { name: 'Azure Portal', url: 'https://portal.azure.com', icon: Cloud, description: 'Microsoft Azure services' },
      { name: 'Heroku', url: 'https://dashboard.heroku.com', icon: Cloud, description: 'Cloud application platform' }
    ]
  },
  {
    category: 'Analytics & Monitoring',
    links: [
      { name: 'Google Analytics', url: 'https://analytics.google.com', icon: BarChart3, description: 'Web analytics service' },
      { name: 'Grafana', url: 'https://grafana.com', icon: BarChart3, description: 'Monitoring and observability' },
      { name: 'New Relic', url: 'https://newrelic.com', icon: BarChart3, description: 'Application performance monitoring' },
      { name: 'DataDog', url: 'https://app.datadoghq.com', icon: BarChart3, description: 'Infrastructure monitoring' }
    ]
  },
  {
    category: 'Security Tools',
    links: [
      { name: 'OWASP', url: 'https://owasp.org', icon: ShieldCheck, description: 'Web application security' },
      { name: 'Security Headers', url: 'https://securityheaders.com', icon: ShieldCheck, description: 'Analyze HTTP security headers' },
      { name: 'SSL Labs', url: 'https://www.ssllabs.com/ssltest/', icon: ShieldCheck, description: 'SSL/TLS configuration test' },
      { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', icon: ShieldCheck, description: 'Check for data breaches' }
    ]
  },
  {
    category: 'Learning Resources',
    links: [
      { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: GraduationCap, description: 'Web development documentation' },
      { name: 'freeCodeCamp', url: 'https://freecodecamp.org', icon: GraduationCap, description: 'Free coding bootcamp' },
      { name: 'Coursera', url: 'https://coursera.org', icon: GraduationCap, description: 'Online courses and degrees' },
      { name: 'Udemy', url: 'https://udemy.com', icon: GraduationCap, description: 'Online learning platform' }
    ]
  },
  {
    category: 'Productivity',
    links: [
      { name: 'Notion', url: 'https://notion.so', icon: BookOpen, description: 'All-in-one workspace' },
      { name: 'Trello', url: 'https://trello.com', icon: Settings, description: 'Project management boards' },
      { name: 'Slack', url: 'https://slack.com', icon: Globe, description: 'Team communication' },
      { name: 'Figma', url: 'https://figma.com', icon: Globe, description: 'Design and prototyping' }
    ]
  }
];

export default function Shortcuts() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShortcuts = shortcuts.map(category => ({
    ...category,
    links: category.links.filter(link => 
      link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.links.length > 0);

  const handleLinkClick = (url: string, name: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
      <div className="space-y-6 p-6">
        <ModernPageHeader
          title="Quick Shortcuts"
          description={`Access your favorite tools and websites quickly - ${shortcuts.reduce((acc, cat) => acc + cat.links.length, 0)} Links Available`}
        />

        {/* Search Bar */}
        <ModernCard>
          <div className="p-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Globe className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </ModernCard>

        {/* Shortcuts Grid */}
        <div className="space-y-8">
          {filteredShortcuts.map((category) => (
            <div key={category.category}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{category.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.links.map((link) => (
                  <ModernCard key={link.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div 
                      className="p-4"
                      onClick={() => handleLinkClick(link.url, link.name)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <link.icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {link.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {link.description}
                          </p>
                          <div className="mt-2">
                            <span className="text-xs text-blue-600 hover:text-blue-800">
                              Visit →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ModernCard>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredShortcuts.length === 0 && (
          <ModernCard>
            <div className="p-8 text-center">
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No shortcuts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search terms.
              </p>
            </div>
          </ModernCard>
        )}

        {/* Quick Stats */}
        <ModernCard>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {shortcuts.reduce((acc, cat) => acc + cat.links.length, 0)}
                </div>
                <div className="text-sm text-gray-500">Total Links</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{shortcuts.length}</div>
                <div className="text-sm text-gray-500">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {user?.role || 'User'}
                </div>
                <div className="text-sm text-gray-500">Your Role</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-gray-500">Available</div>
              </div>
            </div>
          </div>
        </ModernCard>
      </div>
  );
}