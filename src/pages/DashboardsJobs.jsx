import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardsJobs() {
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs-dashboard'],
    queryFn: () => base44.entities.Job.filter({}, '-created_date', 500)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader 
        title="Jobs Dashboard" 
        subtitle={`${jobs.length} total jobs`}
      />
      <div className="px-4 sm:px-6 py-6">
        <p className="text-slate-600">Jobs analytics and insights coming soon.</p>
      </div>
    </div>
  );
}