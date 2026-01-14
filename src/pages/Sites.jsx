import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ChevronRight,
  Building2,
  Package
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

export default function Sites() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.filter({}, '-created_date')
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list()
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list()
  });

  const customerMap = useMemo(() => customers.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}), [customers]);

  const getAssetCount = (siteId) => {
    return assets.filter(a => a.site === siteId).length;
  };

  const filteredSites = sites.filter(s => 
    s.siteName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customerMap[s.customer]?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading sites..." />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Sites"
        subtitle={`${filteredSites.length} site${filteredSites.length !== 1 ? 's' : ''}`}
      >
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        {filteredSites.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No sites found"
            description={searchQuery ? "Try a different search term" : "Add sites through customer records"}
          />
        ) : (
          <div className="space-y-3">
            {filteredSites.map(site => {
              const customer = customerMap[site.customer];
              const assetCount = getAssetCount(site.id);

              return (
                <Card 
                  key={site.id}
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/SiteDetail?siteId=${site.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/SiteDetail?siteId=${site.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-emerald-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{site.siteName}</h3>
                        <p className="text-sm text-slate-500 truncate">{site.address}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                          {customer && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {customer.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {assetCount} asset{assetCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
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