import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  HomeIcon, 
  ChartBarIcon, 
  CogIcon, 
  DocumentChartBarIcon,
  UsersIcon,
  BeakerIcon,
  Bars3Icon,
  XMarkIcon,
  WrenchScrewdriverIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

const getNavigation = (userRole: string) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Simulations', href: '/simulations', icon: BeakerIcon },
    { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
    { name: 'Quick Shortcuts', href: '/shortcuts', icon: GlobeAltIcon },
    { name: 'My Profile', href: '/profile', icon: UserCircleIcon },
  ];

  // Add role-specific navigation items
  if (['SuperUser', 'Admin'].includes(userRole)) {
    baseNavigation.splice(-2, 0, { name: 'User Management', href: '/users', icon: UsersIcon });
  }

  if (['SuperUser', 'ITRA', 'Admin'].includes(userRole)) {
    baseNavigation.splice(-2, 0, { name: 'Secure Files', href: '/secure-files', icon: LockClosedIcon });
  }

  baseNavigation.push(
    { name: 'Settings', href: '/settings', icon: CogIcon },
    { name: 'Help & Support', href: '/help', icon: QuestionMarkCircleIcon }
  );

  return baseNavigation;
};

export default function NewSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  const navigation = getNavigation(user?.role || 'User');

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-white">SAAS Platform</h1>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  router.pathname === item.href
                    ? 'bg-blue-600 text-white shadow-lg border-l-4 border-blue-300'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-blue-900 to-blue-800 pt-5 pb-4 overflow-y-auto shadow-xl">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">S</span>
              </div>
              <h1 className="text-xl font-bold text-white">SAAS Platform</h1>
            </div>
          </div>
          <nav className="mt-8 flex-1 flex flex-col overflow-y-auto">
            <div className="px-2 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    router.pathname === item.href
                      ? 'bg-blue-600 text-white shadow-lg border-l-4 border-blue-300'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 bg-blue-800 text-white p-2 rounded-md shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
    </>
  );
}