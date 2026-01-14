import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import useAppNavigate from '@/components/useAppNavigate';
import { routeBuilders } from '@/components/Routes';
import {
  Plus,
  Search,
  Package,
  ChevronRight,
  Filter,
  Car,
  Truck,
  Wrench as WrenchIcon,
  Box,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

const ASSET_TYPES = ['Vehicle', 'Hire Asset', 'Workshop Machinery', 'Customer Machinery', 'Other'];
const ASSET_STATUSES = ['Active', 'In Repair', 'Off Hire', 'Decommissioned'];
const LOCATION_TYPES = ['Site', 'Workshop', 'Yard', 'On Hire'];

const typeIcons = {
  'Vehicle': Car,
  'Hire Asset': Truck,
  'Workshop Machinery': WrenchIcon,
  'Customer Machinery': WrenchIcon,
  'Other': Box
};

const typeColors = {
  'Vehicle': 'bg-blue-100 text-blue-600',
  'Hire Asset': 'bg-purple-100 text-purple-600',
  'Workshop Machinery': 'bg-amber-100 text-amber-600',
  'Customer Machinery': 'bg-emerald-100 text-emerald-600',
  'Other': 'bg-slate-100 text-slate-600'
};

export default function Assets() {
  const navigate = useAppNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    assetType: 'all',
    status: 'all',
    locationType: 'all',
    site: 'all'
  });
  
  const [newAsset, setNewAsset] = useState({
    assetType: 'Other',
    internalAssetId: '',
    make: '',
    model: '',
    serialNumber: '',
    status: 'Active',
    locationType: 'Workshop',
    notes: ''
  });

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.filter({}, '-created_date')
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list()
  });

  const siteMap = useMemo(() => sites.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}), [sites]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Asset.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setShowCreateDialog(false);
      setNewAsset({
        assetType: 'Other',
        internalAssetId: '',
        make: '',
        model: '',
        serialNumber: '',
        status: 'Active',
        locationType: 'Workshop',
        notes: ''
      });
    }
  });

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Type filter
      if (filters.assetType !== 'all' && asset.assetType !== filters.assetType) return false;
      
      // Status filter
      if (filters.status !== 'all' && asset.status !== filters.status) return false;
      
      // Location type filter
      if (filters.locationType !== 'all' && asset.locationType !== filters.locationType) return false;
      
      // Site filter
      if (filters.site !== 'all' && asset.site !== filters.site) return false;
      
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          asset.internalAssetId?.toLowerCase().includes(query) ||
          asset.make?.toLowerCase().includes(query) ||
          asset.model?.toLowerCase().includes(query) ||
          asset.serialNumber?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [assets, filters, searchQuery]);

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length;

  const clearFilters = () => {
    setFilters({ assetType: 'all', status: 'all', locationType: 'all', site: 'all' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading assets..." />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Assets"
        subtitle={`${filteredAssets.length} asset${filteredAssets.length !== 1 ? 's' : ''}`}
        actions={
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Asset</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <Label>Asset Type *</Label>
                  <Select value={newAsset.assetType} onValueChange={(v) => setNewAsset({...newAsset, assetType: v})}>
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
                  <Label>Asset ID *</Label>
                  <Input
                    value={newAsset.internalAssetId}
                    onChange={(e) => setNewAsset({...newAsset, internalAssetId: e.target.value})}
                    placeholder="e.g. VEH-001"
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Make</Label>
                    <Input
                      value={newAsset.make}
                      onChange={(e) => setNewAsset({...newAsset, make: e.target.value})}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input
                      value={newAsset.model}
                      onChange={(e) => setNewAsset({...newAsset, model: e.target.value})}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <Input
                    value={newAsset.serialNumber}
                    onChange={(e) => setNewAsset({...newAsset, serialNumber: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select value={newAsset.status} onValueChange={(v) => setNewAsset({...newAsset, status: v})}>
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
                    <Select value={newAsset.locationType} onValueChange={(v) => setNewAsset({...newAsset, locationType: v})}>
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
                  <Label>Notes</Label>
                  <Textarea
                    value={newAsset.notes}
                    onChange={(e) => setNewAsset({...newAsset, notes: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button 
                  onClick={() => createMutation.mutate(newAsset)}
                  disabled={!newAsset.internalAssetId || !newAsset.assetType}
                >
                  Create Asset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-indigo-600">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Assets</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <Label>Asset Type</Label>
                  <Select value={filters.assetType} onValueChange={(v) => setFilters({...filters, assetType: v})}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {ASSET_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {ASSET_STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location Type</Label>
                  <Select value={filters.locationType} onValueChange={(v) => setFilters({...filters, locationType: v})}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {LOCATION_TYPES.map(l => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Site</Label>
                  <Select value={filters.site} onValueChange={(v) => setFilters({...filters, site: v})}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sites</SelectItem>
                      {sites.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.siteName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4 flex gap-2">
                  <Button variant="outline" onClick={clearFilters} className="flex-1">Clear</Button>
                  <Button onClick={() => setFiltersOpen(false)} className="flex-1">Apply</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.assetType !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Type: {filters.assetType}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, assetType: 'all'})} />
              </Badge>
            )}
            {filters.status !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Status: {filters.status}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, status: 'all'})} />
              </Badge>
            )}
            {filters.locationType !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Location: {filters.locationType}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, locationType: 'all'})} />
              </Badge>
            )}
            <Button variant="link" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
              Clear all
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        {filteredAssets.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No assets found"
            description={searchQuery || activeFiltersCount > 0 
              ? "Try adjusting your search or filters"
              : "Add your first asset to get started"
            }
            action={searchQuery || activeFiltersCount > 0 ? clearFilters : () => setShowCreateDialog(true)}
            actionLabel={searchQuery || activeFiltersCount > 0 ? "Clear Filters" : "Add Asset"}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map(asset => {
              const Icon = typeIcons[asset.assetType] || Package;
              const colorClass = typeColors[asset.assetType] || typeColors['Other'];
              const site = siteMap[asset.site];

              return (
                <Card 
                  key={asset.id}
                  className="hover:shadow-md transition-all cursor-pointer h-full"
                  onClick={() => navigate(routeBuilders.assetDetail(asset.id))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(routeBuilders.assetDetail(asset.id))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0", colorClass)}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 truncate">
                            {asset.make} {asset.model}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{asset.internalAssetId}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">{asset.assetType}</Badge>
                      <StatusBadge status={asset.status} size="xs" />
                    </div>

                    <div className="mt-3 pt-3 border-t text-sm text-slate-500">
                      <span>{asset.locationType}</span>
                      {site && <span className="ml-1">• {site.siteName}</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}