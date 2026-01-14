import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { AlertTriangle, Calendar } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

export default function PPMInstancesList({ instances }) {
  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list()
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['ppmPlans'],
    queryFn: () => base44.entities.PPMPlan.list()
  });

  const assetMap = useMemo(() => assets.reduce((acc, a) => ({ ...acc, [a.id]: a }), {}), [assets]);
  const planMap = useMemo(() => plans.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}), [plans]);

  const sortedInstances = useMemo(() => {
    const sorted = [...instances].sort((a, b) => {
      const statusOrder = { Overdue: 0, Due: 1, Scheduled: 2, 'In Progress': 3, Completed: 4, Skipped: 5 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    return sorted;
  }, [instances]);

  if (!instances || instances.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No PPM instances scheduled"
        description="Instances will be auto-generated based on your PPM plans"
      />
    );
  }

  return (
    <div className="space-y-3">
      {sortedInstances.map(instance => {
        const asset = assetMap[instance.asset];
        const plan = planMap[instance.ppmPlan];
        const isOverdue = instance.status === 'Overdue';

        return (
          <Link
            key={instance.id}
            to={createPageUrl('PPMInstanceDetail') + `?id=${instance.id}`}
          >
            <Card className={cn(
              'hover:shadow-md transition-all cursor-pointer',
              isOverdue && 'border-red-300 bg-red-50/50'
            )}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {plan?.name || 'Unknown Plan'}
                      </h3>
                      {isOverdue && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-3">
                      {asset?.make} {asset?.model} • {asset?.internalAssetId}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={instance.status} size="xs" />
                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(instance.dueDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}