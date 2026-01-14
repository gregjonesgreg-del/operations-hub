import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ROUTES, routeBuilders } from '@/components/Routes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Fuel } from 'lucide-react';

export default function FleetFuel() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['fuelTransactions'],
    queryFn: () => base44.entities.FuelTransaction.list()
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  const sorted = [...transactions].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
  const totalSpend = transactions.reduce((sum, t) => sum + (t.totalCost || 0), 0);

  return (
    <div className="pb-8">
      <PageHeader
        title="Fuel Transactions"
        subtitle={`${transactions.length} recorded • £${totalSpend.toFixed(2)} total`}
      />

      <div className="px-4 sm:px-6 py-6">
        {transactions.length === 0 ? (
          <EmptyState
            icon={Fuel}
            title="No fuel transactions"
            description="Fuel will appear here as drivers log fill-ups"
          />
        ) : (
          <div className="space-y-3">
            {sorted.map(fuel => (
              <Link key={fuel.id} to={routeBuilders.fuelDetail(fuel.id)}>
                <Card className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{fuel.fuelVolume}L @ {fuel.supplier}</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(fuel.dateTime), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="font-medium">£{fuel.totalCost.toFixed(2)}</span>
                        <Badge variant="outline" className="text-xs">
                          {fuel.reviewStatus}
                        </Badge>
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