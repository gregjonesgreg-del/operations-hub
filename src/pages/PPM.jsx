import React from 'react';
import { Calendar } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

export default function PPM() {
  return (
    <div className="pb-8">
      <PageHeader
        title="PPM Schedule"
        subtitle="Planned Preventive Maintenance"
      />

      <div className="px-4 sm:px-6 py-6">
        <EmptyState
          icon={Calendar}
          title="PPM Module Coming Soon"
          description="Planned Preventive Maintenance scheduling will be available in a future update"
        />
      </div>
    </div>
  );
}