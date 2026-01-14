import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User, Phone, Mail, Building2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function ContactDetail() {
  const { contactId } = useParams();

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => base44.entities.Contact.filter({ id: contactId }).then(r => r[0]),
    enabled: !!contactId
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list()
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list()
  });

  const customer = customers.find(c => c.id === contact?.customer);
  const site = sites.find(s => s.id === contact?.site);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!contact) {
    return (
      <EmptyState
        icon={User}
        title="Contact not found"
        description="The contact you're looking for doesn't exist"
      />
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title={contact.name}
        subtitle={contact.role}
        backLink="/core/contacts"
        backLabel="Contacts"
      >
        <div className="flex items-center gap-2 mt-4">
          {contact.isPrimary && (
            <Badge className="bg-indigo-100 text-indigo-700">Primary Contact</Badge>
          )}
          <Badge variant="outline">Prefers: {contact.preferredContactMethod}</Badge>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">Phone</p>
                    <a href={`tel:${contact.phone}`} className="text-indigo-600 font-medium">
                      {contact.phone}
                    </a>
                  </div>
                  <a href={`tel:${contact.phone}`}>
                    <Button size="sm">Call</Button>
                  </a>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">Email</p>
                    <a href={`mailto:${contact.email}`} className="text-indigo-600 font-medium">
                      {contact.email}
                    </a>
                  </div>
                  <a href={`mailto:${contact.email}`}>
                    <Button size="sm" variant="outline">Email</Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Associated With</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer && (
               <a href={`/core/customers/${customer.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                 <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                   <Building2 className="h-5 w-5 text-blue-600" />
                 </div>
                 <div>
                   <p className="font-medium">{customer.name}</p>
                   <p className="text-sm text-slate-500">Customer</p>
                 </div>
               </a>
              )}
              {site && (
               <a href={`/core/sites/${site.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                 <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                   <MapPin className="h-5 w-5 text-emerald-600" />
                 </div>
                 <div>
                   <p className="font-medium">{site.siteName}</p>
                   <p className="text-sm text-slate-500">Site</p>
                 </div>
               </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}