import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { format, subDays, startOfWeek, startOfMonth, isAfter, isBefore } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users as UsersIcon,
  TrendingUp,
  ArrowRight,
  Calendar,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs-dashboard'],
    queryFn: () => base44.entities.Job.filter({}, '-created_date', 500)
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.EmployeeProfile.filter({}, '-created_date', 100)
  });

  const today = new Date();
  const weekStart = startOfWeek(today);
  const monthStart = startOfMonth(today);

  // Calculate stats
  const overdueJobs = jobs.filter(j => 
    j.dueDate && 
    new Date(j.dueDate) < today && 
    !['Completed', 'Closed', 'Cancelled'].includes(j.status)
  );

  const urgentJobs = jobs.filter(j => 
    j.priority === 'Urgent' && 
    !['Completed', 'Closed', 'Cancelled'].includes(j.status)
  );

  const inProgressJobs = jobs.filter(j => j.status === 'In Progress');
  const completedThisWeek = jobs.filter(j => 
    j.status === 'Completed' && 
    j.updated_date && 
    new Date(j.updated_date) >= weekStart
  );

  const createdThisMonth = jobs.filter(j => 
    j.created_date && new Date(j.created_date) >= monthStart
  );

  // Jobs by status for pie chart
  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value
  }));

  // Jobs by type
  const typeCounts = jobs.reduce((acc, job) => {
    acc[job.jobType] = (acc[job.jobType] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(typeCounts).map(([name, value]) => ({
    name,
    value
  }));

  // Workload by team
  const teamWorkload = teams.map(team => {
    const teamJobs = jobs.filter(j => 
      j.assignedTeam === team.id && 
      !['Completed', 'Closed', 'Cancelled'].includes(j.status)
    );
    return {
      name: team.name,
      active: teamJobs.length,
      overdue: teamJobs.filter(j => j.dueDate && new Date(j.dueDate) < today).length
    };
  });

  // Recent jobs
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  if (jobsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader 
        title="Dashboard" 
        subtitle={format(today, 'EEEE, MMMM d, yyyy')}
      />

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Active Jobs</p>
                  <p className="text-3xl font-bold mt-1">
                    {jobs.filter(j => !['Completed', 'Closed', 'Cancelled'].includes(j.status)).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Wrench className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-0",
            overdueJobs.length > 0 
              ? "bg-gradient-to-br from-red-500 to-red-600 text-white"
              : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
          )}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Overdue</p>
                  <p className="text-3xl font-bold mt-1">{overdueJobs.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold mt-1">{inProgressJobs.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Completed (Week)</p>
                  <p className="text-3xl font-bold mt-1">{completedThisWeek.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Jobs Alert */}
        {urgentJobs.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-800">
                    {urgentJobs.length} Urgent Job{urgentJobs.length !== 1 ? 's' : ''} Require Attention
                  </p>
                  <p className="text-sm text-red-600">
                    High priority items need immediate action
                  </p>
                </div>
                <Link to={createPageUrl('Jobs') + '?priority=Urgent'}>
                  <Button variant="destructive" size="sm">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Jobs by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jobs by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {statusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-sm">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-slate-600">{entry.name}</span>
                    <span className="font-medium">({entry.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Jobs by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jobs by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Workload */}
        {teamWorkload.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Workload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamWorkload}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="active" name="Active Jobs" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Jobs</CardTitle>
            <Link to={createPageUrl('Jobs')}>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentJobs.map(job => (
                <Link
                  key={job.id}
                  to={createPageUrl('JobDetail') + `?id=${job.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 truncate">
                        {job.jobNumber || 'New Job'}
                      </p>
                      <PriorityBadge priority={job.priority} showLabel={false} size="xs" />
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {job.description || job.jobType}
                    </p>
                  </div>
                  <StatusBadge status={job.status} size="xs" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to={createPageUrl('CreateJob')}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="font-medium text-sm">Create Job</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('JobsBoard')}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <p className="font-medium text-sm">Jobs Board</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Assets')}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <p className="font-medium text-sm">Assets</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Customers')}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="font-medium text-sm">Customers</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}