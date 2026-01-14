import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useParams } from 'react-router-dom';
import AppLink from '@/components/AppLink';
import { routeBuilders, ROUTES } from '@/components/Routes';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Plus,
  Edit2,
  User,
  Wrench,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ActivityTimeline from '@/components/ActivityTimeline';
import { cn } from '@/lib/utils';

export default function CustomerDetail() {
  const { customerId } = useParams();
  const queryClient = useQueryClient();
  
  const [showSiteDialog, setShowSiteDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const [newSite, setNewSite] = useState({ siteName: '', address: '', accessNotes: '', siteRiskNotes: '' });
  const [newContact, setNewContact] = useState({ name: '', role: '', phone: '', email: '', preferredContactMethod: 'Phone' });
  const [editData, setEditData] = useState({});

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => base44.entities.Customer.filter({ id: customerId }).then(r => r[0]),
    enabled: !!customerId
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites', customerId],
    queryFn: () => base44.entities.Site.filter({ customer: customerId }),
    enabled: !!customerId
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', customerId],
    queryFn: () => base44.entities.Contact.filter({ customer: customerId }),
    enabled: !!customerId
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['customerJobs', customerId],
    queryFn: () => base44.entities.Job.filter({ customer: customerId }),
    enabled: !!customerId
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.update(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      setShowEditDialog(false);
    }
  });

  const createSiteMutation = useMutation({
    mutationFn: (data) => base44.entities.Site.create({ ...data, customer: customerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites', customerId] });
      setShowSiteDialog(false);
      setNewSite({ siteName: '', address: '', accessNotes: '', siteRiskNotes: '' });
    }
  });

  const createContactMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create({ ...data, customer: customerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', customerId] });
      setShowContactDialog(false);
      setNewContact({ name: '', role: '', phone: '', email: '', preferredContactMethod: 'Phone' });
    }
  });

  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 5);
  }, [jobs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!customer) {
    return (
      <EmptyState
        icon={Building2}
        title="Customer not found"
        description="The customer you're looking for doesn't exist"
      />
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title={customer.name}
        subtitle={customer.billingAddress?.split('\n')[0]}
        backLink="Customers"
        backLabel="Customers"
        actions={
          <Dialog open={showEditDialog} onOpenChange={(open) => {
            if (open) setEditData(customer);
            setShowEditDialog(open);
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={editData.name || ''}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editData.status || 'Active'} onValueChange={(v) => setEditData({...editData, status: v})}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Billing Address</Label>
                  <Textarea
                    value={editData.billingAddress || ''}
                    onChange={(e) => setEditData({...editData, billingAddress: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={editData.primaryPhone || ''}
                      onChange={(e) => setEditData({...editData, primaryPhone: e.target.value})}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={editData.primaryEmail || ''}
                      onChange={(e) => setEditData({...editData, primaryEmail: e.target.value})}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                <Button onClick={() => updateMutation.mutate(editData)}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="flex items-center gap-2 mt-4">
          <StatusBadge status={customer.status} />
          <span className="text-sm text-slate-500">
            {sites.length} site{sites.length !== 1 ? 's' : ''} • {contacts.length} contact{contacts.length !== 1 ? 's' : ''} • {jobs.length} job{jobs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sites">Sites ({sites.length})</TabsTrigger>
            <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
            <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customer.billingAddress && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Billing Address</p>
                        <p className="whitespace-pre-line">{customer.billingAddress}</p>
                      </div>
                    </div>
                  )}
                  {customer.primaryPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Phone</p>
                        <a href={`tel:${customer.primaryPhone}`} className="text-indigo-600">
                          {customer.primaryPhone}
                        </a>
                      </div>
                    </div>
                  )}
                  {customer.primaryEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <a href={`mailto:${customer.primaryEmail}`} className="text-indigo-600">
                          {customer.primaryEmail}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{customer.notes || 'No notes'}</p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Jobs</CardTitle>
                  <AppLink to={ROUTES.JOBS_CREATE}>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Job
                    </Button>
                  </AppLink>
                </CardHeader>
                <CardContent>
                  {recentJobs.length === 0 ? (
                    <EmptyState
                      icon={Wrench}
                      title="No jobs yet"
                      description="Create a job for this customer"
                    />
                  ) : (
                    <div className="space-y-2">
                      {recentJobs.map(job => (
                        <AppLink key={job.id} to={routeBuilders.jobDetail(job.id)}>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <Wrench className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{job.jobNumber || 'Draft'}</p>
                              <p className="text-sm text-slate-500 truncate">{job.description || job.jobType}</p>
                            </div>
                            <StatusBadge status={job.status} size="xs" />
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </div>
                          </AppLink>
                          ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sites" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Sites</CardTitle>
                <Dialog open={showSiteDialog} onOpenChange={setShowSiteDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Site
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Site</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Site Name *</Label>
                        <Input
                          value={newSite.siteName}
                          onChange={(e) => setNewSite({...newSite, siteName: e.target.value})}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Textarea
                          value={newSite.address}
                          onChange={(e) => setNewSite({...newSite, address: e.target.value})}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Access Notes</Label>
                        <Textarea
                          value={newSite.accessNotes}
                          onChange={(e) => setNewSite({...newSite, accessNotes: e.target.value})}
                          placeholder="Gate codes, parking, reception..."
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Risk Notes</Label>
                        <Textarea
                          value={newSite.siteRiskNotes}
                          onChange={(e) => setNewSite({...newSite, siteRiskNotes: e.target.value})}
                          placeholder="H&S considerations..."
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSiteDialog(false)}>Cancel</Button>
                      <Button onClick={() => createSiteMutation.mutate(newSite)} disabled={!newSite.siteName}>
                        Add Site
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {sites.length === 0 ? (
                  <EmptyState icon={MapPin} title="No sites" description="Add a site for this customer" />
                ) : (
                  <div className="space-y-2">
                    {sites.map(site => (
                      <AppLink key={site.id} to={routeBuilders.siteDetail(site.id)}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{site.siteName}</p>
                            <p className="text-sm text-slate-500 truncate">{site.address}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </AppLink>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Contacts</CardTitle>
                <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Contact
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Contact</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Name *</Label>
                        <Input
                          value={newContact.name}
                          onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Input
                          value={newContact.role}
                          onChange={(e) => setNewContact({...newContact, role: e.target.value})}
                          placeholder="e.g. Site Manager"
                          className="mt-1.5"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={newContact.phone}
                            onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            value={newContact.email}
                            onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Preferred Contact Method</Label>
                        <Select 
                          value={newContact.preferredContactMethod} 
                          onValueChange={(v) => setNewContact({...newContact, preferredContactMethod: v})}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Phone">Phone</SelectItem>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="SMS">SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowContactDialog(false)}>Cancel</Button>
                      <Button onClick={() => createContactMutation.mutate(newContact)} disabled={!newContact.name}>
                        Add Contact
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {contacts.length === 0 ? (
                  <EmptyState icon={User} title="No contacts" description="Add a contact for this customer" />
                ) : (
                  <div className="space-y-2">
                    {contacts.map(contact => (
                      <div key={contact.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-slate-500">{contact.role}</p>
                        </div>
                        <div className="flex gap-2">
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`}>
                              <Button size="sm" variant="outline">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                          {contact.email && (
                            <a href={`mailto:${contact.email}`}>
                              <Button size="sm" variant="outline">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">All Jobs</CardTitle>
                <AppLink to={ROUTES.JOBS_CREATE}>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Job
                  </Button>
                </AppLink>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <EmptyState icon={Wrench} title="No jobs" description="Create a job for this customer" />
                ) : (
                  <div className="space-y-2">
                    {jobs.map(job => (
                      <AppLink key={job.id} to={routeBuilders.jobDetail(job.id)}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Wrench className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{job.jobNumber || 'Draft'}</p>
                            <p className="text-sm text-slate-500 truncate">{job.description || job.jobType}</p>
                          </div>
                          <StatusBadge status={job.status} size="xs" />
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                        </AppLink>
                        ))}
                        </div>
                        )}
                        </CardContent>
                        </Card>
                        </TabsContent>

                        <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTimeline entityType="Customer" entityId={customerId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}