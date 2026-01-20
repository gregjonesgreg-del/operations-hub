import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';

export default function HireContracts() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['hireContracts'],
    queryFn: () => base44.entities.HireContract.list()
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list()
  });

  const filteredContracts = contracts.filter(c => {
    const customer = customers.find(cust => cust.id === c.customer);
    const customerName = customer?.name || '';
    return customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.contractNumber?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading contracts..." />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Hire Contracts"
        subtitle={`${contracts.length} contracts`}
        actions={
          <Link to="/hire/contracts/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Contract
            </Button>
          </Link>
        }
      >
        <div className="mt-4 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by customer or contract number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        <div className="space-y-2">
          {filteredContracts.map(contract => {
            const customer = customers.find(c => c.id === contract.customer);
            return (
              <Link key={contract.id} to={`/HireContractDetail?contractId=${contract.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{contract.contractNumber || 'Draft'}</p>
                      <p className="text-sm text-slate-500">{customer?.name}</p>
                    </div>
                    <StatusBadge status={contract.status} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}