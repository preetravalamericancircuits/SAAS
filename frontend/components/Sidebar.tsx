import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  UserCircleIcon, 
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  CogIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  LinkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: router.pathname === '/dashboard' }
    ];

    if (user?.role === 'SuperUser') {
      return [
        ...baseItems,
        { name: 'User Management', href: '/dashboard', icon: UsersIcon, current: router.pathname === '/dashboard' },
        { name: 'Secure Files', href: '/secure-files', icon: DocumentTextIcon, current: router.pathname === '/secure-files' },
        { name: 'Roles & Permissions', href: '/roles', icon: ShieldCheckIcon, current: router.pathname === '/roles' },
        { name: 'System Settings', href: '/settings', icon: CogIcon, current: router.pathname === '/settings' },
        { name: 'Audit Logs', href: '/audit', icon: ClipboardDocumentListIcon, current: router.pathname === '/audit' },
        { name: 'Internal Links', href: '/internal', icon: LinkIcon, current: router.pathname === '/internal' }
      ];
    }

    if (user?.role === 'ITRA') {
      return [
        ...baseItems,
        { name: 'Secure Files', href: '/secure-files', icon: DocumentTextIcon, current: router.pathname === '/secure-files' },
        { name: 'Audit Reports', href: '/audit', icon: ClipboardDocumentListIcon, current: router.pathname === '/audit' }
      ];
    }

    if (user?.role === 'Admin') {
      return [
        ...baseItems,
        { name: 'User Management', href: '/dashboard', icon: UsersIcon, current: router.pathname === '/dashboard' },
        { name: 'System Settings', href: '/settings', icon: CogIcon, current: router.pathname === '/settings' },
        { name: 'Internal Links', href: '/internal', icon: LinkIcon, current: router.pathname === '/internal' }
      ];
    }

    if (user?.role === 'Manager') {
      return [
        ...baseItems,
        { name: 'Team Management', href: '/dashboard', icon: UsersIcon, current: router.pathname === '/dashboard' }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SuperUser': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'Manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ITRA': return 'bg-green-100 text-green-800 border-green-200';
      case 'Operator': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'User': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-blue-950">
          <Link href="/dashboard" className="text-xl font-bold text-white">
            🔷 ACI Dashboard
          </Link>
        </div>

        {/* User Profile */}
        <div className="flex flex-col items-center px-4 py-6 border-b border-blue-700">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-3">
            <UserCircleIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-white font-medium">{user?.username}</h3>
          <p className="text-blue-200 text-sm">{user?.email}</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-2 ${getRoleBadgeColor(user?.role || '')}`}>
            {user?.role}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                item.current
                  ? 'bg-blue-700 text-white shadow-lg'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="px-4 py-4 border-t border-blue-700">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center w-full px-4 py-2 text-sm font-medium text-blue-100 rounded-lg hover:bg-blue-700 hover:text-white transition-colors">
              <CogIcon className="w-5 h-5 mr-3" />
              Account
              <ChevronDownIcon className="w-4 h-4 ml-auto" />
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
              <Menu.Items className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="#"
                        className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                      >
                        Profile Settings
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        Sign Out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
}