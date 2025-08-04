import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NewLayout from '@/components/NewLayout';
import { ModernCard, ModernPageHeader, ModernButton } from '@/components/ui/modern-components';
import { 
  QuestionMarkCircleIcon, 
  BookOpenIcon, 
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const faqData = [
  {
    question: "How do I reset my password?",
    answer: "Go to your profile page and click on 'Change Password'. You'll need to enter your current password and then your new password twice."
  },
  {
    question: "Who can access secure files?",
    answer: "Only users with ITRA or SuperUser roles can access the secure files section. This is for confidential documents and restricted materials."
  },
  {
    question: "How do I generate reports?",
    answer: "Navigate to the Reports page where you can select from various templates like Performance, User Analytics, or Security Audit reports."
  },
  {
    question: "What are the different user roles?",
    answer: "We have SuperUser (full access), Admin (administrative), ITRA (technical review), Manager, Operator, User (standard), and Guest (read-only) roles."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach our support team via email at support@saasplatform.com, phone at (555) 123-4567, or through the live chat feature."
  }
];

const supportChannels = [
  {
    name: 'Live Chat',
    description: 'Get instant help from our support team',
    icon: ChatBubbleLeftRightIcon,
    action: 'Start Chat',
    available: '24/7'
  },
  {
    name: 'Phone Support',
    description: 'Speak directly with a support specialist',
    icon: PhoneIcon,
    action: 'Call Now',
    available: 'Mon-Fri 9AM-6PM'
  },
  {
    name: 'Email Support',
    description: 'Send us a detailed message',
    icon: EnvelopeIcon,
    action: 'Send Email',
    available: 'Response within 24h'
  },
  {
    name: 'Video Call',
    description: 'Schedule a screen sharing session',
    icon: VideoCameraIcon,
    action: 'Schedule Call',
    available: 'By appointment'
  }
];

const resources = [
  {
    title: 'User Guide',
    description: 'Complete guide to using the platform',
    icon: BookOpenIcon,
    type: 'PDF',
    size: '2.1 MB'
  },
  {
    title: 'API Documentation',
    description: 'Technical documentation for developers',
    icon: DocumentTextIcon,
    type: 'Web',
    size: 'Online'
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video walkthroughs',
    icon: VideoCameraIcon,
    type: 'Video',
    size: '15 videos'
  },
  {
    title: 'Quick Start Guide',
    description: 'Get up and running in 5 minutes',
    icon: DocumentTextIcon,
    type: 'PDF',
    size: '890 KB'
  }
];

export default function Help() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSupportAction = (channel: string) => {
    switch (channel) {
      case 'Live Chat':
        alert('Opening live chat...');
        break;
      case 'Phone Support':
        window.open('tel:+15551234567');
        break;
      case 'Email Support':
        window.open('mailto:support@saasplatform.com');
        break;
      case 'Video Call':
        alert('Redirecting to scheduling page...');
        break;
    }
  };

  const handleResourceDownload = (resource: string) => {
    alert(`Downloading ${resource}...`);
  };

  return (
    <NewLayout>
      <div className="space-y-6">
        <ModernPageHeader
          title="Help & Support"
          description="Find answers to your questions and get the help you need - 24/7 Support Available"
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {supportChannels.map((channel) => (
            <ModernCard key={channel.name} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div 
                className="p-4 text-center"
                onClick={() => handleSupportAction(channel.name)}
              >
                <channel.icon className="mx-auto h-8 w-8 text-blue-600 mb-3" />
                <h3 className="text-sm font-medium text-gray-900">{channel.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{channel.description}</p>
                <div className="mt-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {channel.available}
                  </span>
                </div>
                <ModernButton size="sm" className="mt-3 w-full">
                  {channel.action}
                </ModernButton>
              </div>
            </ModernCard>
          ))}
        </div>

        {/* FAQ Section */}
        <ModernCard>
          <div className="p-6">
            <div className="flex items-center mb-6">
              <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                    onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <span className="text-gray-500">
                      {selectedFaq === index ? '−' : '+'}
                    </span>
                  </button>
                  {selectedFaq === index && (
                    <div className="px-4 pb-3 text-gray-600 border-t border-gray-200 bg-gray-50">
                      <p className="pt-3">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-8">
                <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No FAQs found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search terms or contact support directly.
                </p>
              </div>
            )}
          </div>
        </ModernCard>

        {/* Resources */}
        <ModernCard>
          <div className="p-6">
            <div className="flex items-center mb-6">
              <BookOpenIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Resources & Documentation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((resource) => (
                <div key={resource.title} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <resource.icon className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{resource.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{resource.type}</span>
                          <span>•</span>
                          <span>{resource.size}</span>
                        </div>
                        <ModernButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleResourceDownload(resource.title)}
                        >
                          {resource.type === 'Web' ? 'View' : 'Download'}
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ModernCard>

        {/* Contact Information */}
        <ModernCard>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <PhoneIcon className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium text-gray-900">Phone</h3>
                <p className="text-sm text-gray-500">(555) 123-4567</p>
                <p className="text-xs text-gray-400 mt-1">Mon-Fri 9AM-6PM EST</p>
              </div>
              <div className="text-center">
                <EnvelopeIcon className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium text-gray-900">Email</h3>
                <p className="text-sm text-gray-500">support@saasplatform.com</p>
                <p className="text-xs text-gray-400 mt-1">Response within 24 hours</p>
              </div>
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium text-gray-900">Live Chat</h3>
                <p className="text-sm text-gray-500">Available 24/7</p>
                <p className="text-xs text-gray-400 mt-1">Average response: 2 minutes</p>
              </div>
            </div>
          </div>
        </ModernCard>

        {/* System Status */}
        <ModernCard>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Services</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">File Storage</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Authentication</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </ModernCard>
      </div>
    </NewLayout>
  );
}