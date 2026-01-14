import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { ROUTES } from '@/components/Routes';
import { AlertTriangle } from 'lucide-react';

export default function FleetDefectDetail() {
  const [searchParams] = useSearchParams();
  const defectId = searchParams.get('id');

  const { data: defect, isLoading } = useQuery({
    queryKey: ['defect', defectId],
    queryFn: () => base44.entities.VehicleDefect.filter({ id: defectId }).then(r => r[0]),
    enabled: !!defectId
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  if (!defect) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Defect not found"
        description="The defect record doesn't exist"
      />
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Vehicle Defect"
        backLink={ROUTES.FLEET_DEFECTS}
        backLabel="Defects"
      >
        <Badge className={
          defect.severity === 'Critical' ? 'bg-red-100 text-red-700' :
          defect.severity === 'High' ? 'bg-orange-100 text-orange-700' :
          defect.severity === 'Med' ? 'bg-yellow-100 text-yellow-700' :
          'bg-blue-100 text-blue-700'
        }>
          {defect.severity}
        </Badge>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Status</span>
              <Badge variant="outline">{defect.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Description</span>
              <span className="text-slate-900 max-w-xs text-right">{defect.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Reported</span>
              <span className="text-slate-900">{new Date(defect.reportedAt).toLocaleDateString()}</span>
            </div>
            {defect.resolutionNotes && (
              <div className="flex justify-between">
                <span className="text-slate-600">Resolution</span>
                <span className="text-slate-900">{defect.resolutionNotes}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}