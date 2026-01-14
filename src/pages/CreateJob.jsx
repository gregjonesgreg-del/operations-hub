import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  MapPin,
  Wrench,
  Package,
  Calendar,
  Users,
  Check,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Customer', icon: Building2 },
  { id: 2, label: 'Site', icon: MapPin },
  { id: 3, label: 'Job Type', icon: Wrench },
  { id: 4, label: 'Asset', icon: Package },
  { id: 5, label: 'Schedule', icon: Calendar },
  { id: 6, label: 'Assign', icon: Users },
  { id: 7, label: 'Review', icon: Check }
];

const JOB_TYPES = [
  { value: 'Breakdown', label: 'Breakdown', desc: 'Emergency equipment repair or fault' },
  { value: 'Service', label: 'Service', desc: 'Scheduled maintenance & cleaning' },
  { value: 'Install', label: 'Install', desc: 'Equipment installation or setup' },
  { value: 'Transport', label: 'Transport', desc: 'Equipment delivery or pickup' },
  { value: 'Inspection', label: 'Inspection', desc: 'Equipment inspection & safety check' },
  { value: 'Other', label: 'Other', desc: 'General work order' }
];

const PRIORITIES = [
  { value: 'Low', color: 'bg-slate-400' },
  { value: 'Medium', color: 'bg-blue-500' },
  { value: 'High', color: 'bg-orange-500' },
  { value: 'Urgent', color: 'bg-red-500' }
];

const WORK_LOCATIONS = [
  { value: 'On-site', label: 'On-site', desc: 'Work at customer location' },
  { value: 'Workshop', label: 'Workshop', desc: 'Bring to workshop' },
  { value: 'Transport', label: 'Transport', desc: 'Delivery/pickup' }
];

export default function CreateJob() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    customer: '',
    site: '',
    primaryContact: '',
    jobType: '',
    workLocation: 'On-site',
    asset: '',
    priority: 'Medium',
    dueDate: '',
    scheduledDate: '',
    scheduledTime: '',
    description: '',
    faultDetails: '',
    riskNotes: '',
    assignedTeam: '',
    assignedPrimary: ''
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.filter({ status: 'Active' })
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
    queryFn: () => base44.entities.Asset.filter({ status: 'Active' })
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.EmployeeProfile.filter({ isActive: true })
  });

  const filteredSites = useMemo(() => {
    if (!formData.customer) return [];
    return sites.filter(s => s.customer === formData.customer);
  }, [sites, formData.customer]);

  const filteredContacts = useMemo(() => {
    if (!formData.customer) return [];
    return contacts.filter(c => c.customer === formData.customer);
  }, [contacts, formData.customer]);

  const filteredAssets = useMemo(() => {
    if (!formData.site) return assets;
    return assets.filter(a => a.site === formData.site || !a.site);
  }, [assets, formData.site]);

  const filteredEmployees = useMemo(() => {
    if (!formData.assignedTeam) return employees;
    return employees.filter(e => e.team === formData.assignedTeam);
  }, [employees, formData.assignedTeam]);

  const selectedCustomer = customers.find(c => c.id === formData.customer);
  const selectedSite = sites.find(s => s.id === formData.site);
  const selectedAsset = assets.find(a => a.id === formData.asset);
  const selectedTeam = teams.find(t => t.id === formData.assignedTeam);
  const selectedEmployee = employees.find(e => e.id === formData.assignedPrimary);

  const generateJobNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `JOB-${year}${month}-${random}`;
  };

  const createJobMutation = useMutation({
    mutationFn: (data) => base44.entities.Job.create(data),
    onSuccess: (job) => {
      // Log activity
      base44.entities.ActivityLog.create({
        entityType: 'Job',
        entityId: job.id,
        activityType: 'Created',
        description: 'Job created'
      });
      
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      navigate(createPageUrl('JobDetail') + `?id=${job.id}`);
    }
  });

  const handleSubmit = () => {
    const jobData = {
      ...formData,
      jobNumber: generateJobNumber(),
      status: formData.assignedPrimary ? 'Assigned' : (formData.scheduledDate ? 'Scheduled' : 'Draft')
    };
    createJobMutation.mutate(jobData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!formData.customer;
      case 2: return !!formData.site;
      case 3: return !!formData.jobType;
      case 4: return true; // Asset is optional
      case 5: return true; // Schedule is optional
      case 6: return true; // Assignment is optional
      default: return true;
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (customersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Create Job"
        backLink="Jobs"
        backLabel="Back to Jobs"
      />

      <div className="px-4 sm:px-6 py-6">
        {/* Progress Steps - Mobile */}
        <div className="mb-6 lg:hidden">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Step {currentStep} of {STEPS.length}</span>
            <span className="text-slate-500">{STEPS[currentStep - 1].label}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Progress Steps - Desktop */}
        <div className="hidden lg:flex items-center justify-center mb-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isComplete = step.id < currentStep;

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && (
                  <div className={cn(
                    "w-16 h-0.5",
                    isComplete ? "bg-indigo-600" : "bg-slate-200"
                  )} />
                )}
                <button
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  className={cn(
                    "flex flex-col items-center",
                    step.id < currentStep && "cursor-pointer"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                    isComplete && "bg-indigo-600 text-white",
                    isActive && "bg-indigo-600 text-white ring-4 ring-indigo-100",
                    !isComplete && !isActive && "bg-slate-200 text-slate-400"
                  )}>
                    {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    "text-xs mt-1.5 font-medium",
                    (isActive || isComplete) ? "text-indigo-600" : "text-slate-400"
                  )}>
                    {step.label}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            {/* Step 1: Customer */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Select Customer</h2>
                  <p className="text-slate-500 text-sm mt-1">Choose the customer for this job</p>
                </div>
                
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {customers.map(customer => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        updateField('customer', customer.id);
                        // Reset dependent fields
                        updateField('site', '');
                        updateField('primaryContact', '');
                      }}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        formData.customer === customer.id
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          formData.customer === customer.id
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        )}>
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          {customer.billingAddress && (
                            <p className="text-sm text-slate-500 truncate">{customer.billingAddress}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Site */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Select Site</h2>
                  <p className="text-slate-500 text-sm mt-1">Choose the site location</p>
                </div>
                
                {filteredSites.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No sites for this customer</p>
                    <Button variant="outline" className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Add Site
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {filteredSites.map(site => (
                      <button
                        key={site.id}
                        onClick={() => updateField('site', site.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all",
                          formData.site === site.id
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            formData.site === site.id
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          )}>
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{site.siteName}</p>
                            {site.address && (
                              <p className="text-sm text-slate-500 truncate">{site.address}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredContacts.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <Label>Primary Contact (Optional)</Label>
                    <Select 
                      value={formData.primaryContact} 
                      onValueChange={(v) => updateField('primaryContact', v)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredContacts.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} {c.role && `(${c.role})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Job Type */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Job Type</h2>
                  <p className="text-slate-500 text-sm mt-1">What type of work is needed?</p>
                </div>
                
                <div className="grid gap-3">
                  {JOB_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => updateField('jobType', type.value)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        formData.jobType === type.value
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-slate-500">{type.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Label>Work Location</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {WORK_LOCATIONS.map(loc => (
                      <button
                        key={loc.value}
                        onClick={() => updateField('workLocation', loc.value)}
                        className={cn(
                          "p-3 rounded-lg border-2 text-center transition-all",
                          formData.workLocation === loc.value
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <p className="font-medium text-sm">{loc.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe the work needed..."
                    className="mt-1.5 h-24"
                  />
                </div>

                {formData.jobType === 'Breakdown' && (
                  <div>
                    <Label>Fault Details</Label>
                    <Textarea
                      value={formData.faultDetails}
                      onChange={(e) => updateField('faultDetails', e.target.value)}
                      placeholder="Describe the fault or issue..."
                      className="mt-1.5 h-20"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Asset */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Select Equipment (Optional)</h2>
                  <p className="text-slate-500 text-sm mt-1">Link this job to equipment</p>
                </div>

                <button
                  onClick={() => updateField('asset', '')}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all",
                    !formData.asset
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <p className="font-medium">No specific equipment</p>
                   <p className="text-sm text-slate-500">General service work</p>
                </button>
                
                {filteredAssets.length > 0 && (
                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {filteredAssets.map(asset => (
                      <button
                        key={asset.id}
                        onClick={() => updateField('asset', asset.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all",
                          formData.asset === asset.id
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            formData.asset === asset.id
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          )}>
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{asset.make} {asset.model}</p>
                             <p className="text-sm text-slate-500">ID: {asset.internalAssetId}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Schedule */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Schedule & Priority</h2>
                  <p className="text-slate-500 text-sm mt-1">Set timing and urgency</p>
                </div>

                <div>
                  <Label>Priority</Label>
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        onClick={() => updateField('priority', p.value)}
                        className={cn(
                          "p-3 rounded-lg border-2 text-center transition-all",
                          formData.priority === p.value
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className={cn("h-3 w-3 rounded-full mx-auto mb-1", p.color)} />
                        <p className="text-sm font-medium">{p.value}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => updateField('dueDate', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Scheduled Date</Label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => updateField('scheduledDate', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label>Scheduled Time</Label>
                  <Select value={formData.scheduledTime} onValueChange={(v) => updateField('scheduledTime', v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">Morning (AM)</SelectItem>
                      <SelectItem value="PM">Afternoon (PM)</SelectItem>
                      <SelectItem value="All Day">All Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 6: Assign */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Assign Team & Engineer</h2>
                  <p className="text-slate-500 text-sm mt-1">Who will work on this job?</p>
                </div>

                <div>
                  <Label>Team</Label>
                  <Select value={formData.assignedTeam} onValueChange={(v) => {
                    updateField('assignedTeam', v);
                    updateField('assignedPrimary', '');
                  }}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Primary Assignee</Label>
                  <Select value={formData.assignedPrimary} onValueChange={(v) => updateField('assignedPrimary', v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredEmployees.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Risk Notes (Optional)</Label>
                  <Textarea
                    value={formData.riskNotes}
                    onChange={(e) => updateField('riskNotes', e.target.value)}
                    placeholder="Any safety or access considerations..."
                    className="mt-1.5 h-20"
                  />
                </div>
              </div>
            )}

            {/* Step 7: Review */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Review & Create</h2>
                  <p className="text-slate-500 text-sm mt-1">Confirm job details</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Customer</p>
                        <p className="font-medium">{selectedCustomer?.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Site</p>
                        <p className="font-medium">{selectedSite?.siteName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Job Type</p>
                        <p className="font-medium">{formData.jobType || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Priority</p>
                        <p className="font-medium">{formData.priority}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Equipment</p>
                        <p className="font-medium">
                          {selectedAsset ? `${selectedAsset.make} ${selectedAsset.model}` : 'None'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Due Date</p>
                        <p className="font-medium">{formData.dueDate || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Team</p>
                        <p className="font-medium">{selectedTeam?.name || 'Unassigned'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Assignee</p>
                        <p className="font-medium">{selectedEmployee?.displayName || 'Unassigned'}</p>
                      </div>
                    </div>
                  </div>

                  {formData.description && (
                    <div className="p-4 rounded-lg bg-slate-50">
                      <p className="text-slate-500 text-sm">Description</p>
                      <p className="mt-1">{formData.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed()}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createJobMutation.isPending}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {createJobMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Create Job
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}