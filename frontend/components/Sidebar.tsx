import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircleIcon, 
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  CogIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  LinkIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 60 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40 flex flex-col"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/dashboard" className="text-lg font-bold text-gray-900 dark:text-white">
                ACI Dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircleIcon className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
              item.current
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${
              item.current ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
            }`} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-medium overflow-hidden whitespace-nowrap"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'light' ? (
            <MoonIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <SunIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium overflow-hidden whitespace-nowrap"
              >
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium overflow-hidden whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}