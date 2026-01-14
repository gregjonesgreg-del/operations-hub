import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Gauge } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

export default function VehiclesList({ vehicles }) {
  const sorted = useMemo(() => {
    return [...vehicles].sort((a, b) => a.regNumber?.localeCompare(b.regNumber || '') || 0);
  }, [vehicles]);

  if (!vehicles || vehicles.length === 0) {
    return <EmptyState icon={AlertTriangle} title="No vehicles" description="Add vehicles to the fleet" />;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map(vehicle => {
        const isOffRoad = vehicle.vehicleStatus !== 'Active';
        const daysToMOT = vehicle.motDueDate ? Math.ceil((new Date(vehicle.motDueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        const motOverdue = daysToMOT !== null && daysToMOT < 0;

        return (
          <Link key={vehicle.id} to={createPageUrl('VehicleDetail') + `?id=${vehicle.id}`}>
            <Card className={cn(
              'hover:shadow-md transition-all cursor-pointer',
              isOffRoad && 'border-red-300 bg-red-50/50',
              motOverdue && 'border-orange-300 bg-orange-50/50'
            )}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-sm text-slate-500">{vehicle.regNumber}</p>
                  </div>
                  {isOffRoad && (
                    <Badge variant="destructive" className="text-xs">Off Road</Badge>
                  )}
                </div>
                
                <div className="space-y-2 text-xs text-slate-600">
                  {vehicle.currentOdometer !== undefined && (
                    <div className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      {vehicle.currentOdometer.toLocaleString()} miles
                    </div>
                  )}
                  {daysToMOT !== null && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {motOverdue ? (
                        <span className="text-red-600 font-medium">MOT Overdue</span>
                      ) : (
                        <span>MOT in {daysToMOT} days</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}