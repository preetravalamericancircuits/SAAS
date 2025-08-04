import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="flex h-screen bg-light dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 ml-60 lg:ml-60 overflow-y-auto bg-light dark:bg-gray-900 transition-all duration-300">
          {children}
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
}