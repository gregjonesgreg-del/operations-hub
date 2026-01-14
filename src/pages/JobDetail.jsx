import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import { routeBuilders, ROUTES } from '@/components/Routes';
import { format } from 'date-fns';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  User,
  Package,
  Phone,
  AlertTriangle,
  Camera,
  Plus,
  Check,
  Edit2,
  Play,
  Pause,
  CheckCircle,
  FileText,
  Wrench,
  PenLine,
  Users as UsersIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ActivityTimeline from '@/components/ActivityTimeline';
import { cn } from '@/lib/utils';

const JOB_STATUSES = ['Draft', 'Scheduled', 'Assigned', 'In Progress', 'Awaiting Parts', 'Awaiting Customer', 'Completed', 'Closed', 'Cancelled'];

export default function JobDetail() {
  const { jobId } = useParams();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [showPartDialog, setShowPartDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  
  const [newStatus, setNewStatus] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [signatureStatus, setSignatureStatus] = useState('Pending');
  const [signatureReason, setSignatureReason] = useState('');
  
  const [timeEntry, setTimeEntry] = useState({ minutes: 30, type: 'Labour', notes: '' });
  const [partEntry, setPartEntry] = useState({ partName: '', qty: 1, source: 'Van', notes: '' });
  const [taskEntry, setTaskEntry] = useState({ title: '', taskType: 'Checklist', required: false, photoRequired: false });

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => base44.entities.Job.filter({ id: jobId }).then(r => r[0]),
    enabled: !!jobId
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list()
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list()
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list()
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list()
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.EmployeeProfile.list()
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['jobTasks', jobId],
    queryFn: () => base44.entities.JobTask.filter({ job: jobId }),
    enabled: !!jobId
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ['timeEntries', jobId],
    queryFn: () => base44.entities.TimeEntry.filter({ job: jobId }),
    enabled: !!jobId
  });

  const { data: partsUsed = [] } = useQuery({
    queryKey: ['partsUsed', jobId],
    queryFn: () => base44.entities.PartsUsage.filter({ job: jobId }),
    enabled: !!jobId
  });

  const customer = customers.find(c => c.id === job?.customer);
  const site = sites.find(s => s.id === job?.site);
  const contact = contacts.find(c => c.id === job?.primaryContact);
  const asset = assets.find(a => a.id === job?.asset);
  const assignee = employees.find(e => e.id === job?.assignedPrimary);
  const team = teams.find(t => t.id === job?.assignedTeam);

  const totalMinutes = useMemo(() => {
    return timeEntries.reduce((sum, t) => sum + (t.minutes || 0), 0);
  }, [timeEntries]);

  const updateJobMutation = useMutation({
    mutationFn: (data) => base44.entities.Job.update(jobId, data),
    onSuccess: (_, variables) => {
      // Log activity
      if (variables.status && variables.status !== job?.status) {
        base44.entities.ActivityLog.create({
          entityType: 'Job',
          entityId: jobId,
          activityType: 'Status Change',
          description: `changed status`,
          previousValue: job?.status,
          newValue: variables.status
        });
      }
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      setShowStatusDialog(false);
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.JobTask.create({ ...data, job: jobId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTasks', jobId] });
      setShowTaskDialog(false);
      setTaskEntry({ title: '', taskType: 'Checklist', required: false, photoRequired: false });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JobTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTasks', jobId] });
    }
  });

  const createTimeMutation = useMutation({
    mutationFn: (data) => base44.entities.TimeEntry.create({ 
      ...data, 
      job: jobId,
      date: new Date().toISOString().split('T')[0]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', jobId] });
      setShowTimeDialog(false);
      setTimeEntry({ minutes: 30, type: 'Labour', notes: '' });
    }
  });

  const createPartMutation = useMutation({
    mutationFn: (data) => base44.entities.PartsUsage.create({ ...data, job: jobId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partsUsed', jobId] });
      setShowPartDialog(false);
      setPartEntry({ partName: '', qty: 1, source: 'Van', notes: '' });
    }
  });

  const handleStatusChange = () => {
    const updateData = { status: newStatus };
    
    if (newStatus === 'Completed') {
      updateData.completionNotes = completionNotes;
      updateData.signatureStatus = signatureStatus;
      if (signatureStatus === 'Not Possible') {
        updateData.signatureNotPossibleReason = signatureReason;
      }
    }
    
    updateJobMutation.mutate(updateData);
  };

  const isOverdue = job?.dueDate && 
    new Date(job.dueDate) < new Date() && 
    !['Completed', 'Closed', 'Cancelled'].includes(job?.status);

  if (jobLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading job..." />
      </div>
    );
  }

  if (!job) {
    return (
      <EmptyState
        icon={Wrench}
        title="Job not found"
        description="The job you're looking for doesn't exist"
        action={() => window.history.back()}
        actionLabel="Go Back"
      />
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title={job.jobNumber || 'Draft Job'}
        subtitle={job.description || job.jobType}
        backLink={ROUTES.JOBS}
        backLabel="Back to Jobs"
        actions={
          <div className="flex items-center gap-2">
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Update Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Job Status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>New Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_STATUSES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newStatus === 'Completed' && (
                    <>
                      <div>
                        <Label>Completion Notes *</Label>
                        <Textarea
                          value={completionNotes}
                          onChange={(e) => setCompletionNotes(e.target.value)}
                          placeholder="Summary of work completed..."
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Customer Signature</Label>
                        <Select value={signatureStatus} onValueChange={setSignatureStatus}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Signed">Signed</SelectItem>
                            <SelectItem value="Not Possible">Not Possible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {signatureStatus === 'Not Possible' && (
                        <div>
                          <Label>Reason *</Label>
                          <Input
                            value={signatureReason}
                            onChange={(e) => setSignatureReason(e.target.value)}
                            placeholder="Why signature not possible..."
                            className="mt-1.5"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleStatusChange}
                    disabled={
                      !newStatus ||
                      (newStatus === 'Completed' && !completionNotes) ||
                      (newStatus === 'Completed' && signatureStatus === 'Not Possible' && !signatureReason)
                    }
                  >
                    Update
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {job.status === 'Assigned' && (
              <Button 
                onClick={() => updateJobMutation.mutate({ status: 'In Progress' })}
                className="gap-2 bg-amber-600 hover:bg-amber-700"
              >
                <Play className="h-4 w-4" />
                Start Job
              </Button>
            )}
            {job.status === 'In Progress' && (
              <Button 
                onClick={() => {
                  setNewStatus('Completed');
                  setShowStatusDialog(true);
                }}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="h-4 w-4" />
                Complete
              </Button>
            )}
          </div>
        }
      >
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <StatusBadge status={job.status} />
          <PriorityBadge priority={job.priority} />
          {isOverdue && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </Badge>
          )}
          <Badge variant="outline">{job.jobType}</Badge>
          <Badge variant="outline">{job.workLocation}</Badge>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="time">Time ({timeEntries.length})</TabsTrigger>
            <TabsTrigger value="parts">Parts ({partsUsed.length})</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer & Site */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Location Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {customer && (
                      <Link to={routeBuilders.customerDetail(customer.id)} className="block">
                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-slate-500">Customer</p>
                          </div>
                        </div>
                      </Link>
                    )}

                    {site && (
                      <Link to={routeBuilders.siteDetail(site.id)} className="block">
                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">{site.siteName}</p>
                            <p className="text-sm text-slate-500">{site.address}</p>
                            {site.accessNotes && (
                              <p className="text-sm text-amber-600 mt-1">{site.accessNotes}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    )}

                    {contact && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-slate-500">{contact.role}</p>
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`} className="text-sm text-indigo-600 flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Description */}
                {(job.description || job.faultDetails) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Work Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {job.description && (
                        <p className="text-slate-700">{job.description}</p>
                      )}
                      {job.faultDetails && (
                        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                          <p className="text-sm font-medium text-red-800 mb-1">Fault Details</p>
                          <p className="text-red-700">{job.faultDetails}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Completion Info */}
                {job.status === 'Completed' && job.completionNotes && (
                  <Card className="border-emerald-200 bg-emerald-50">
                    <CardHeader>
                      <CardTitle className="text-lg text-emerald-800">Completion Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-emerald-700">{job.completionNotes}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <Badge className={
                          job.signatureStatus === 'Signed' 
                            ? 'bg-emerald-600' 
                            : 'bg-amber-600'
                        }>
                          {job.signatureStatus}
                        </Badge>
                        {job.signatureNotPossibleReason && (
                          <span className="text-sm text-slate-600">
                            - {job.signatureNotPossibleReason}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Asset */}
                {asset && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Asset</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Link to={routeBuilders.assetDetail(asset.id)}>
                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{asset.make} {asset.model}</p>
                            <p className="text-sm text-slate-500">{asset.internalAssetId}</p>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {/* Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {job.dueDate && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Due Date</p>
                          <p className="font-medium">{format(new Date(job.dueDate), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                    )}
                    {job.scheduledDate && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Scheduled</p>
                          <p className="font-medium">
                            {format(new Date(job.scheduledDate), 'MMM d, yyyy')}
                            {job.scheduledTime && ` (${job.scheduledTime})`}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Assignment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assignment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {team && (
                       <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                           <UsersIcon className="h-4 w-4 text-indigo-600" />
                         </div>
                         <div>
                           <p className="text-sm text-slate-500">Team</p>
                           <p className="font-medium">{team.name}</p>
                         </div>
                       </div>
                     )}
                    {assignee && (
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Primary</p>
                          <p className="font-medium">{assignee.displayName}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Time</span>
                        <span className="font-medium">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Parts Used</span>
                        <span className="font-medium">{partsUsed.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tasks</span>
                        <span className="font-medium">
                          {tasks.filter(t => t.status === 'Done').length}/{tasks.length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Job Tasks</CardTitle>
                <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Task Title</Label>
                        <Input
                          value={taskEntry.title}
                          onChange={(e) => setTaskEntry({...taskEntry, title: e.target.value})}
                          placeholder="Enter task description..."
                          className="mt-1.5"
                        />
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={taskEntry.required}
                            onChange={(e) => setTaskEntry({...taskEntry, required: e.target.checked})}
                          />
                          <span className="text-sm">Required</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={taskEntry.photoRequired}
                            onChange={(e) => setTaskEntry({...taskEntry, photoRequired: e.target.checked})}
                          />
                          <span className="text-sm">Photo Required</span>
                        </label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowTaskDialog(false)}>Cancel</Button>
                      <Button onClick={() => createTaskMutation.mutate(taskEntry)} disabled={!taskEntry.title}>
                        Add Task
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No tasks yet"
                    description="Add tasks to track work items"
                  />
                ) : (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                          task.status === 'Done' ? "bg-emerald-50 border-emerald-200" : "hover:bg-slate-50"
                        )}
                      >
                        <button
                          onClick={() => updateTaskMutation.mutate({
                            id: task.id,
                            data: { 
                              status: task.status === 'Done' ? 'Open' : 'Done',
                              completedAt: task.status === 'Done' ? null : new Date().toISOString()
                            }
                          })}
                          className={cn(
                            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                            task.status === 'Done'
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 hover:border-indigo-500"
                          )}
                        >
                          {task.status === 'Done' && <Check className="h-4 w-4" />}
                        </button>
                        <div className="flex-1">
                          <p className={cn(
                            "font-medium",
                            task.status === 'Done' && "line-through text-slate-500"
                          )}>
                            {task.title}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {task.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                            {task.photoRequired && <Badge variant="outline" className="text-xs">Photo</Badge>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Time Entries</CardTitle>
                <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Time
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log Time</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={timeEntry.minutes}
                          onChange={(e) => setTimeEntry({...timeEntry, minutes: parseInt(e.target.value) || 0})}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select value={timeEntry.type} onValueChange={(v) => setTimeEntry({...timeEntry, type: v})}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Labour">Labour</SelectItem>
                            <SelectItem value="Travel">Travel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={timeEntry.notes}
                          onChange={(e) => setTimeEntry({...timeEntry, notes: e.target.value})}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowTimeDialog(false)}>Cancel</Button>
                      <Button onClick={() => createTimeMutation.mutate(timeEntry)}>
                        Log Time
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {timeEntries.length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title="No time logged"
                    description="Log time spent on this job"
                  />
                ) : (
                  <div className="space-y-2">
                    {timeEntries.map(entry => {
                      const emp = employees.find(e => e.id === entry.employee);
                      return (
                        <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            entry.type === 'Travel' ? "bg-blue-100" : "bg-amber-100"
                          )}>
                            <Clock className={cn(
                              "h-5 w-5",
                              entry.type === 'Travel' ? "text-blue-600" : "text-amber-600"
                            )} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{entry.minutes} minutes</p>
                            <p className="text-sm text-slate-500">
                              {entry.type} • {entry.date && format(new Date(entry.date), 'MMM d')}
                            </p>
                          </div>
                          <Badge variant="outline">{entry.type}</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parts" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Parts Used</CardTitle>
                <Dialog open={showPartDialog} onOpenChange={setShowPartDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Part
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Part</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Part Name</Label>
                        <Input
                          value={partEntry.partName}
                          onChange={(e) => setPartEntry({...partEntry, partName: e.target.value})}
                          placeholder="Enter part name..."
                          className="mt-1.5"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={partEntry.qty}
                            onChange={(e) => setPartEntry({...partEntry, qty: parseInt(e.target.value) || 1})}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Source</Label>
                          <Select value={partEntry.source} onValueChange={(v) => setPartEntry({...partEntry, source: v})}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Van">Van Stock</SelectItem>
                              <SelectItem value="Workshop">Workshop</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={partEntry.notes}
                          onChange={(e) => setPartEntry({...partEntry, notes: e.target.value})}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPartDialog(false)}>Cancel</Button>
                      <Button onClick={() => createPartMutation.mutate(partEntry)} disabled={!partEntry.partName}>
                        Add Part
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {partsUsed.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No parts logged"
                    description="Log parts used on this job"
                  />
                ) : (
                  <div className="space-y-2">
                    {partsUsed.map(part => (
                      <div key={part.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{part.partName}</p>
                          <p className="text-sm text-slate-500">
                            Qty: {part.qty} • From: {part.source}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Photos & Signature</CardTitle>
                <Button size="sm" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Add Photo
                </Button>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Camera}
                  title="No photos yet"
                  description="Add photos to document the work"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTimeline entityType="Job" entityId={jobId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}