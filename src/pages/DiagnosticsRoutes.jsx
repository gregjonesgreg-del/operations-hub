import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ROUTES, routeBuilders } from '@/components/Routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ExternalLink, CheckCircle, AlertCircle, AlertTriangle, Search, Lock } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

const NAV_SECTIONS = [
  {
    id: 'jobs',
    label: 'Work Orders',
    pages: [
      { route: ROUTES.JOBS, label: 'All Jobs' },
      { route: ROUTES.JOBS_BOARD, label: 'Jobs Board' },
      { route: ROUTES.JOBS_CREATE, label: 'Create Job' }
    ]
  },
  {
    id: 'ppm',
    label: 'PPM',
    pages: [
      { route: ROUTES.PPM_PLANS, label: 'Plans' },
      { route: ROUTES.PPM_INSTANCES, label: 'Instances' }
    ]
  },
  {
    id: 'fleet',
    label: 'Fleet',
    pages: [
      { route: ROUTES.FLEET_VEHICLES, label: 'Vehicles' },
      { route: ROUTES.FLEET_DEFECTS, label: 'Defects' },
      { route: ROUTES.FLEET_FUEL, label: 'Fuel Log' }
    ]
  },
  {
    id: 'hire',
    label: 'Hire / Rental',
    pages: [
      { route: ROUTES.HIRE_ASSETS, label: 'Assets' },
      { route: ROUTES.HIRE_CALENDAR, label: 'Calendar' },
      { route: ROUTES.HIRE_CONTRACTS, label: 'Contracts' }
    ]
  },
  {
    id: 'dashboards',
    label: 'Dashboards',
    pages: [
      { route: ROUTES.DASHBOARDS, label: 'Overview' }
    ]
  },
  {
    id: 'core',
    label: 'Core Data',
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
    pages: [
      { route: ROUTES.ADMIN_SETTINGS, label: 'Settings' }
    ]
  }
];

export default function DiagnosticsRoutes() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: firstJob } = useQuery({
    queryKey: ['firstJob'],
    queryFn: () => base44.entities.Job.list(null, 1).then(r => r[0])
  });

  const { data: firstAsset } = useQuery({
    queryKey: ['firstAsset'],
    queryFn: () => base44.entities.Asset.list(null, 1).then(r => r[0])
  });

  const { data: firstCustomer } = useQuery({
    queryKey: ['firstCustomer'],
    queryFn: () => base44.entities.Customer.list(null, 1).then(r => r[0])
  });

  const { data: firstSite } = useQuery({
    queryKey: ['firstSite'],
    queryFn: () => base44.entities.Site.list(null, 1).then(r => r[0])
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Check if user has access (Admin or Office/Dispatch)
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Checking access..." />
      </div>
    );
  }

  const hasAccess = user && (user.role === 'admin' || user.role === 'office');
  
  if (!hasAccess) {
    return (
      <div className="pb-8">
        <PageHeader title="Route Diagnostics" subtitle="Admin + Office/Dispatch only" />
        <div className="px-4 sm:px-6 py-6">
          <EmptyState
            icon={Lock}
            title="Access Denied"
            description="Only Admin and Office/Dispatch users can view route diagnostics."
          />
        </div>
      </div>
    );
  }

  // Build registered routes list
  const registeredRoutes = Object.entries(ROUTES)
    .map(([key, route]) => ({
      key,
      route,
      isDetailRoute: route.includes(':'),
      isDynamic: /:\w+/.test(route),
      section: getSection(key),
    }))
    .sort((a, b) => a.section.localeCompare(b.section));

  const registeredRoutesMap = new Set(registeredRoutes.map(r => r.route));
  const baseRoutes = new Set(registeredRoutes.map(r => r.route.split(':')[0].replace(/\/$/, '')));

  // Build navigation items from config
  const navItems = [];
  NAV_SECTIONS.forEach(section => {
    section.pages.forEach(page => {
      navItems.push({
        label: page.label,
        section: section.label,
        route: page.route,
        hasRelativePath: !page.route.startsWith('/'),
        isDynamic: /:\w+|\/\[.+\]/.test(page.route),
        isRegistered: registeredRoutesMap.has(page.route) || baseRoutes.has(page.route.split(':')[0].replace(/\/$/, ''))
      });
    });
  });

  // Analyze issues
  const relativePathErrors = navItems.filter(n => n.hasRelativePath);
  const menuDynamicRoutes = navItems.filter(n => n.isDynamic && NAV_SECTIONS.flatMap(s => s.pages).some(p => p.label === n.label));
  const unregisteredTargets = navItems.filter(n => !n.isRegistered);

  const stats = {
    registeredCount: registeredRoutes.length,
    navCount: navItems.length,
    relativePathErrorCount: relativePathErrors.length,
    unregisteredCount: unregisteredTargets.length,
    menuDynamicCount: menuDynamicRoutes.length,
  };

  // Filter by search
  const filteredRoutes = registeredRoutes.filter(r =>
    r.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNavItems = navItems.filter(n =>
    n.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-8">
      <PageHeader title="Route Diagnostics" subtitle="App routing health check and audit" />

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">{stats.registeredCount}</p>
                <p className="text-xs text-slate-500 mt-1">Registered Routes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{stats.navCount}</p>
                <p className="text-xs text-slate-500 mt-1">Nav Items</p>
              </div>
            </CardContent>
          </Card>

          {stats.relativePathErrorCount > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{stats.relativePathErrorCount}</p>
                  <p className="text-xs text-red-700 mt-1">Missing "/"</p>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.menuDynamicCount > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-600">{stats.menuDynamicCount}</p>
                  <p className="text-xs text-amber-700 mt-1">Menu Dynamic Routes</p>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.unregisteredCount > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">{stats.unregisteredCount}</p>
                  <p className="text-xs text-orange-700 mt-1">Not Registered</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Registered Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-indigo-600" />
              Registered Routes ({registeredRoutes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Route</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Key</th>
                    <th className="text-center py-2 px-3 font-semibold text-slate-600">Type</th>
                    <th className="text-right py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoutes.map(r => (
                    <tr key={r.key} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-xs text-slate-700">{r.route}</td>
                      <td className="py-2 px-3 text-xs text-slate-500">{r.key}</td>
                      <td className="py-2 px-3 text-center">
                        {r.isDynamic ? (
                          <Badge variant="outline">Detail</Badge>
                        ) : (
                          <Badge variant="secondary">List</Badge>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {!r.isDynamic && (
                          <Link to={r.route}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Menu Navigation Items ({navItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Label</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Section</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Route</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Flags</th>
                    <th className="text-right py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNavItems.map((n, idx) => (
                    <tr key={`${n.section}-${n.label}-${idx}`} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-700">{n.label}</td>
                      <td className="py-2 px-3 text-xs text-slate-500">{n.section}</td>
                      <td className="py-2 px-3 font-mono text-xs text-slate-600">{n.route}</td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1 flex-wrap">
                          {n.hasRelativePath && (
                            <Badge variant="destructive" className="gap-1 text-xs">
                              <AlertTriangle className="h-3 w-3" />
                              No /
                            </Badge>
                          )}
                          {n.isDynamic && (
                            <Badge variant="outline" className="gap-1 text-xs border-amber-300 bg-amber-50 text-amber-700">
                              <AlertTriangle className="h-3 w-3" />
                              Dynamic
                            </Badge>
                          )}
                          {!n.isRegistered && (
                            <Badge variant="outline" className="gap-1 text-xs border-orange-300 bg-orange-50 text-orange-700">
                              <AlertCircle className="h-3 w-3" />
                              Unreg
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {!n.isDynamic && (
                          <Link to={n.route}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {stats.relativePathErrorCount === 0 && stats.menuDynamicCount === 0 && stats.unregisteredCount === 0 ? (
              <p className="text-emerald-700 bg-emerald-50 p-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                ✅ All navigation items are properly configured!
              </p>
            ) : (
              <>
                {stats.relativePathErrorCount > 0 && (
                  <p className="text-red-700 bg-red-50 p-3 rounded-lg">
                    ⚠️ <strong>{stats.relativePathErrorCount}</strong> nav item(s) use relative paths (missing leading "/").
                  </p>
                )}
                {stats.menuDynamicCount > 0 && (
                  <p className="text-amber-700 bg-amber-50 p-3 rounded-lg">
                    ⚠️ <strong>{stats.menuDynamicCount}</strong> menu item(s) point to dynamic routes (/:id). Menu should only link to static list pages.
                  </p>
                )}
                {stats.unregisteredCount > 0 && (
                  <p className="text-orange-700 bg-orange-50 p-3 rounded-lg">
                    ⚠️ <strong>{stats.unregisteredCount}</strong> nav target(s) are not in the registered routes list.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Smoke Test: Live List→Detail Navigation */}
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Smoke Test: Click to verify detail pages load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-emerald-800 mb-4">
              These buttons navigate to actual first records using routeBuilders. If they work, list→detail routing is fixed.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {firstJob && (
                <Link to={routeBuilders.jobDetail(firstJob.id)}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Open First Job ({firstJob.jobNumber || 'Draft'})
                  </Button>
                </Link>
              )}
              {firstAsset && (
                <Link to={routeBuilders.assetDetail(firstAsset.id)}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Open First Asset ({firstAsset.internalAssetId})
                  </Button>
                </Link>
              )}
              {firstCustomer && (
                <Link to={routeBuilders.customerDetail(firstCustomer.id)}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Open First Customer ({firstCustomer.name})
                  </Button>
                </Link>
              )}
              {firstSite && (
                <Link to={routeBuilders.siteDetail(firstSite.id)}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Open First Site ({firstSite.siteName})
                  </Button>
                </Link>
              )}
              {!firstJob && !firstAsset && !firstCustomer && !firstSite && (
                <p className="text-sm text-emerald-700 col-span-2">No records found to test.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Deep Link Builder Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-indigo-600" />
              Route Builder Examples (sample ID: "test-id-123")
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              How route builders generate absolute paths. All use URL segments (/:id), not query params.
            </p>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-mono text-slate-500">jobDetail("test-id-123")</p>
                  <p className="font-mono text-sm mt-1 text-slate-700">/jobs/test-id-123</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-mono text-slate-500">ppmInstanceDetail("test-id-123")</p>
                  <p className="font-mono text-sm mt-1 text-slate-700">/ppm/instances/test-id-123</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-mono text-slate-500">vehicleDetail("test-id-123")</p>
                  <p className="font-mono text-sm mt-1 text-slate-700">/fleet/vehicles/test-id-123</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-mono text-slate-500">hireContractDetail("test-id-123")</p>
                  <p className="font-mono text-sm mt-1 text-slate-700">/hire/contracts/test-id-123</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-mono text-slate-500">customerDetail("test-id-123")</p>
                  <p className="font-mono text-sm mt-1 text-slate-700">/core/customers/test-id-123</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-mono text-slate-500">defectDetail("test-id-123")</p>
                  <p className="font-mono text-sm mt-1 text-slate-700">/fleet/defects/test-id-123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getSection(key) {
  if (key.includes('JOB')) return 'Work Orders';
  if (key.includes('PPM')) return 'PPM';
  if (key.includes('OPS') || key.includes('INCIDENT')) return 'Internal Ops';
  if (key.includes('FLEET') || key.includes('VEHICLE') || key.includes('DEFECT') || key.includes('FUEL')) return 'Fleet';
  if (key.includes('HIRE')) return 'Hire / Rental';
  if (key.includes('DASHBOARD')) return 'Dashboards';
  if (key.includes('CUSTOMER') || key.includes('SITE') || key.includes('CONTACT') || key.includes('ASSET')) return 'Core Data';
  if (key.includes('ADMIN') || key.includes('DIAGNOSTIC')) return 'Admin & Special';
  return 'Other';
}