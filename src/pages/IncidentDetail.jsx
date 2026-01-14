import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { format } from 'date-fns';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

const severityStyles = {
  'Low': { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  'Medium': { bg: 'bg-amber-100', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  'High': { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-100 text-red-700' }
};

export default function IncidentDetail() {
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get('id');

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: () => base44.entities.IncidentNearMiss.filter({ id: incidentId }).then(r => r[0]),
    enabled: !!incidentId
  });

  const { data: linkedTasks = [] } = useQuery({
    queryKey: ['linkedTasks', incident?.linkedActions],
    queryFn: async () => {
      if (!incident?.linkedActions || incident.linkedActions.length === 0) return [];
      const tasks = await Promise.all(
        incident.linkedActions.map(id => 
          base44.entities.InternalTask.filter({ id }).then(r => r[0])
        )
      );
      return tasks.filter(Boolean);
    },
    enabled: !!incident?.linkedActions
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!incident) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Incident not found"
        description="The incident you're looking for doesn't exist"
      />
    );
  }

  const severity = incident.severity || 'Low';
  const styles = severityStyles[severity];

  return (
    <div className="pb-8">
      <PageHeader
        title="Incident Report"
        subtitle={`${severity} severity`}
        backLink="InternalOps"
        backLabel="Back to Internal Ops"
      >
        <div className="flex gap-2 mt-4">
          <Badge className={styles.badge}>
            {severity} severity
          </Badge>
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            {format(new Date(incident.dateTime), 'MMM d, yyyy HH:mm')}
          </div>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Incident Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {incident.description}
                </p>
              </CardContent>
            </Card>

            {/* Immediate Actions */}
            {incident.immediateActions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Immediate Actions Taken</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {incident.immediateActions}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Linked Follow-up Tasks */}
            {linkedTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Follow-up Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {linkedTasks.map(task => (
                      <div key={task.id} className="p-3 border rounded-lg">
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Severity */}
            <Card className={`${styles.bg}`}>
              <CardHeader>
                <CardTitle className={`text-base ${styles.text}`}>Severity Level</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${styles.text}`}>
                  {severity}
                </p>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Date & Time</p>
                  <p className="font-medium text-sm">
                    {format(new Date(incident.dateTime), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                {incident.site && (
                  <div>
                    <p className="text-xs text-slate-500">Site</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <p className="font-medium text-sm">Site Info</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}