import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', current: router.pathname === '/dashboard' }
    ];

    // SuperUser gets all navigation items
    if (user?.role === 'SuperUser') {
      return [
        ...baseItems,
        { name: 'User Management', href: '/dashboard', current: router.pathname === '/dashboard' },
        { name: 'Secure Files', href: '/secure-files', current: router.pathname === '/secure-files' },
        { name: 'Roles & Permissions', href: '#', current: false },
        { name: 'System Settings', href: '#', current: false },
        { name: 'Audit Logs', href: '#', current: false }
      ];
    }

    // ITRA gets secure files access
    if (user?.role === 'ITRA') {
      return [
        ...baseItems,
        { name: 'Secure Files', href: '/secure-files', current: router.pathname === '/secure-files' },
        { name: 'Audit Reports', href: '#', current: false },
        { name: 'Compliance', href: '#', current: false }
      ];
    }

    // Admin gets most items
    if (user?.role === 'Admin') {
      return [
        ...baseItems,
        { name: 'User Management', href: '/dashboard', current: router.pathname === '/dashboard' },
        { name: 'Reports', href: '#', current: false }
      ];
    }

    // Manager gets some items
    if (user?.role === 'Manager') {
      return [
        ...baseItems,
        { name: 'Team Management', href: '#', current: false },
        { name: 'Reports', href: '#', current: false }
      ];
    }

    // Regular users get basic items
    return [
      ...baseItems,
      { name: 'My Profile', href: '#', current: false },
      { name: 'Settings', href: '#', current: false }
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900 hover:text-primary-600">
                ACI Dashboard
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Role Badge */}
            <div className="mr-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user?.role === 'SuperUser' ? 'bg-purple-100 text-purple-800' :
                user?.role === 'Admin' ? 'bg-red-100 text-red-800' :
                user?.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                user?.role === 'ITRA' ? 'bg-green-100 text-green-800' :
                user?.role === 'User' ? 'bg-gray-100 text-gray-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user?.role}
              </span>
            </div>

            {/* User Menu */}
            <Menu as="div" className="ml-3 relative">
              <div>
                <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <span className="sr-only">Open user menu</span>
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <Menu.Item>
                    {({ active }) => (
                      <div className="px-4 py-2 text-sm text-gray-700">
                        <p className="font-medium">{user?.username}</p>
                        <p className="text-gray-500">{user?.email}</p>
                        <p className="text-xs text-gray-400 mt-1">Role: {user?.role}</p>
                      </div>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="#"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block px-4 py-2 text-sm text-gray-700`}
                      >
                        Your Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="#"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block px-4 py-2 text-sm text-gray-700`}
                      >
                        Settings
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                item.current
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 