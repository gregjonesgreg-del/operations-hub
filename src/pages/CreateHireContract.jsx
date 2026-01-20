import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageHeader from '@/components/ui/PageHeader';

export default function CreateHireContract() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer: '',
    site: '',
    startDate: '',
    endDate: '',
    status: 'Draft',
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list()
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.HireContract.create(data),
    onSuccess: (result) => {
      navigate(`/HireContractDetail?contractId=${result.id}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredSites = sites.filter(s => s.customer === formData.customer);

  return (
    <div className="pb-8">
      <PageHeader title="New Hire Contract" backLink="Hire" backLabel="Back to Hire" />

      <div className="px-4 sm:px-6 py-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Customer *</Label>
                <Select value={formData.customer} onValueChange={(v) => setFormData({...formData, customer: v, site: ''})}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Site *</Label>
                <Select value={formData.site} onValueChange={(v) => setFormData({...formData, site: v})}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSites.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.siteName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => navigate('/hire/contracts')}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!formData.customer || !formData.site || !formData.startDate || !formData.endDate}
                >
                  Create Contract
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}