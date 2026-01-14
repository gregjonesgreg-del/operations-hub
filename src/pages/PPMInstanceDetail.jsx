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
import StatusBadge from '@/components/ui/StatusBadge';
import { format } from 'date-fns';
import { Calendar, Package, CheckSquare } from 'lucide-react';

export default function PPMInstanceDetail() {
  const [searchParams] = useSearchParams();
  const instanceId = searchParams.get('id');

  const { data: instance, isLoading } = useQuery({
    queryKey: ['ppmInstance', instanceId],
    queryFn: () => base44.entities.PPMInstance.filter({ id: instanceId }).then(r => r[0]),
    enabled: !!instanceId
  });

  const { data: asset } = useQuery({
    queryKey: ['asset', instance?.asset],
    queryFn: () => base44.entities.Asset.filter({ id: instance?.asset }).then(r => r[0]),
    enabled: !!instance?.asset
  });

  const { data: plan } = useQuery({
    queryKey: ['plan', instance?.ppmPlan],
    queryFn: () => base44.entities.PPMPlan.filter({ id: instance?.ppmPlan }).then(r => r[0]),
    enabled: !!instance?.ppmPlan
  });

  const { data: checklistItems = [] } = useQuery({
    queryKey: ['items', plan?.checklistTemplate],
    queryFn: () => base44.entities.ChecklistItem.filter({ template: plan?.checklistTemplate }),
    enabled: !!plan?.checklistTemplate
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!instance) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Instance not found"
        description="The PPM instance you're looking for doesn't exist"
      />
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title={plan?.name || 'PPM Instance'}
        subtitle={asset ? `${asset.make} ${asset.model}` : 'Unknown Asset'}
        backLink="PPM"
        backLabel="Back to PPM"
      >
        <div className="flex gap-2 mt-4">
          <StatusBadge status={instance.status} />
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Calendar className="h-4 w-4" />
            Due {format(new Date(instance.dueDate), 'MMM d, yyyy')}
          </div>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        <Tabs defaultValue="checklist" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="checklist" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                {checklistItems.length === 0 ? (
                  <p className="text-slate-500 text-sm">No checklist items</p>
                ) : (
                  <div className="space-y-3">
                    {checklistItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <input type="checkbox" className="mt-1" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.itemText}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.responseType}
                            </Badge>
                            {item.photoRequired && (
                              <Badge variant="outline" className="text-xs">📸</Badge>
                            )}
                            {item.notesRequired && (
                              <Badge variant="outline" className="text-xs">📝</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Asset Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {asset && (
                    <>
                      <div>
                        <p className="text-xs text-slate-500">Asset</p>
                        <p className="font-medium">{asset.make} {asset.model}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Asset ID</p>
                        <p className="font-medium">{asset.internalAssetId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Type</p>
                        <p className="font-medium">{asset.assetType}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Due Date</p>
                    <p className="font-medium">{format(new Date(instance.dueDate), 'MMM d, yyyy')}</p>
                  </div>
                  {instance.scheduledDate && (
                    <div>
                      <p className="text-xs text-slate-500">Scheduled For</p>
                      <p className="font-medium">{format(new Date(instance.scheduledDate), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <StatusBadge status={instance.status} size="sm" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}