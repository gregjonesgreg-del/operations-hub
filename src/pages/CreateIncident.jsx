import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { routeBuilders } from '@/components/Routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';

export default function CreateIncident() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Reported',
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.IncidentNearMiss.create(data),
    onSuccess: (result) => {
      navigate(routeBuilders.incidentDetail(result.id));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="pb-8">
      <PageHeader title="Report Incident" backLink="InternalOps" backLabel="Back to Ops" />

      <div className="px-4 sm:px-6 py-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Brief incident description..."
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Details</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Full incident description..."
                  className="mt-1.5"
                  rows={6}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => navigate('/ops/incidents')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!formData.title}>
                  Report Incident
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}