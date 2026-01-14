import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Car, AlertTriangle, Fuel, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import VehiclesList from '@/components/fleet/VehiclesList.jsx';
import FleetDashboard from '@/components/fleet/FleetDashboard.jsx';

export default function Fleet() {
  const { data: vehicles = [], isLoading } = useQuery({
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

  const openDefects = defects.filter(d => !['Fixed', 'Closed'].includes(d.status)).length;
  const unreviewed = fuelTransactions.filter(f => f.reviewStatus === 'Submitted').length;

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading Fleet..." />;
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Fleet Management"
        subtitle={`${vehicles.length} vehicles • ${openDefects} open defects • ${unreviewed} unreviewed fuel`}
        actions={
          <Link to={createPageUrl('FleetDashboard')}>
            <Button variant="outline" className="gap-2">
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
        }
      />

      <div className="px-4 sm:px-6 py-6">
        <Tabs defaultValue="vehicles" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="vehicles" className="gap-2">
              <Car className="h-4 w-4" />
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="defects" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Defects ({openDefects})
            </TabsTrigger>
            <TabsTrigger value="fuel" className="gap-2">
              <Fuel className="h-4 w-4" />
              Fuel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="mt-6">
            <VehiclesList vehicles={vehicles} />
          </TabsContent>

          <TabsContent value="defects" className="mt-6">
            <div className="text-center py-8 text-slate-500">
              Defects view coming soon
            </div>
          </TabsContent>

          <TabsContent value="fuel" className="mt-6">
            <div className="text-center py-8 text-slate-500">
              Fuel transactions view coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}