import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import useAppNavigate from '@/components/useAppNavigate';
import { routeBuilders } from '@/components/Routes';
import {
  Search,
  User,
  Phone,
  Mail,
  Building2,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function Contacts() {
  const navigate = useAppNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.filter({}, '-created_date')
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list()
  });

  const customerMap = useMemo(() => customers.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}), [customers]);

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customerMap[c.customer]?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading contacts..." />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Contacts"
        subtitle={`${filteredContacts.length} contact${filteredContacts.length !== 1 ? 's' : ''}`}
      >
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        {filteredContacts.length === 0 ? (
          <EmptyState
            icon={User}
            title="No contacts found"
            description={searchQuery ? "Try a different search term" : "Add contacts through customer records"}
          />
        ) : (
          <div className="space-y-3">
            {filteredContacts.map(contact => {
              const customer = customerMap[contact.customer];

              return (
                <Card key={contact.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{contact.name}</h3>
                          {contact.isPrimary && (
                            <Badge className="bg-indigo-100 text-indigo-700">Primary</Badge>
                          )}
                        </div>
                        {contact.role && (
                          <p className="text-sm text-slate-600">{contact.role}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                          {customer && (
                            <button
                              onClick={() => navigate(routeBuilders.customerDetail(customer.id))}
                              className="flex items-center gap-1 hover:text-indigo-600 bg-transparent border-0 p-0 cursor-pointer text-inherit"
                            >
                              <Building2 className="h-3 w-3" />
                              {customer.name}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`}>
                            <Button size="icon" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        {contact.email && (
                          <a href={`mailto:${contact.email}`}>
                            <Button size="icon" variant="outline">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}