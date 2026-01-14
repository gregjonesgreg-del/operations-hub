import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, CheckSquare, Truck, Package, AlertCircle } from 'lucide-react';

const dashboards = [
  {
    title: 'Work Orders',
    description: 'Job performance, completion rates, SLA compliance',
    icon: FileText,
    route: '/DashboardsJobs',
  },
  {
    title: 'PPM',
    description: 'Planned maintenance schedules, completion tracking',
    icon: CheckSquare,
    route: '/DashboardsPPM',
  },
  {
    title: 'Fleet',
    description: 'Vehicle status, defects, compliance, fuel costs',
    icon: Truck,
    route: '/DashboardsFleet',
  },
  {
    title: 'Hire / Rental',
    description: 'Asset utilization, contract status, revenue',
    icon: Package,
    route: '/DashboardsHire',
  },
  {
    title: 'Compliance & Ops',
    description: 'Safety incidents, internal tasks, audits',
    icon: AlertCircle,
    route: '/DashboardsOps',
  },
];

export default function Dashboards() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboards & Analytics</h1>
          <p className="text-lg text-slate-600">
            Overview of key metrics across all operations.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map(dash => {
            const Icon = dash.icon;
            return (
              <Link key={dash.route} to={dash.route}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <Icon className="h-8 w-8 text-indigo-600 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {dash.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {dash.description}
                    </p>
                    <Button size="sm" variant="outline">View Dashboard</Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}