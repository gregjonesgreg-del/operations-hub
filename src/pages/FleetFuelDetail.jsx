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
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

export default function FleetFuelDetail() {
  const [searchParams] = useSearchParams();
  const fuelId = searchParams.get('id');

  const { data: fuel, isLoading } = useQuery({
    queryKey: ['fuel', fuelId],
    queryFn: () => base44.entities.FuelTransaction.filter({ id: fuelId }).then(r => r[0]),
    enabled: !!fuelId
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  if (!fuel) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Fuel transaction not found"
        description="The transaction record doesn't exist"
      />
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Fuel Transaction"
        backLink={ROUTES.FLEET_FUEL}
        backLabel="Fuel"
      >
        <Badge variant="outline">{fuel.reviewStatus}</Badge>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Date</span>
              <span className="text-slate-900">{format(new Date(fuel.dateTime), 'MMM d, yyyy HH:mm')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Volume</span>
              <span className="text-slate-900">{fuel.fuelVolume} litres</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Cost</span>
              <span className="text-slate-900 font-medium">£{fuel.totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Supplier</span>
              <span className="text-slate-900">{fuel.supplier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Odometer</span>
              <span className="text-slate-900">{fuel.odometerAtFill?.toLocaleString()} miles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Payment Method</span>
              <span className="text-slate-900">{fuel.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Status</span>
              <Badge variant="outline">{fuel.reviewStatus}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}