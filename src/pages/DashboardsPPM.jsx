import React from 'react';
import PageHeader from '@/components/ui/PageHeader';

export default function DashboardsPPM() {
  return (
    <div className="pb-8">
      <PageHeader 
        title="PPM Dashboard" 
        subtitle="Preventive Maintenance analytics"
      />
      <div className="px-4 sm:px-6 py-6">
        <p className="text-slate-600">PPM analytics and insights coming soon.</p>
      </div>
    </div>
  );
}