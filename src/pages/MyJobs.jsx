import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';
import {
  Play,
  Camera,
  Clock,
  CheckCircle,
  MapPin,
  Building2,
  Phone,
  Navigation,
  AlertTriangle,
  Plus,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { cn } from '@/lib/utils';

export default function MyJobs() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  
  const [timeEntry, setTimeEntry] = useState({ minutes: 30, type: 'Labour', notes: '' });
  const [noteEntry, setNoteEntry] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [signatureStatus, setSignatureStatus] = useState('Not Possible');
  const [signatureReason, setSignatureReason] = useState('');

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: employeeProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.EmployeeProfile.filter({ email: currentUser?.email }).then(r => r[0]),
    enabled: !!currentUser?.email
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['myJobs', employeeProfile?.id],
    queryFn: () => base44.entities.Job.filter({ 
      assignedPrimary: employeeProfile?.id 
    }),
    enabled: !!employeeProfile?.id
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

  const customerMap = useMemo(() => customers.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}), [customers]);
  const siteMap = useMemo(() => sites.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}), [sites]);
  const contactMap = useMemo(() => contacts.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}), [contacts]);

  const activeJobs = useMemo(() => {
    return jobs.filter(j => !['Completed', 'Closed', 'Cancelled'].includes(j.status))
      .sort((a, b) => {
        // Sort by priority then due date
        const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0;
      });
  }, [jobs]);

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Job.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJobs'] });
    }
  });

  const createTimeMutation = useMutation({
    mutationFn: (data) => base44.entities.TimeEntry.create(data),
    onSuccess: () => {
      setShowTimeDialog(false);
      setTimeEntry({ minutes: 30, type: 'Labour', notes: '' });
    }
  });

  const handleStartJob = (job) => {
    updateJobMutation.mutate({
      id: job.id,
      data: { status: 'In Progress' }
    });
    base44.entities.ActivityLog.create({
      entityType: 'Job',
      entityId: job.id,
      activityType: 'Status Change',
      description: 'started the job',
      previousValue: job.status,
      newValue: 'In Progress'
    });
  };

  const handleAddTime = () => {
    if (!selectedJob) return;
    createTimeMutation.mutate({
      job: selectedJob.id,
      employee: employeeProfile?.id,
      date: new Date().toISOString().split('T')[0],
      ...timeEntry
    });
  };

  const handleComplete = () => {
    if (!selectedJob) return;
    updateJobMutation.mutate({
      id: selectedJob.id,
      data: {
        status: 'Completed',
        completionNotes,
        signatureStatus,
        signatureNotPossibleReason: signatureStatus === 'Not Possible' ? signatureReason : null
      }
    });
    base44.entities.ActivityLog.create({
      entityType: 'Job',
      entityId: selectedJob.id,
      activityType: 'Completed',
      description: 'completed the job',
      newValue: 'Completed'
    });
    setShowCompleteDialog(false);
    setCompletionNotes('');
    setSignatureReason('');
  };

  const isOverdue = (job) => {
    return job.dueDate && 
      new Date(job.dueDate) < new Date() && 
      !['Completed', 'Closed', 'Cancelled'].includes(job.status);
  };

  const openMaps = (address) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://maps.google.com/maps?q=${encoded}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading your jobs..." />
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageHeader
        title="My Jobs"
        subtitle={`${activeJobs.length} active job${activeJobs.length !== 1 ? 's' : ''}`}
      />

      <div className="px-4 py-6">
        {activeJobs.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="No jobs assigned"
            description="You don't have any active jobs right now"
          />
        ) : (
          <div className="space-y-4">
            {activeJobs.map(job => {
              const customer = customerMap[job.customer];
              const site = siteMap[job.site];
              const contact = contactMap[job.primaryContact];
              const overdue = isOverdue(job);

              return (
                <Card 
                  key={job.id}
                  className={cn(
                    "overflow-hidden",
                    overdue && "border-red-300 bg-red-50/50"
                  )}
                >
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="p-4 border-b">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg">{job.jobNumber}</span>
                            <PriorityBadge priority={job.priority} size="xs" />
                          </div>
                          <StatusBadge status={job.status} size="sm" />
                          {overdue && (
                            <Badge variant="destructive" className="ml-2 gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline">{job.jobType}</Badge>
                      </div>
                      
                      {job.description && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                    </div>

                    {/* Location Info */}
                    <div className="p-4 bg-slate-50 space-y-3">
                      {customer && (
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-slate-400 flex-shrink-0" />
                          <span className="font-medium">{customer.name}</span>
                        </div>
                      )}
                      
                      {site && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{site.siteName}</p>
                            <p className="text-sm text-slate-500">{site.address}</p>
                            {site.accessNotes && (
                              <p className="text-sm text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded">
                                📋 {site.accessNotes}
                              </p>
                            )}
                          </div>
                          {site.address && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openMaps(site.address)}
                              className="flex-shrink-0"
                            >
                              <Navigation className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}

                      {contact && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-slate-400 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="font-medium">{contact.name}</span>
                            {contact.role && <span className="text-slate-500 text-sm ml-2">({contact.role})</span>}
                          </div>
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`}>
                              <Button size="sm" variant="outline">
                                Call
                              </Button>
                            </a>
                          )}
                        </div>
                      )}

                      {job.dueDate && (
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="h-5 w-5 text-slate-400" />
                          <span className={overdue ? "text-red-600 font-medium" : "text-slate-600"}>
                            Due: {format(new Date(job.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {job.status === 'Assigned' && (
                        <Button
                          onClick={() => handleStartJob(job)}
                          className="col-span-2 h-14 text-lg gap-2 bg-amber-500 hover:bg-amber-600"
                        >
                          <Play className="h-6 w-6" />
                          Start Job
                        </Button>
                      )}

                      {job.status === 'In Progress' && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedJob(job);
                              setShowTimeDialog(true);
                            }}
                            className="h-14 text-base gap-2"
                          >
                            <Clock className="h-5 w-5" />
                            Add Time
                          </Button>
                          
                          <Link to={createPageUrl('JobDetail') + `?id=${job.id}`} className="contents">
                            <Button variant="outline" className="h-14 text-base gap-2">
                              <Camera className="h-5 w-5" />
                              Photos
                            </Button>
                          </Link>

                          <Button
                            onClick={() => {
                              setSelectedJob(job);
                              setShowCompleteDialog(true);
                            }}
                            className="col-span-2 h-14 text-lg gap-2 bg-emerald-500 hover:bg-emerald-600"
                          >
                            <CheckCircle className="h-6 w-6" />
                            Complete Job
                          </Button>
                        </>
                      )}

                      {!['Assigned', 'In Progress'].includes(job.status) && (
                        <Link to={createPageUrl('JobDetail') + `?id=${job.id}`} className="col-span-2">
                          <Button variant="outline" className="w-full h-14 text-base">
                            View Details
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Time Dialog */}
      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Time - {selectedJob?.jobNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 45, 60, 90, 120].map(mins => (
                <Button
                  key={mins}
                  variant={timeEntry.minutes === mins ? "default" : "outline"}
                  onClick={() => setTimeEntry({...timeEntry, minutes: mins})}
                  className="h-14"
                >
                  {mins >= 60 ? `${mins/60}h` : `${mins}m`}
                </Button>
              ))}
            </div>
            <div>
              <Label>Or enter custom</Label>
              <Input
                type="number"
                value={timeEntry.minutes}
                onChange={(e) => setTimeEntry({...timeEntry, minutes: parseInt(e.target.value) || 0})}
                className="mt-1.5"
                placeholder="Minutes"
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
              <Label>Notes (optional)</Label>
              <Textarea
                value={timeEntry.notes}
                onChange={(e) => setTimeEntry({...timeEntry, notes: e.target.value})}
                className="mt-1.5"
                placeholder="What did you work on?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTime} className="bg-indigo-600 hover:bg-indigo-700">
              Log Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Job Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Job - {selectedJob?.jobNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Completion Notes *</Label>
              <Textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="mt-1.5 h-32"
                placeholder="Describe the work completed..."
              />
            </div>
            <div>
              <Label>Customer Signature</Label>
              <Select value={signatureStatus} onValueChange={setSignatureStatus}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                  className="mt-1.5"
                  placeholder="e.g., Customer not on site"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleComplete}
              disabled={!completionNotes || (signatureStatus === 'Not Possible' && !signatureReason)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}