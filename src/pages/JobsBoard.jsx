import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { routeBuilders } from '@/components/Routes';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusOrder = {
  'Scheduled': 0,
  'Assigned': 1,
  'In Progress': 2,
  'Awaiting Parts': 3,
  'Awaiting Customer': 4,
  'Completed': 5,
  'Closed': 6,
};

export default function JobsBoardPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', 'board'],
    queryFn: () => base44.entities.Job.filter({}, '-updated_date', 100),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown';
  };

  // Group jobs by status
  const groupedJobs = Object.keys(statusOrder).reduce((acc, status) => {
    acc[status] = jobs.filter(job => job.status === status);
    return acc;
  }, {});

  // Filter based on selection
  const displayedStatuses = statusFilter === 'all' 
    ? Object.keys(statusOrder)
    : [statusFilter];

  if (isLoading) {
    return <LoadingSpinner text="Loading job board..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Jobs Board"
        subtitle="Kanban view of jobs by status"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.keys(statusOrder).map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link to="/jobs/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                New Job
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedStatuses.map(status => (
            <div key={status} className="space-y-4">
              <div className="sticky top-24">
                <h3 className="font-semibold text-sm text-slate-600 uppercase tracking-wide px-2">
                  {status}
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    ({groupedJobs[status]?.length || 0})
                  </span>
                </h3>
              </div>

              <div className="space-y-3 min-h-96">
                {groupedJobs[status]?.length > 0 ? (
                  groupedJobs[status].map(job => (
                    <Link
                      key={job.id}
                      to={routeBuilders.jobDetail(job.id)}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4 space-y-2">
                          <div className="space-y-1">
                            <p className="font-semibold text-sm text-slate-900">
                              {job.jobNumber || 'Job'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {getCustomerName(job.customer)}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {job.priority && (
                              <PriorityBadge 
                                priority={job.priority} 
                                size="sm"
                                showLabel={false}
                              />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {job.jobType || 'Job'}
                            </Badge>
                          </div>

                          {job.dueDate && (
                            <p className="text-xs text-slate-500">
                              Due: {new Date(job.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-400">No jobs</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <EmptyState
            icon={Plus}
            title="No jobs yet"
            description="Create your first job to get started"
          />
        )}
      </div>
    </div>
  );
}