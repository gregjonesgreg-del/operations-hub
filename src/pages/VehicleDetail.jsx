import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { format } from 'date-fns';
import { Calendar, AlertTriangle, Fuel, CheckCircle } from 'lucide-react';

export default function VehicleDetail() {
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('id');

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => base44.entities.Asset.filter({ id: vehicleId }).then(r => r[0]),
    enabled: !!vehicleId
  });

  const { data: defects = [] } = useQuery({
    queryKey: ['vehicleDefects', vehicleId],
    queryFn: () => base44.entities.VehicleDefect.filter({ vehicleAsset: vehicleId }),
    enabled: !!vehicleId
  });

  const { data: fuelTransactions = [] } = useQuery({
    queryKey: ['vehicleFuel', vehicleId],
    queryFn: () => base44.entities.FuelTransaction.filter({ vehicleAsset: vehicleId }),
    enabled: !!vehicleId
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!vehicle) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Vehicle not found"
        description="The vehicle you're looking for doesn't exist"
      />
    );
  }

  const openDefects = defects.filter(d => !['Fixed', 'Closed'].includes(d.status));
  const totalFuelSpend = fuelTransactions.reduce((sum, f) => sum + (f.totalCost || 0), 0);

  return (
    <div className="pb-8">
      <PageHeader
        title={`${vehicle.make} ${vehicle.model}`}
        subtitle={vehicle.regNumber}
        backLink="Fleet"
        backLabel="Fleet"
      >
        <div className="flex gap-2 mt-4 flex-wrap">
          <Badge variant={vehicle.vehicleStatus === 'Active' ? 'default' : 'destructive'}>
            {vehicle.vehicleStatus}
          </Badge>
          {vehicle.fuelType && (
            <Badge variant="outline">{vehicle.fuelType}</Badge>
          )}
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="defects">Defects ({openDefects.length})</TabsTrigger>
            <TabsTrigger value="fuel">Fuel</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Vehicle Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Make/Model</span>
                      <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Registration</span>
                      <span className="font-medium">{vehicle.regNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">VIN</span>
                      <span className="font-medium text-sm">{vehicle.vinNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Year</span>
                      <span className="font-medium">{vehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Fuel Type</span>
                      <span className="font-medium">{vehicle.fuelType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Odometer</span>
                      <span className="font-medium">{vehicle.currentOdometer?.toLocaleString() || 'N/A'} miles</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Open Defects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{openDefects.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Fuel Spend (90d)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">£{totalFuelSpend.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Compliance Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['motDueDate', 'serviceDueDate', 'insuranceDueDate'].map(key => {
                  const date = vehicle[key];
                  const daysRemaining = date ? Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                  const isOverdue = daysRemaining !== null && daysRemaining < 0;
                  const label = key === 'motDueDate' ? 'MOT' : key === 'serviceDueDate' ? 'Service' : 'Insurance';

                  return (
                    <div key={key} className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-slate-600">{label}</span>
                      {date ? (
                        <div className="text-right">
                          <p className="font-medium text-sm">{format(new Date(date), 'MMM d, yyyy')}</p>
                          <Badge variant={isOverdue ? 'destructive' : daysRemaining <= 30 ? 'secondary' : 'outline'} className="text-xs mt-1">
                            {isOverdue ? 'Overdue' : `${daysRemaining} days`}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-slate-400">Not set</span>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="defects" className="mt-6">
            {openDefects.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No open defects"
                description="Vehicle is in good condition"
              />
            ) : (
              <div className="space-y-3">
                {openDefects.map(defect => (
                  <Card key={defect.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{defect.description}</p>
                          <Badge className={`mt-2 ${
                            defect.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                            defect.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {defect.severity}
                          </Badge>
                        </div>
                        <Badge variant="outline">{defect.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="fuel" className="mt-6">
            {fuelTransactions.length === 0 ? (
              <EmptyState
                icon={Fuel}
                title="No fuel transactions"
                description="Fuel will appear here as it's logged"
              />
            ) : (
              <div className="space-y-3">
                {fuelTransactions.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)).map(fuel => (
                  <Card key={fuel.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{fuel.fuelVolume} litres</p>
                          <p className="text-sm text-slate-500">{fuel.supplier}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">£{fuel.totalCost.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(fuel.dateTime), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="text-center py-8 text-slate-500">
              Activity timeline coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}