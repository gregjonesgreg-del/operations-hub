import React from 'react';
import PageHeader from '@/components/ui/PageHeader';

export default function HireCalendar() {
  return (
    <div className="pb-8">
      <PageHeader title="Hire Calendar" />
      <div className="px-4 sm:px-6 py-6">
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">Hire availability calendar</p>
          <p className="text-sm mt-2">Coming soon</p>
        </div>
      </div>
    </div>
  );
}