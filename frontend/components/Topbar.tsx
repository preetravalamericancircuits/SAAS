import { useState } from 'react';
import { useRouter } from 'next/router';
import { ChevronRightIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const routeNames: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/analytics': 'Analytics',
  '/simulations': 'Simulations',
  '/reports': 'Reports',
  '/users': 'User Management',
  '/settings': 'Settings',
};

export default function Topbar() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getBreadcrumbs = () => {
    const pathSegments = router.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', href: '/' }];
    
    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const name = routeNames[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ name, href: currentPath });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.href}>
                <div className="flex items-center">
                  {index > 0 && <ChevronRightIcon className="h-5 w-5 text-gray-400 mr-4" />}
                  <a
                    href={crumb.href}
                    className={`text-sm font-medium ${
                      index === breadcrumbs.length - 1
                        ? 'text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {crumb.name}
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Right side - Notifications and User */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-primary-600 relative transition-colors duration-200"
            >
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <strong>Notifications</strong>
                  </div>
                  <div className="px-4 py-2 text-sm text-gray-600">
                    New simulation completed
                  </div>
                  <div className="px-4 py-2 text-sm text-gray-600">
                    System maintenance scheduled
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:bg-gray-50 p-1 transition-colors duration-200"
            >
              <UserCircleIcon className="h-8 w-8 text-primary-600" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile Settings
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Account
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Logout
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}