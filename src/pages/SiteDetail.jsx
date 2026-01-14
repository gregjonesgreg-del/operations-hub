import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useSearchParams } from 'react-router-dom';
import useAppNavigate from '@/components/useAppNavigate';
import { routeBuilders } from '@/components/Routes';
import {
  MapPin,
  Edit2,
  Building2,
  Package,
  Wrench,
  ChevronRight,
  AlertTriangle,
  Navigation
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
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ActivityTimeline from '@/components/ActivityTimeline';

export default function SiteDetail() {
  const navigate = useAppNavigate();
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('id');
  const queryClient = useQueryClient();
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState({});

  const { data: site, isLoading } = useQuery({
    queryKey: ['site', siteId],
    queryFn: () => base44.entities.Site.filter({ id: siteId }).then(r => r[0]),
    enabled: !!siteId
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list()
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['siteAssets', siteId],
    queryFn: () => base44.entities.Asset.filter({ site: siteId }),
    enabled: !!siteId
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['siteJobs', siteId],
    queryFn: () => base44.entities.Job.filter({ site: siteId }),
    enabled: !!siteId
  });

  const customer = customers.find(c => c.id === site?.customer);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Site.update(siteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site', siteId] });
      setShowEditDialog(false);
    }
  });

  const openMaps = () => {
    if (site?.address) {
      const encoded = encodeURIComponent(site.address);
      window.open(`https://maps.google.com/maps?q=${encoded}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!site) {
    return (
      <EmptyState
        icon={MapPin}
        title="Site not found"
        description="The site you're looking for doesn't exist"
      />
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title={site.siteName}
        subtitle={site.address}
        backLink={routeBuilders.sites()}
        backLabel="Sites"
        actions={
          <div className="flex gap-2">
            {site.address && (
              <Button variant="outline" onClick={openMaps} className="gap-2">
                <Navigation className="h-4 w-4" />
                Directions
              </Button>
            )}
            <Dialog open={showEditDialog} onOpenChange={(open) => {
              if (open) setEditData(site);
              setShowEditDialog(open);
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Site</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Site Name</Label>
                    <Input
                      value={editData.siteName || ''}
                      onChange={(e) => setEditData({...editData, siteName: e.target.value})}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Textarea
                      value={editData.address || ''}
                      onChange={(e) => setEditData({...editData, address: e.target.value})}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Access Notes</Label>
                    <Textarea
                      value={editData.accessNotes || ''}
                      onChange={(e) => setEditData({...editData, accessNotes: e.target.value})}
                      placeholder="Gate codes, parking, reception..."
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Site Risk Notes</Label>
                    <Textarea
                      value={editData.siteRiskNotes || ''}
                      onChange={(e) => setEditData({...editData, siteRiskNotes: e.target.value})}
                      placeholder="Health & safety considerations..."
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
          </div>
        }
      >
        <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
          {customer && (
            <button
              onClick={() => navigate(routeBuilders.customerDetail(customer.id))}
              className="flex items-center gap-1 text-indigo-600 hover:underline bg-transparent border-0 p-0 cursor-pointer"
            >
              <Building2 className="h-4 w-4" />
              {customer.name}
            </button>
          )}
          <span>•</span>
          <span>{assets.length} assets</span>
          <span>•</span>
          <span>{jobs.length} jobs</span>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets ({assets.length})</TabsTrigger>
            <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Location Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Address</p>
                      <p className="whitespace-pre-line">{site.address || 'Not set'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {(site.accessNotes || site.siteRiskNotes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Site Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {site.accessNotes && (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-sm font-medium text-amber-800 mb-1">📋 Access Notes</p>
                        <p className="text-amber-700">{site.accessNotes}</p>
                      </div>
                    )}
                    {site.siteRiskNotes && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-sm font-medium text-red-800 mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Risk Notes
                        </p>
                        <p className="text-red-700">{site.siteRiskNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assets" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assets at this Site</CardTitle>
              </CardHeader>
              <CardContent>
                {assets.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No assets at this site"
                    description="Assets assigned to this site will appear here"
                  />
                ) : (
                  <div className="space-y-2">
                    {assets.map(asset => (
                      <div
                        key={asset.id}
                        onClick={() => navigate(routeBuilders.assetDetail(asset.id))}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(routeBuilders.assetDetail(asset.id))}
                      >
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{asset.make} {asset.model}</p>
                          <p className="text-sm text-slate-500">{asset.internalAssetId}</p>
                        </div>
                        <StatusBadge status={asset.status} size="xs" />
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Jobs at this Site</CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <EmptyState
                    icon={Wrench}
                    title="No jobs at this site"
                    description="Jobs for this site will appear here"
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

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTimeline entityType="Site" entityId={siteId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}