import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useSearchParams } from 'react-router-dom';
import useAppNavigate from '@/components/useAppNavigate';
import { routeBuilders, ROUTES } from '@/components/Routes';
import { format } from 'date-fns';
import {
  Package,
  Edit2,
  MapPin,
  Calendar,
  FileText,
  Wrench,
  ChevronRight,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ActivityTimeline from '@/components/ActivityTimeline';
import { cn } from '@/lib/utils';

const ASSET_TYPES = ['Vehicle', 'Hire Asset', 'Workshop Machinery', 'Customer Machinery', 'Other'];
const ASSET_STATUSES = ['Active', 'In Repair', 'Off Hire', 'Decommissioned'];
const LOCATION_TYPES = ['Site', 'Workshop', 'Yard', 'On Hire'];

export default function AssetDetail() {
  const navigate = useAppNavigate();
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('id');
  const queryClient = useQueryClient();
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState({});

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => base44.entities.Asset.filter({ id: assetId }).then(r => r[0]),
    enabled: !!assetId
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list()
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['assetJobs', assetId],
    queryFn: () => base44.entities.Job.filter({ asset: assetId }),
    enabled: !!assetId
  });

  const site = sites.find(s => s.id === asset?.site);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Asset.update(assetId, data),
    onSuccess: (_, variables) => {
      if (variables.status !== asset?.status) {
        base44.entities.ActivityLog.create({
          entityType: 'Asset',
          entityId: assetId,
          activityType: 'Status Change',
          description: 'changed status',
          previousValue: asset?.status,
          newValue: variables.status
        });
      }
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      setShowEditDialog(false);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!asset) {
    return (
      <EmptyState
        icon={Package}
        title="Asset not found"
        description="The asset you're looking for doesn't exist"
      />
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title={`${asset.make} ${asset.model}`}
        subtitle={asset.internalAssetId}
        backLink={routeBuilders.assets()}
        backLabel="Assets"
        actions={
          <Dialog open={showEditDialog} onOpenChange={(open) => {
            if (open) setEditData(asset);
            setShowEditDialog(open);
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Asset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <Label>Asset Type</Label>
                  <Select value={editData.assetType || ''} onValueChange={(v) => setEditData({...editData, assetType: v})}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Asset ID</Label>
                  <Input
                    value={editData.internalAssetId || ''}
                    onChange={(e) => setEditData({...editData, internalAssetId: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Make</Label>
                    <Input
                      value={editData.make || ''}
                      onChange={(e) => setEditData({...editData, make: e.target.value})}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input
                      value={editData.model || ''}
                      onChange={(e) => setEditData({...editData, model: e.target.value})}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <Input
                    value={editData.serialNumber || ''}
                    onChange={(e) => setEditData({...editData, serialNumber: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select value={editData.status || ''} onValueChange={(v) => setEditData({...editData, status: v})}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_STATUSES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Select value={editData.locationType || ''} onValueChange={(v) => setEditData({...editData, locationType: v})}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_TYPES.map(l => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Site</Label>
                  <Select value={editData.site || ''} onValueChange={(v) => setEditData({...editData, site: v})}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>No site</SelectItem>
                      {sites.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.siteName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Warranty Expiry</Label>
                  <Input
                    type="date"
                    value={editData.warrantyExpiry || ''}
                    onChange={(e) => setEditData({...editData, warrantyExpiry: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                <Button onClick={() => updateMutation.mutate(editData)}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <StatusBadge status={asset.status} />
          <StatusBadge status={asset.assetType} />
          <StatusBadge status={asset.locationType} />
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Asset Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Asset ID</p>
                      <p className="font-medium">{asset.internalAssetId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Type</p>
                      <p className="font-medium">{asset.assetType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Make</p>
                      <p className="font-medium">{asset.make || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Model</p>
                      <p className="font-medium">{asset.model || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Serial Number</p>
                      <p className="font-medium">{asset.serialNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <StatusBadge status={asset.status} size="sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Location Type</p>
                      <p className="font-medium">{asset.locationType}</p>
                    </div>
                  </div>
                  {site && (
                    <div 
                      onClick={() => navigate(routeBuilders.siteDetail(site.id))}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(routeBuilders.siteDetail(site.id))}
                    >
                      <MapPin className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium">{site.siteName}</p>
                        <p className="text-sm text-slate-500">{site.address}</p>
                      </div>
                    </div>
                  )}
                  {asset.warrantyExpiry && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Warranty Expiry</p>
                        <p className="font-medium">{format(new Date(asset.warrantyExpiry), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {asset.notes && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 whitespace-pre-line">{asset.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Related Jobs</CardTitle>
                <Button 
                  onClick={() => navigate(routeBuilders.jobsNew())}
                  size="sm"
                >
                  New Job
                </Button>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <EmptyState
                    icon={Wrench}
                    title="No jobs for this asset"
                    description="Jobs linked to this asset will appear here"
                  />
                ) : (
                  <div className="space-y-2">
                     {jobs.map(job => (
                       <div
                         key={job.id}
                         onClick={() => navigate(routeBuilders.jobDetail(job.id))}
                         className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                         role="button"
                         tabIndex={0}
                         onKeyDown={(e) => e.key === 'Enter' && navigate(routeBuilders.jobDetail(job.id))}
                       >
                         <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                           <Wrench className="h-5 w-5 text-indigo-600" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="font-medium truncate">{job.jobNumber || 'Draft'}</p>
                           <p className="text-sm text-slate-500 truncate">{job.description || job.jobType}</p>
                         </div>
                         <StatusBadge status={job.status} size="xs" />
                         <ChevronRight className="h-4 w-4 text-slate-400" />
                       </div>
                     ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Documents & Photos</CardTitle>
                <Button size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={FileText}
                  title="No documents yet"
                  description="Upload manuals, certificates, or photos"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTimeline entityType="Asset" entityId={assetId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}