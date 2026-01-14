import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ROUTES, routeBuilders } from '@/components/Routes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { AlertTriangle } from 'lucide-react';

export default function FleetDefects() {
  const { data: defects = [], isLoading } = useQuery({
    queryKey: ['vehicleDefects'],
    queryFn: () => base44.entities.VehicleDefect.list()
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  const open = defects.filter(d => !['Fixed', 'Closed'].includes(d.status));
  const sorted = [...defects].sort((a, b) => {
    const order = { 'Critical': 0, 'High': 1, 'Med': 2, 'Low': 3 };
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
  });

  return (
    <div className="pb-8">
      <PageHeader
        title="Vehicle Defects"
        subtitle={`${open.length} open • ${defects.length} total`}
      />

      <div className="px-4 sm:px-6 py-6">
        {defects.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No defects recorded"
            description="All vehicles are in good condition"
          />
        ) : (
          <div className="space-y-3">
            {sorted.map(defect => (
              <Link key={defect.id} to={routeBuilders.defectDetail(defect.id)}>
                <Card className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{defect.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Reported: {new Date(defect.reportedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={
                          defect.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                          defect.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                          defect.severity === 'Med' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }>
                          {defect.severity}
                        </Badge>
                        <Badge variant="outline">{defect.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}