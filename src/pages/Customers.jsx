import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Plus,
  Search,
  Building2,
  ChevronRight,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { cn } from '@/lib/utils';

export default function Customers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    billingAddress: '',
    notes: '',
    status: 'Active',
    primaryPhone: '',
    primaryEmail: ''
  });

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.filter({}, '-created_date')
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setShowCreateDialog(false);
      setNewCustomer({
        name: '',
        billingAddress: '',
        notes: '',
        status: 'Active',
        primaryPhone: '',
        primaryEmail: ''
      });
    }
  });

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.billingAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSiteCount = (customerId) => {
    return sites.filter(s => s.customer === customerId).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading customers..." />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Customers"
        subtitle={`${filteredCustomers.length} customer${filteredCustomers.length !== 1 ? 's' : ''}`}
        actions={
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Customer</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    placeholder="Enter company name"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Billing Address</Label>
                  <Textarea
                    value={newCustomer.billingAddress}
                    onChange={(e) => setNewCustomer({...newCustomer, billingAddress: e.target.value})}
                    placeholder="Enter billing address"
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={newCustomer.primaryPhone}
                      onChange={(e) => setNewCustomer({...newCustomer, primaryPhone: e.target.value})}
                      placeholder="Phone number"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newCustomer.primaryEmail}
                      onChange={(e) => setNewCustomer({...newCustomer, primaryEmail: e.target.value})}
                      placeholder="Email address"
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={newCustomer.notes}
                    onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                    placeholder="Any additional notes..."
                    className="mt-1.5"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button 
                  onClick={() => createMutation.mutate(newCustomer)}
                  disabled={!newCustomer.name || createMutation.isPending}
                >
                  Create Customer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No customers found"
            description={searchQuery ? "Try a different search term" : "Add your first customer to get started"}
            action={searchQuery ? () => setSearchQuery('') : () => setShowCreateDialog(true)}
            actionLabel={searchQuery ? "Clear Search" : "Add Customer"}
          />
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map(customer => {
              const siteCount = getSiteCount(customer.id);

              return (
                <Link key={customer.id} to={createPageUrl('CustomerDetail') + `?id=${customer.id}`}>
                  <Card className="hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                          customer.status === 'Active' ? "bg-blue-100" : "bg-slate-100"
                        )}>
                          <Building2 className={cn(
                            "h-6 w-6",
                            customer.status === 'Active' ? "text-blue-600" : "text-slate-400"
                          )} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 truncate">{customer.name}</h3>
                            <StatusBadge status={customer.status} size="xs" />
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                            {customer.billingAddress && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3" />
                                {customer.billingAddress.split('\n')[0]}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {siteCount} site{siteCount !== 1 ? 's' : ''}
                            </span>
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
        )}
      </div>
    </div>
  );
}