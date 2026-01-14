import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import {
  Building2,
  MapPin,
  Calendar,
  AlertTriangle,
  Plus,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import PriorityBadge from '@/components/ui/PriorityBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const BOARD_COLUMNS = [
  { id: 'Draft', label: 'Draft', color: 'bg-slate-500' },
  { id: 'Scheduled', label: 'Scheduled', color: 'bg-blue-500' },
  { id: 'Assigned', label: 'Assigned', color: 'bg-indigo-500' },
  { id: 'In Progress', label: 'In Progress', color: 'bg-amber-500' },
  { id: 'Awaiting Parts', label: 'Awaiting Parts', color: 'bg-orange-500' },
  { id: 'Completed', label: 'Completed', color: 'bg-emerald-500' }
];

export default function JobsBoard() {
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.filter({}, '-created_date', 500)
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list()
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list()
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.EmployeeProfile.list()
  });

  const customerMap = useMemo(() => customers.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}), [customers]);
  const siteMap = useMemo(() => sites.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}), [sites]);
  const employeeMap = useMemo(() => employees.reduce((acc, e) => ({ ...acc, [e.id]: e }), {}), [employees]);

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Job.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
  });

  const jobsByStatus = useMemo(() => {
    const grouped = {};
    BOARD_COLUMNS.forEach(col => {
      grouped[col.id] = jobs.filter(j => j.status === col.id);
    });
    return grouped;
  }, [jobs]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    
    updateJobMutation.mutate({
      id: draggableId,
      data: { status: newStatus }
    });
  };

  const isOverdue = (job) => {
    return job.dueDate && 
      new Date(job.dueDate) < new Date() && 
      !['Completed', 'Closed', 'Cancelled'].includes(job.status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading jobs board..." />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="Jobs Board"
        subtitle="Drag and drop to update status"
        actions={
          <Link to={createPageUrl('CreateJob')}>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Job</span>
            </Button>
          </Link>
        }
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 p-4 min-w-max h-full">
            {BOARD_COLUMNS.map(column => (
              <div key={column.id} className="w-72 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("h-3 w-3 rounded-full", column.color)} />
                  <h3 className="font-semibold text-slate-700">{column.label}</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {jobsByStatus[column.id]?.length || 0}
                  </Badge>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 rounded-xl p-2 space-y-2 overflow-y-auto",
                        snapshot.isDraggingOver ? "bg-indigo-50" : "bg-slate-100"
                      )}
                    >
                      {jobsByStatus[column.id]?.map((job, index) => {
                        const customer = customerMap[job.customer];
                        const site = siteMap[job.site];
                        const assignee = employeeMap[job.assignedPrimary];
                        const overdue = isOverdue(job);

                        return (
                          <Draggable key={job.id} draggableId={job.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Link to={createPageUrl('JobDetail') + `?id=${job.id}`}>
                                  <Card className={cn(
                                    "cursor-pointer transition-shadow hover:shadow-md",
                                    snapshot.isDragging && "shadow-lg",
                                    overdue && "border-red-300 bg-red-50"
                                  )}>
                                    <CardContent className="p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm text-slate-900">
                                          {job.jobNumber || 'Draft'}
                                        </span>
                                        <PriorityBadge priority={job.priority} size="xs" showLabel={false} />
                                      </div>

                                      {overdue && (
                                        <Badge variant="destructive" className="gap-1 text-xs mb-2">
                                          <AlertTriangle className="h-3 w-3" />
                                          Overdue
                                        </Badge>
                                      )}

                                      <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                        {job.description || job.jobType}
                                      </p>

                                      <div className="space-y-1 text-xs text-slate-500">
                                        {customer && (
                                          <div className="flex items-center gap-1 truncate">
                                            <Building2 className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate">{customer.name}</span>
                                          </div>
                                        )}
                                        {site && (
                                          <div className="flex items-center gap-1 truncate">
                                            <MapPin className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate">{site.siteName}</span>
                                          </div>
                                        )}
                                        {assignee && (
                                          <div className="flex items-center gap-1 truncate">
                                            <User className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate">{assignee.displayName}</span>
                                          </div>
                                        )}
                                        {job.dueDate && (
                                          <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 flex-shrink-0" />
                                            {format(new Date(job.dueDate), 'MMM d')}
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </Link>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}