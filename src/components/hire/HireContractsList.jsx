import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

export default function HireContractsList({ contracts }) {
  const sorted = useMemo(() => {
    const statusOrder = { 'On Hire': 0, 'Confirmed': 1, 'Draft': 2, 'Off Hire Requested': 3, 'Returned': 4, 'Closed': 5 };
    return [...contracts].sort((a, b) => (statusOrder[a.status] ?? 6) - (statusOrder[b.status] ?? 6));
  }, [contracts]);

  if (!contracts || contracts.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No hire contracts"
        description="Create a new hire contract to get started"
      />
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map(contract => (
        <Link key={contract.id} to={createPageUrl('HireContractDetail') + `?id=${contract.id}`}>
          <Card className="hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {contract.contractNumber || 'New Contract'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {contract.hireAssets?.length || 0} asset{contract.hireAssets?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Badge variant={
                  contract.status === 'On Hire' ? 'default' :
                  contract.status === 'Confirmed' ? 'secondary' :
                  'outline'
                }>
                  {contract.status}
                </Badge>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-600 mt-3">
                <Calendar className="h-3 w-3" />
                {format(new Date(contract.startDate), 'MMM d')} - {format(new Date(contract.endDate), 'MMM d, yyyy')}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}