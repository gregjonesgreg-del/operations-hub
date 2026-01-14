import React from 'react';
import PageHeader from '@/components/ui/PageHeader';

export default function DashboardsOps() {
  return (
    <div className="pb-8">
      <PageHeader 
        title="Operations Dashboard" 
        subtitle="Internal operations analytics"
      />
      <div className="px-4 sm:px-6 py-6">
        <p className="text-slate-600">Operations analytics and insights coming soon.</p>
      </div>
    </div>
  );
}