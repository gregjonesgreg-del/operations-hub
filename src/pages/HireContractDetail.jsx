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
import { Package, AlertTriangle } from 'lucide-react';

export default function HireContractDetail() {
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get('id');

  const { data: contract, isLoading } = useQuery({
    queryKey: ['hireContract', contractId],
    queryFn: () => base44.entities.HireContract.filter({ id: contractId }).then(r => r[0]),
    enabled: !!contractId
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list()
  });

  const { data: customer } = useQuery({
    queryKey: ['customer', contract?.customer],
    queryFn: () => base44.entities.Customer.filter({ id: contract?.customer }).then(r => r[0]),
    enabled: !!contract?.customer
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!contract) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Contract not found"
        description="The hire contract you're looking for doesn't exist"
      />
    );
  }

  const hireAssets = assets.filter(a => contract.hireAssets?.includes(a.id));
  const startDate = new Date(contract.startDate);
  const endDate = new Date(contract.endDate);
  const daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="pb-8">
      <PageHeader
        title={contract.contractNumber || 'Hire Contract'}
        subtitle={customer?.name}
        backLink="Hire"
        backLabel="Hire"
      >
        <div className="flex gap-2 mt-4 flex-wrap">
          <Badge variant={
            contract.status === 'On Hire' ? 'default' :
            contract.status === 'Confirmed' ? 'secondary' :
            'outline'
          }>
            {contract.status}
          </Badge>
          {daysRemaining > 0 && (
            <Badge variant="outline">{daysRemaining} days remaining</Badge>
          )}
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets ({hireAssets.length})</TabsTrigger>
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contract Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Start Date</span>
                      <span className="font-medium">{format(startDate, 'MMM d, yyyy HH:mm')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">End Date</span>
                      <span className="font-medium">{format(endDate, 'MMM d, yyyy HH:mm')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Delivery Required</span>
                      <span className="font-medium">{contract.deliveryRequired ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Collection Required</span>
                      <span className="font-medium">{contract.collectionRequired ? 'Yes' : 'No'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className="mb-3" variant={
                      contract.status === 'On Hire' ? 'default' :
                      contract.status === 'Confirmed' ? 'secondary' :
                      'outline'
                    }>
                      {contract.status}
                    </Badge>
                    {contract.depositRequired && (
                      <p className="text-sm text-slate-600 mt-2">
                        Deposit: £{contract.depositAmount}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="mt-6">
            {hireAssets.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No assets on contract"
                description="Add assets to this hire contract"
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {hireAssets.map(asset => (
                  <Card key={asset.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{asset.make} {asset.model}</h3>
                      <p className="text-sm text-slate-500">{asset.internalAssetId}</p>
                      <Badge variant="outline" className="mt-2">{asset.hireCategory}</Badge>
                      {asset.rateDaily && (
                        <p className="text-xs text-slate-600 mt-2">
                          £{asset.rateDaily}/day
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inspections" className="mt-6">
            <div className="text-center py-8 text-slate-500">
              Inspections coming soon
            </div>
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