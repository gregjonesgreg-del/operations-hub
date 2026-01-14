import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/components/Routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

export default function DiagnosticsRoutes() {
  const allRoutes = Object.entries(ROUTES)
    .map(([key, route]) => ({
      key,
      route,
      isDetailRoute: route.includes(':'),
      section: getSection(key),
    }))
    .sort((a, b) => a.section.localeCompare(b.section));

  const sections = [...new Set(allRoutes.map(r => r.section))];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Route Diagnostics</h1>
          <p className="text-slate-600">
            Canonical route registry for debugging and preventing broken links.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map(section => {
            const routes = allRoutes.filter(r => r.section === section);
            return (
              <Card key={section}>
                <CardHeader>
                  <CardTitle className="text-lg">{section}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2 px-3 font-semibold text-slate-600">Key</th>
                          <th className="text-left py-2 px-3 font-semibold text-slate-600">Route</th>
                          <th className="text-center py-2 px-3 font-semibold text-slate-600">Type</th>
                          <th className="text-right py-2 px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {routes.map(r => (
                          <tr key={r.key} className="border-b hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-xs text-slate-700">{r.key}</td>
                            <td className="py-2 px-3 font-mono text-xs text-slate-600">{r.route}</td>
                            <td className="py-2 px-3 text-center">
                              {r.isDetailRoute ? (
                                <Badge variant="outline">Detail</Badge>
                              ) : (
                                <Badge variant="secondary">List</Badge>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {!r.isDetailRoute && (
                                <Link to={r.route}>
                                  <Button size="sm" variant="ghost">
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
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Import from <code className="bg-white px-2 py-1 rounded">config/routes.js</code> instead of hardcoding routes.
          </p>
        </div>
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