import React from 'react';
import { Truck } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

export default function Hire() {
  return (
    <div className="pb-8">
      <PageHeader
        title="Hire / Rental"
        subtitle="Equipment hire and rental management"
      />

      <div className="px-4 sm:px-6 py-6">
        <EmptyState
          icon={Truck}
          title="Hire Module Coming Soon"
          description="Equipment hire and rental management will be available in a future update"
        />
      </div>
    </div>
  );
}