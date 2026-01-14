import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { CheckCircle, AlertTriangle, Fuel, Camera } from 'lucide-react';

export default function MyVehicle() {
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: employee } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.EmployeeProfile.filter({ email: currentUser?.email }).then(r => r[0]),
    enabled: !!currentUser?.email
  });

  const { data: vehicle } = useQuery({
    queryKey: ['assignedVehicle', employee?.id],
    queryFn: () => base44.entities.Asset.filter({ assignedDriver: employee?.id }).then(r => r[0]),
    enabled: !!employee?.id
  });

  if (!currentUser) {
    return <LoadingSpinner size="lg" />;
  }

  if (!vehicle) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No vehicle assigned"
        description="You don't have a vehicle assigned. Contact your dispatcher."
      />
    );
  }

  return (
    <div className="pb-24">
      <PageHeader
        title={`${vehicle.make} ${vehicle.model}`}
        subtitle={vehicle.regNumber}
      >
        <Badge variant={vehicle.vehicleStatus === 'Active' ? 'default' : 'destructive'}>
          {vehicle.vehicleStatus}
        </Badge>
      </PageHeader>

      <div className="px-4 py-6 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" className="h-16 flex flex-col gap-1">
            <CheckCircle className="h-6 w-6" />
            <span className="text-xs">Start Check</span>
          </Button>
          <Button size="lg" variant="outline" className="h-16 flex flex-col gap-1">
            <AlertTriangle className="h-6 w-6" />
            <span className="text-xs">Report Defect</span>
          </Button>
          <Button size="lg" variant="outline" className="h-16 flex flex-col gap-1">
            <Fuel className="h-6 w-6" />
            <span className="text-xs">Add Fuel</span>
          </Button>
          <Button size="lg" variant="outline" className="h-16 flex flex-col gap-1">
            <Camera className="h-6 w-6" />
            <span className="text-xs">Take Photo</span>
          </Button>
        </div>

        {/* Vehicle Info */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Odometer</span>
                  <span className="font-medium">{vehicle.currentOdometer?.toLocaleString() || 'N/A'} miles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Fuel Type</span>
                  <span className="font-medium">{vehicle.fuelType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Registration</span>
                  <span className="font-medium">{vehicle.regNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Year</span>
                  <span className="font-medium">{vehicle.year}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">MOT Due</span>
                  <Badge variant={vehicle.motDueDate ? 'outline' : 'destructive'}>
                    {vehicle.motDueDate ? new Date(vehicle.motDueDate).toLocaleDateString() : 'Overdue'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Service Due</span>
                  <Badge variant="outline">
                    {vehicle.serviceDueDate ? new Date(vehicle.serviceDueDate).toLocaleDateString() : 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Insurance Due</span>
                  <Badge variant="outline">
                    {vehicle.insuranceDueDate ? new Date(vehicle.insuranceDueDate).toLocaleDateString() : 'N/A'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="text-center text-slate-500 py-8">
              Activity history coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}