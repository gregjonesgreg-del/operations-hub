import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FleetDashboard() {
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Asset.filter({ assetType: 'Vehicle' })
  });

  const { data: defects = [] } = useQuery({
    queryKey: ['vehicleDefects'],
    queryFn: () => base44.entities.VehicleDefect.list()
  });

  const { data: fuelTransactions = [] } = useQuery({
    queryKey: ['fuelTransactions'],
    queryFn: () => base44.entities.FuelTransaction.list()
  });

  const offRoad = vehicles.filter(v => v.vehicleStatus !== 'Active').length;
  const openDefects = defects.filter(d => !['Fixed', 'Closed'].includes(d.status)).length;
  const criticalDefects = defects.filter(d => d.severity === 'Critical' && !['Fixed', 'Closed'].includes(d.status)).length;
  const motOverdue = vehicles.filter(v => v.motDueDate && new Date(v.motDueDate) < new Date()).length;
  const totalFuelSpend = fuelTransactions.reduce((sum, f) => sum + (f.totalCost || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Vehicles Off Road</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{offRoad}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Open Defects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{openDefects}</p>
            {criticalDefects > 0 && (
              <p className="text-xs text-red-600 mt-1">{criticalDefects} critical</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">MOT Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{motOverdue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Fuel Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">£{totalFuelSpend.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Fleet Size</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{vehicles.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}