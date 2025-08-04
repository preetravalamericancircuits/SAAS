import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, User, LogOut, ChevronRight } from 'lucide-react';

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getBreadcrumbs = () => {
    const path = router.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [{ name: 'Home', href: '/dashboard' }];
    
    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const name = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ name, href });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumbs */}
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
                <span className={`text-sm ${
                  index === breadcrumbs.length - 1 
                    ? 'text-blue-900 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                  {crumb.name}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        {/* Right side - Notifications and User */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Notifications</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">System Update</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">New user registered</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* User Avatar Dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-blue-600">{user?.role}</p>
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`flex items-center w-full px-4 py-3 text-sm text-gray-700 ${
                        active ? 'bg-gray-100' : ''
                      }`}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`flex items-center w-full px-4 py-3 text-sm text-gray-700 ${
                        active ? 'bg-gray-100' : ''
                      }`}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
}