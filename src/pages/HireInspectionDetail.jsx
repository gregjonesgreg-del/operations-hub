import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { FileText } from 'lucide-react';

export default function HireInspectionDetail() {
  const { inspectionId } = useParams();

  const { data: inspection, isLoading } = useQuery({
    queryKey: ['hireInspection', inspectionId],
    queryFn: () => base44.entities.HireInspection.filter({ id: inspectionId }).then(r => r[0]),
    enabled: !!inspectionId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading inspection..." />
      </div>
    );
  }

  if (!inspection) {
    return (
      <EmptyState
        icon={FileText}
        title="Inspection not found"
        description="The inspection you're looking for doesn't exist"
      />
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Hire Inspection"
        subtitle={`Inspection ID: ${inspectionId}`}
        backLink="Hire"
        backLabel="Back to Hire"
      />

      <div className="px-4 sm:px-6 py-6">
        <p className="text-slate-600">Inspection details coming soon.</p>
      </div>
    </div>
  );
}