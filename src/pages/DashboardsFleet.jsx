import React from 'react';
import PageHeader from '@/components/ui/PageHeader';

export default function DashboardsFleet() {
  return (
    <div className="pb-8">
      <PageHeader 
        title="Fleet Dashboard" 
        subtitle="Vehicle and equipment analytics"
      />
      <div className="px-4 sm:px-6 py-6">
        <p className="text-slate-600">Fleet analytics and insights coming soon.</p>
      </div>
    </div>
  );
}