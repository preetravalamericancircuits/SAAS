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
  XMarkIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Simulations', href: '/simulations', icon: BeakerIcon },
  { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
  { name: 'User Management', href: '/users', icon: UsersIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function NewSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-primary">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  router.pathname === item.href
                    ? 'bg-secondary text-white'
                    : 'text-gray-300 hover:bg-secondary hover:text-white'
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
        <div className="flex flex-col flex-grow bg-primary pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
          </div>
          <nav className="mt-8 flex-1 flex flex-col divide-y divide-blue-800 overflow-y-auto">
            <div className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    router.pathname === item.href
                      ? 'bg-secondary text-white'
                      : 'text-gray-300 hover:bg-secondary hover:text-white'
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
          className="fixed top-4 left-4 z-40 bg-primary text-white p-2 rounded-md"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
    </>
  );
}