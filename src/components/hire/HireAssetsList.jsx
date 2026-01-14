import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

const categoryIcons = {
  'Pressure Washer': '💨',
  'Scrubber Dryer': '🧹',
  'Sweeper': '🧹',
  'Vacuum': '🌀',
  'Extractor': '💧',
  'Steam': '☁️'
};

export default function HireAssetsList({ assets }) {
  const sorted = useMemo(() => {
    const statusOrder = { 'Available': 0, 'Reserved': 1, 'On Hire': 2, 'In Maintenance': 3 };
    return [...assets].sort((a, b) => (statusOrder[a.availabilityStatus] ?? 4) - (statusOrder[b.availabilityStatus] ?? 4));
  }, [assets]);

  if (!assets || assets.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No hire assets"
        description="Add hire equipment to the system"
      />
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map(asset => {
        const statusColor = {
          'Available': 'bg-green-100 text-green-700',
          'Reserved': 'bg-blue-100 text-blue-700',
          'On Hire': 'bg-purple-100 text-purple-700',
          'In Maintenance': 'bg-red-100 text-red-700'
        };

        return (
          <Card key={asset.id} className="hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-2xl mb-1">
                    {categoryIcons[asset.hireCategory] || '⚙️'}
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    {asset.make} {asset.model}
                  </h3>
                  <p className="text-sm text-slate-500">{asset.internalAssetId}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Badge className={statusColor[asset.availabilityStatus]}>
                  {asset.availabilityStatus}
                </Badge>
                {asset.hireCategory && (
                  <Badge variant="outline" className="block text-xs">
                    {asset.hireCategory}
                  </Badge>
                )}
                {asset.rateDaily && (
                  <p className="text-xs text-slate-600 mt-2">
                    £{asset.rateDaily}/day
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}