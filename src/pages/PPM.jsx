import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Plus, Calendar, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PPMPlansList from '@/components/ppm/PPMPlansList.jsx';
import PPMInstancesList from '@/components/ppm/PPMInstancesList.jsx';

export default function PPM() {
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['ppmPlans'],
    queryFn: () => base44.entities.PPMPlan.list()
  });

  const { data: instances = [], isLoading: instancesLoading } = useQuery({
    queryKey: ['ppmInstances'],
    queryFn: () => base44.entities.PPMInstance.list()
  });

  const overduePlans = instances.filter(i => i.status === 'Overdue').length;
  const duePlans = instances.filter(i => i.status === 'Due').length;

  if (plansLoading || instancesLoading) {
    return <LoadingSpinner size="lg" text="Loading PPM..." />;
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Preventive Maintenance (PPM)"
        subtitle={`${plans.length} active plans • ${duePlans} due • ${overduePlans} overdue`}
        actions={
          <Link to={createPageUrl('CreatePPMPlan')}>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Plan</span>
            </Button>
          </Link>
        }
      />

      <div className="px-4 sm:px-6 py-6">
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="plans" className="gap-2">
              <ListTodo className="h-4 w-4" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="instances" className="gap-2">
              <Calendar className="h-4 w-4" />
              Instances
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="mt-6">
            <PPMPlansList plans={plans} />
          </TabsContent>

          <TabsContent value="instances" className="mt-6">
            <PPMInstancesList instances={instances} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}