import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Plus, AlertTriangle, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import InternalTasksList from '@/components/internalops/InternalTasksList';
import IncidentsList from '@/components/internalops/IncidentsList';

export default function InternalOps() {
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['internalTasks'],
    queryFn: () => base44.entities.InternalTask.list()
  });

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.IncidentNearMiss.list()
  });

  const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;
  const highIncidents = incidents.filter(i => i.severity === 'High').length;

  if (tasksLoading || incidentsLoading) {
    return <LoadingSpinner size="lg" text="Loading Internal Ops..." />;
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Internal Ops & Compliance"
        subtitle={`${overdueTasks} overdue tasks • ${highIncidents} high severity incidents`}
        actions={
          <div className="flex gap-2">
            <Link to={createPageUrl('CreateInternalTask')}>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Task</span>
              </Button>
            </Link>
            <Link to={createPageUrl('ReportIncident')}>
              <Button className="gap-2 bg-red-600 hover:bg-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Report Incident</span>
              </Button>
            </Link>
          </div>
        }
      />

      <div className="px-4 sm:px-6 py-6">
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="incidents" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Incidents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-6">
            <InternalTasksList tasks={tasks} />
          </TabsContent>

          <TabsContent value="incidents" className="mt-6">
            <IncidentsList incidents={incidents} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}