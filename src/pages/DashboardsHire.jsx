import React from 'react';
import PageHeader from '@/components/ui/PageHeader';

export default function DashboardsHire() {
  return (
    <div className="pb-8">
      <PageHeader 
        title="Hire Dashboard" 
        subtitle="Equipment rental analytics"
      />
      <div className="px-4 sm:px-6 py-6">
        <p className="text-slate-600">Hire analytics and insights coming soon.</p>
      </div>
    </div>
  );
}