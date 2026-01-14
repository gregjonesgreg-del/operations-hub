import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

export default function InternalOps() {
  return (
    <div className="pb-8">
      <PageHeader
        title="Internal Ops & Compliance"
        subtitle="Internal operations and compliance management"
      />

      <div className="px-4 sm:px-6 py-6">
        <EmptyState
          icon={ClipboardCheck}
          title="Internal Ops Module Coming Soon"
          description="Internal operations and compliance management will be available in a future update"
        />
      </div>
    </div>
  );
}