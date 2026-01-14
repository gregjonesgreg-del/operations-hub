import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES, routeBuilders } from '@/components/Routes';
import { base44 } from '@/api/base44Client';
import {
  Wrench,
  Calendar,
  Truck,
  ClipboardCheck,
  Car,
  BarChart3,
  Database,
  Menu,
  X,
  Search,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navSections = [
  {
    id: 'jobs',
    label: 'Work Orders',
    icon: Wrench,
    pages: [
      { route: ROUTES.JOBS, label: 'All Jobs' },
      { route: ROUTES.JOBS_BOARD, label: 'Jobs Board' },
      { route: ROUTES.JOBS_CREATE, label: 'Create Job' }
    ]
  },
  {
    id: 'ppm',
    label: 'PPM',
    icon: Calendar,
    pages: [
      { route: ROUTES.PPM_PLANS, label: 'Plans' },
      { route: ROUTES.PPM_INSTANCES, label: 'Instances' }
    ]
  },
  {
    id: 'fleet',
    label: 'Fleet',
    icon: Car,
    pages: [
      { route: ROUTES.FLEET_VEHICLES, label: 'Vehicles' },
      { route: ROUTES.FLEET_DEFECTS, label: 'Defects' },
      { route: ROUTES.FLEET_FUEL, label: 'Fuel Log' }
    ]
  },
  {
    id: 'hire',
    label: 'Hire / Rental',
    icon: Truck,
    pages: [
      { route: ROUTES.HIRE_ASSETS, label: 'Assets' },
      { route: ROUTES.HIRE_CALENDAR, label: 'Calendar' },
      { route: ROUTES.HIRE_CONTRACTS, label: 'Contracts' }
    ]
  },
  {
    id: 'dashboards',
    label: 'Dashboards',
    icon: BarChart3,
    pages: [
      { route: ROUTES.DASHBOARDS, label: 'Overview' }
    ]
  },
  {
    id: 'core',
    label: 'Core Data',
    icon: Database,
    pages: [
      { route: ROUTES.CUSTOMERS, label: 'Customers' },
      { route: ROUTES.SITES, label: 'Sites' },
      { route: ROUTES.ASSETS, label: 'Assets' },
      { route: ROUTES.CONTACTS, label: 'Contacts' }
    ]
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    pages: [
      { route: ROUTES.ADMIN_SETTINGS, label: 'Settings' }
    ]
  }
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    // Find active section based on current route path
    for (const section of navSections) {
      if (section.pages.some(p => location.pathname === p.route || location.pathname.startsWith(p.route + '/'))) {
        setActiveSection(section.id);
        break;
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left: Logo & Mobile Menu */}
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                      <Wrench className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-lg">CleanOps</span>
                  </div>
                </div>
                <nav className="p-2">
                  {navSections.map((section) => (
                    <div key={section.id} className="mb-2">
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {section.label}
                      </div>
                      {section.pages.map((page) => (
                        <Link
                          key={page.route}
                          to={page.route}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                            location.pathname === page.route || location.pathname.startsWith(page.route + '/')
                              ? "bg-indigo-50 text-indigo-700 font-medium"
                              : "text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          <section.icon className="h-4 w-4" />
                          {page.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <Link to={ROUTES.HOME} className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-sm">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl hidden sm:block text-slate-800">CleanOps</span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navSections.map((section) => (
              <DropdownMenu key={section.id}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "gap-1.5 text-sm font-medium",
                      activeSection === section.id
                        ? "text-indigo-700 bg-indigo-50"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <section.icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{section.label}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {section.pages.map((page) => (
                    <DropdownMenuItem key={page.route} asChild>
                      <Link to={page.route} className="cursor-pointer">
                        {page.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </nav>

          {/* Right: Search, Notifications, User */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-slate-500"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="text-slate-500 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user && (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.full_name || 'User'}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.ADMIN_SETTINGS} className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search Bar (Expandable) */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                     placeholder="Search customers, sites, equipment, jobs..."
                     className="pl-10 h-11"
                     autoFocus
                   />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}