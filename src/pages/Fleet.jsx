import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Car,
  ChevronRight,
  Fuel,
  Gauge,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

export default function Fleet() {
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Asset.filter({ assetType: 'Vehicle' })
  });

  const vehicles = useMemo(() => {
    return assets.filter(a => a.assetType === 'Vehicle');
  }, [assets]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading fleet..." />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Fleet"
        subtitle={`${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''}`}
      />

      <div className="px-4 sm:px-6 py-6">
        {vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No vehicles in fleet"
            description="Add vehicles from the Assets section with type 'Vehicle'"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(vehicle => (
              <Link key={vehicle.id} to={createPageUrl('AssetDetail') + `?id=${vehicle.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Car className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-sm text-slate-500">{vehicle.internalAssetId}</p>
                        {vehicle.regNumber && (
                          <Badge variant="outline" className="mt-1">{vehicle.regNumber}</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <StatusBadge status={vehicle.status} size="xs" />
                      <Badge variant="outline" className="text-xs">{vehicle.locationType}</Badge>
                    </div>

                    <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-sm">
                      {vehicle.fuelType && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Fuel className="h-3.5 w-3.5" />
                          {vehicle.fuelType}
                        </div>
                      )}
                      {vehicle.currentOdometer && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Gauge className="h-3.5 w-3.5" />
                          {vehicle.currentOdometer.toLocaleString()} mi
                        </div>
                      )}
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