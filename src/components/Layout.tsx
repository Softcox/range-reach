import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  Menu
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, adminOnly: false },
    { name: 'Transactions', href: '/transactions', icon: FileText, adminOnly: false },
    { name: 'Admin Panel', href: '/admin', icon: Settings, adminOnly: true },
  ];

  const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin);

  const NavItems = () => (
    <>
      {filteredNavigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-card border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="ml-2 text-xl font-bold">Inventory</h1>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              <NavItems />
            </nav>
            <div className="flex-shrink-0 flex border-t border-border p-4">
              <div className="flex items-center w-full">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isAdmin ? 'Admin' : 'User'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="ml-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden md:hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-card shadow border-b">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="px-4 border-r border-border text-muted-foreground focus:outline-none md:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center flex-shrink-0 px-4 py-5">
                  <Package className="h-8 w-8 text-primary" />
                  <h1 className="ml-2 text-xl font-bold">Inventory</h1>
                </div>
                <div className="flex-grow flex flex-col">
                  <nav className="flex-1 px-2 space-y-1">
                    <NavItems />
                  </nav>
                  <div className="flex-shrink-0 flex border-t border-border p-4">
                    <div className="flex items-center w-full">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isAdmin ? 'Admin' : 'User'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={signOut}
                        className="ml-2"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1 px-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Inventory Management</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="md:hidden"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;