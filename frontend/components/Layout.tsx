import Navigation from './Navigation';
import TopNavbar from './TopNavbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Navigation />
      </div>
      <div className="lg:hidden">
        <Navigation />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Navbar */}
        <div className="pt-16 lg:pt-0">
          <TopNavbar />
        </div>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}