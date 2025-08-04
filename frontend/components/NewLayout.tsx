import { ReactNode } from 'react';
import NewSidebar from './NewSidebar';
import Topbar from './Topbar';

interface LayoutProps {
  children: ReactNode;
}

export default function NewLayout({ children }: LayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      <NewSidebar />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden lg:ml-64">
        <Topbar />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}