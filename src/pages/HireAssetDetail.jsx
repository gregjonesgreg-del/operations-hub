import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { ROUTES } from '@/components/Routes';
import { AlertTriangle } from 'lucide-react';

export default function HireAssetDetail() {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('id');

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => base44.entities.Asset.filter({ id: assetId }).then(r => r[0]),
    enabled: !!assetId
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  if (!asset) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Asset not found"
        description="The hire asset doesn't exist"
      />
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title={`${asset.make} ${asset.model}`}
        backLink={ROUTES.HIRE_ASSETS}
        backLabel="Assets"
      >
        <Badge variant={asset.availabilityStatus === 'Available' ? 'default' : 'secondary'}>
          {asset.availabilityStatus}
        </Badge>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Asset ID</span>
              <span className="text-slate-900">{asset.internalAssetId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Category</span>
              <span className="text-slate-900">{asset.hireCategory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Status</span>
              <Badge variant="outline">{asset.availabilityStatus}</Badge>
            </div>
            {asset.rateDaily && (
              <div className="flex justify-between">
                <span className="text-slate-600">Daily Rate</span>
                <span className="text-slate-900 font-medium">£{asset.rateDaily}</span>
              </div>
            )}
            {asset.rateWeekly && (
              <div className="flex justify-between">
                <span className="text-slate-600">Weekly Rate</span>
                <span className="text-slate-900 font-medium">£{asset.rateWeekly}</span>
              </div>
            )}
            {asset.hoursMeter !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-600">Hours Meter</span>
                <span className="text-slate-900">{asset.hoursMeter}h</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}