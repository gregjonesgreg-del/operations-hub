import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

const severityStyles = {
  'Low': 'bg-blue-100 text-blue-700',
  'Medium': 'bg-amber-100 text-amber-700',
  'High': 'bg-red-100 text-red-700'
};

export default function IncidentsList({ incidents }) {
  const sortedIncidents = useMemo(() => {
    const severityOrder = { High: 0, Medium: 1, Low: 2 };
    return [...incidents].sort((a, b) => {
      const severityDiff = (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3);
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.dateTime) - new Date(a.dateTime);
    });
  }, [incidents]);

  if (!incidents || incidents.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No incidents reported"
        description="Report any safety incidents or near-misses"
      />
    );
  }

  return (
    <div className="space-y-3">
      {sortedIncidents.map(incident => (
        <Link
          key={incident.id}
          to={createPageUrl('IncidentDetail') + `?id=${incident.id}`}
        >
          <Card className={cn(
            'hover:shadow-md transition-all cursor-pointer',
            incident.severity === 'High' && 'border-red-300 bg-red-50/50'
          )}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-2">
                      {incident.description}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={severityStyles[incident.severity] || severityStyles['Low']}>
                      {incident.severity} severity
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {format(new Date(incident.dateTime), 'MMM d, yyyy HH:mm')}
                    </span>
                    {incident.linkedActions?.length > 0 && (
                      <Badge variant="outline">
                        {incident.linkedActions.length} action{incident.linkedActions.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}