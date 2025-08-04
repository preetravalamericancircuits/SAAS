import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Globe, 
  Settings, 
  User,
  LogOut
} from 'lucide-react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Websites', href: '/websites', icon: Globe },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];

  return (
    <div className="h-screen w-64 bg-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="text-xl font-bold text-blue-900">
          SAAS Dashboard
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center w-full px-4 py-3 text-left rounded-lg hover:bg-gray-100">
            <User className="w-8 h-8 text-gray-400 mr-3" />
            <div className="flex-1">
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
            <Menu.Items className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`flex items-center w-full px-4 py-3 text-sm text-gray-700 rounded-lg ${
                      active ? 'bg-gray-100' : ''
                    }`}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
} 