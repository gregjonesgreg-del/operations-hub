import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { routeBuilders } from '@/components/Routes';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import {
  Plus,
  Filter,
  Search,
  ChevronRight,
  Calendar,
  Building2,
  MapPin,
  AlertTriangle,
  LayoutGrid,
  List,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

const JOB_STATUSES = ['Draft', 'Scheduled', 'Assigned', 'In Progress', 'Awaiting Parts', 'Awaiting Customer', 'Completed', 'Closed', 'Cancelled'];
const JOB_TYPES = ['Breakdown', 'Service', 'Install', 'Transport', 'Inspection', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Get initial filter values from URL
  const initialStatus = searchParams.get('status') || 'all';
  const initialPriority = searchParams.get('priority') || 'all';
  const initialType = searchParams.get('type') || 'all';
  const initialCustomer = searchParams.get('customer') || 'all';

  const [filters, setFilters] = useState({
    status: initialStatus,
    priority: initialPriority,
    jobType: initialType,
    customer: initialCustomer,
    team: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
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

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.EmployeeProfile.list()
  });

  const customerMap = useMemo(() => {
    return customers.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
  }, [customers]);

  const siteMap = useMemo(() => {
    return sites.reduce((acc, s) => ({ ...acc, [s.id]: s }), {});
  }, [sites]);

  const teamMap = useMemo(() => {
    return teams.reduce((acc, t) => ({ ...acc, [t.id]: t }), {});
  }, [teams]);

  const employeeMap = useMemo(() => {
    return employees.reduce((acc, e) => ({ ...acc, [e.id]: e }), {});
  }, [employees]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Status filter
      if (filters.status !== 'all' && job.status !== filters.status) return false;
      
      // Priority filter
      if (filters.priority !== 'all' && job.priority !== filters.priority) return false;
      
      // Job type filter
      if (filters.jobType !== 'all' && job.jobType !== filters.jobType) return false;
      
      // Customer filter
      if (filters.customer !== 'all' && job.customer !== filters.customer) return false;
      
      // Team filter
      if (filters.team !== 'all' && job.assignedTeam !== filters.team) return false;
      
      // Date filters
      if (filters.dateFrom && job.dueDate) {
        if (isBefore(parseISO(job.dueDate), parseISO(filters.dateFrom))) return false;
      }
      if (filters.dateTo && job.dueDate) {
        if (isAfter(parseISO(job.dueDate), parseISO(filters.dateTo))) return false;
      }
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const customer = customerMap[job.customer];
        const site = siteMap[job.site];
        
        return (
          job.jobNumber?.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          customer?.name?.toLowerCase().includes(query) ||
          site?.siteName?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [jobs, filters, searchQuery, customerMap, siteMap]);

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'all').length;

  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      jobType: 'all',
      customer: 'all',
      team: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setSearchParams({});
  };

  const isOverdue = (job) => {
    return job.dueDate && 
      new Date(job.dueDate) < new Date() && 
      !['Completed', 'Closed', 'Cancelled'].includes(job.status);
  };

  if (jobsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading jobs..." />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Work Orders"
        subtitle={`${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''}`}
        actions={
          <Link to="/jobs/new">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Job</span>
            </Button>
          </Link>
        }
      >
        {/* Search and Filter Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search jobs, customers, sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-indigo-600">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filter Jobs</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {JOB_STATUSES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Priority</label>
                    <Select value={filters.priority} onValueChange={(v) => setFilters({...filters, priority: v})}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        {PRIORITIES.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Job Type</label>
                    <Select value={filters.jobType} onValueChange={(v) => setFilters({...filters, jobType: v})}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {JOB_TYPES.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Customer</label>
                    <Select value={filters.customer} onValueChange={(v) => setFilters({...filters, customer: v})}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        {customers.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Team</label>
                    <Select value={filters.team} onValueChange={(v) => setFilters({...filters, team: v})}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Teams</SelectItem>
                        {teams.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Due From</label>
                      <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Due To</label>
                      <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button variant="outline" onClick={clearFilters} className="flex-1">
                      Clear All
                    </Button>
                    <Button onClick={() => setFiltersOpen(false)} className="flex-1">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.status !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Status: {filters.status}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, status: 'all'})} />
              </Badge>
            )}
            {filters.priority !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Priority: {filters.priority}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, priority: 'all'})} />
              </Badge>
            )}
            {filters.jobType !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Type: {filters.jobType}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, jobType: 'all'})} />
              </Badge>
            )}
            {filters.customer !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Customer: {customerMap[filters.customer]?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, customer: 'all'})} />
              </Badge>
            )}
            <Button variant="link" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
              Clear all
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        {filteredJobs.length === 0 ? (
           <EmptyState
             icon={Search}
             title="No jobs found"
             description={searchQuery || activeFiltersCount > 0 
               ? "Try adjusting your search or filters"
               : "Create your first job to get started"
             }
             action={searchQuery || activeFiltersCount > 0 ? clearFilters : undefined}
             actionLabel={searchQuery || activeFiltersCount > 0 ? "Clear Filters" : undefined}
           />
         ) : viewMode === 'list' ? (
           <div className="space-y-3">
             {filteredJobs.map(job => {
               const customer = customerMap[job.customer];
               const site = siteMap[job.site];
               const assignedEmployee = employeeMap[job.assignedPrimary];
               const overdue = isOverdue(job);

               return (
                 <Link key={job.id} to={routeBuilders.jobDetail(job.id)}>
                  <Card className={cn(
                    "hover:shadow-md transition-all cursor-pointer",
                    overdue && "border-red-200 bg-red-50/30"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900">
                              {job.jobNumber || 'Draft'}
                            </span>
                            <PriorityBadge priority={job.priority} size="xs" />
                            <StatusBadge status={job.status} size="xs" />
                            {overdue && (
                              <Badge variant="destructive" className="gap-1 text-xs">
                                <AlertTriangle className="h-3 w-3" />
                                Overdue
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                            {job.description || job.jobType}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                            {customer && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {customer.name}
                              </span>
                            )}
                            {site && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {site.siteName}
                              </span>
                            )}
                            {job.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due: {format(new Date(job.dueDate), 'MMM d')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map(job => {
              const customer = customerMap[job.customer];
              const site = siteMap[job.site];
              const overdue = isOverdue(job);

              return (
               <Link key={job.id} to={routeBuilders.jobDetail(job.id)}>
                 <Card className={cn(
                   "hover:shadow-md transition-all cursor-pointer h-full",
                    overdue && "border-red-200 bg-red-50/30"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-slate-900">
                          {job.jobNumber || 'Draft'}
                        </span>
                        <PriorityBadge priority={job.priority} size="xs" showLabel={false} />
                      </div>
                      
                      <StatusBadge status={job.status} size="xs" />
                      
                      {overdue && (
                        <Badge variant="destructive" className="gap-1 text-xs ml-2">
                          <AlertTriangle className="h-3 w-3" />
                          Overdue
                        </Badge>
                      )}

                      <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                        {job.description || job.jobType}
                      </p>

                      <div className="mt-4 pt-3 border-t space-y-1.5 text-xs text-slate-500">
                        {customer && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3 w-3" />
                            {customer.name}
                          </div>
                        )}
                        {site && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            {site.siteName}
                          </div>
                        )}
                        {job.dueDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            Due: {format(new Date(job.dueDate), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}