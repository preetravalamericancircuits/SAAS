import { useState } from 'react';
import { WrenchScrewdriverIcon, GlobeAltIcon, ChartBarIcon, DocumentTextIcon, CogIcon } from '@heroicons/react/24/outline';
import { ModernCard, ModernButton, ModernPageHeader, ModernInput } from '@/components/ui/modern-components';

export default function Tools() {
  const [selectedTool, setSelectedTool] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const internalTools = [
    { 
      name: 'Performance Monitor', 
      url: 'https://gtmetrix.com/', 
      description: 'Website performance analysis',
      icon: ChartBarIcon,
      category: 'Performance'
    },
    { 
      name: 'SEO Analyzer', 
      url: 'https://www.seobility.net/en/seocheck/', 
      description: 'SEO analysis and optimization',
      icon: DocumentTextIcon,
      category: 'SEO'
    },
    { 
      name: 'Code Validator', 
      url: 'https://validator.w3.org/', 
      description: 'HTML/CSS validation tool',
      icon: CogIcon,
      category: 'Development'
    },
    { 
      name: 'Speed Test', 
      url: 'https://www.speedtest.net/', 
      description: 'Internet speed testing',
      icon: GlobeAltIcon,
      category: 'Network'
    },
    { 
      name: 'JSON Formatter', 
      url: 'https://jsonformatter.curiousconcept.com/', 
      description: 'Format and validate JSON',
      icon: WrenchScrewdriverIcon,
      category: 'Development'
    }
  ];

  const handleToolSelect = (url: string) => {
    setSelectedTool(url);
  };

  const handleCustomUrl = () => {
    if (customUrl) {
      setSelectedTool(customUrl);
    }
  };

  return (
    <div className="space-y-8">
      <ModernPageHeader 
        title="Internal Tools" 
        description="Access comparison tools and internal websites"
      />
      
      {/* Tool Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internalTools.map((tool) => (
          <ModernCard key={tool.name} className="p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => handleToolSelect(tool.url)}>
            <div className="flex items-center mb-4">
              <tool.icon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{tool.category}</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
            <ModernButton 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                handleToolSelect(tool.url);
              }}
            >
              Open Tool
            </ModernButton>
          </ModernCard>
        ))}
      </div>

      {/* Custom URL Input */}
      <ModernCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Website</h2>
        <div className="flex gap-4">
          <ModernInput
            placeholder="Enter website URL (e.g., https://example.com)"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1"
          />
          <ModernButton onClick={handleCustomUrl}>
            Load Website
          </ModernButton>
        </div>
      </ModernCard>

      {/* Website Preview */}
      {selectedTool && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Website Preview</h2>
            <div className="flex gap-2">
              <ModernButton 
                size="sm" 
                variant="outline"
                onClick={() => window.open(selectedTool, '_blank')}
              >
                Open in New Tab
              </ModernButton>
              <ModernButton 
                size="sm" 
                variant="ghost"
                onClick={() => setSelectedTool('')}
              >
                Close
              </ModernButton>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner">
            <iframe
              src={selectedTool}
              className="w-full h-96"
              title="Tool Preview"
            />
          </div>
        </ModernCard>
      )}
    </div>
  );
}