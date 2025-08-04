import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import { Globe, Plus, ExternalLink, Trash2 } from 'lucide-react';

interface UrlFormData {
  url: string;
}

interface SavedUrl {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}

export default function WebsitesPage() {
  const [currentUrl, setCurrentUrl] = useState('');
  const [savedUrls, setSavedUrls] = useState<SavedUrl[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UrlFormData>();

  useEffect(() => {
    const saved = localStorage.getItem('savedUrls');
    if (saved) {
      setSavedUrls(JSON.parse(saved));
    }
  }, []);

  const saveToLocalStorage = (urls: SavedUrl[]) => {
    localStorage.setItem('savedUrls', JSON.stringify(urls));
    setSavedUrls(urls);
  };

  const addUrl = (url: string) => {
    const newUrl: SavedUrl = {
      id: Date.now().toString(),
      url,
      title: new URL(url).hostname,
      timestamp: Date.now()
    };
    const updatedUrls = [newUrl, ...savedUrls];
    saveToLocalStorage(updatedUrls);
  };

  const removeUrl = (id: string) => {
    const updatedUrls = savedUrls.filter(url => url.id !== id);
    saveToLocalStorage(updatedUrls);
  };

  const onSubmit = (data: UrlFormData) => {
    setIsLoading(true);
    let url = data.url;
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      new URL(url);
      setCurrentUrl(url);
      addUrl(url);
      reset();
    } catch {
      alert('Please enter a valid URL');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUrl = (url: string) => {
    setCurrentUrl(url);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Website Viewer</h1>
          <p className="text-gray-600 mt-2">View external websites in an embedded frame</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* URL Input and Saved URLs */}
          <div className="lg:col-span-1 space-y-6">
            {/* URL Input Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Add Website</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('url', { required: 'URL is required' })}
                      type="text"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example.com"
                    />
                  </div>
                  {errors.url && (
                    <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isLoading ? 'Loading...' : 'Load Website'}
                </button>
              </form>
            </div>

            {/* Saved URLs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Saved Websites</h3>
              <div className="space-y-2">
                {savedUrls.length === 0 ? (
                  <p className="text-sm text-gray-500">No saved websites</p>
                ) : (
                  savedUrls.map((savedUrl) => (
                    <div
                      key={savedUrl.id}
                      className="flex items-center justify-between p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <button
                        onClick={() => loadUrl(savedUrl.url)}
                        className="flex items-center flex-1 text-left"
                      >
                        <Globe className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {savedUrl.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {savedUrl.url}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => window.open(savedUrl.url, '_blank')}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeUrl(savedUrl.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Website Viewer */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {currentUrl ? (
                <div className="h-full">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 truncate">{currentUrl}</span>
                    </div>
                    <button
                      onClick={() => window.open(currentUrl, '_blank')}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open in new tab
                    </button>
                  </div>
                  <iframe
                    src={currentUrl}
                    className="w-full h-[calc(100vh-200px)]"
                    title="Website Viewer"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                </div>
              ) : (
                <div className="h-[calc(100vh-200px)] flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No website loaded</h3>
                    <p className="text-gray-500">Enter a URL to view a website</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}