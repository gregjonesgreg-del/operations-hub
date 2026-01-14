import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { CheckCircle } from 'lucide-react';

export default function FleetChecks() {
  const { data: checks = [], isLoading } = useQuery({
    queryKey: ['vehicleChecks'],
    queryFn: () => base44.entities.VehicleCheck.list()
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  const sorted = [...checks].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="pb-8">
      <PageHeader
        title="Vehicle Checks"
        subtitle={`${checks.length} checks recorded`}
      />

      <div className="px-4 sm:px-6 py-6">
        {checks.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="No vehicle checks"
            description="Drivers will record checks here"
          />
        ) : (
          <div className="space-y-3">
            {sorted.map(check => (
              <Card key={check.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Check recorded</p>
                      <p className="text-sm text-slate-500">
                        {format(new Date(check.date), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    <Badge variant={check.status === 'Passed' ? 'default' : check.status === 'Failed' ? 'destructive' : 'outline'}>
                      {check.status}
                    </Badge>
                  </div>
                  {check.defectsFound && (
                    <p className="text-xs text-orange-600 mt-2">⚠️ Defects found</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}