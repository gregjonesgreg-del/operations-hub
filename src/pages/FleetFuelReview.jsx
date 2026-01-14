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

export default function FleetFuelReview() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['fuelTransactions'],
    queryFn: () => base44.entities.FuelTransaction.list()
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  const needsReview = transactions.filter(t => t.reviewStatus === 'Submitted' || t.reviewStatus === 'Flagged');
  const sorted = [...needsReview].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

  return (
    <div className="pb-8">
      <PageHeader
        title="Fuel Review Queue"
        subtitle={`${needsReview.length} awaiting review`}
      />

      <div className="px-4 sm:px-6 py-6">
        {needsReview.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="All caught up"
            description="No fuel transactions awaiting review"
          />
        ) : (
          <div className="space-y-3">
            {sorted.map(fuel => (
              <Card key={fuel.id} className={fuel.reviewStatus === 'Flagged' ? 'border-orange-300 bg-orange-50/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {fuel.fuelVolume}L @ £{fuel.totalCost.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(fuel.dateTime), 'MMM d, yyyy')} - {fuel.supplier}
                      </p>
                    </div>
                    <Badge variant={fuel.reviewStatus === 'Flagged' ? 'destructive' : 'secondary'}>
                      {fuel.reviewStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}