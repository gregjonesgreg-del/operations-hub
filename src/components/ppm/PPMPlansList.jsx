import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, CheckSquare } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

export default function PPMPlansList({ plans }) {
  if (!plans || plans.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No PPM plans created"
        description="Start by creating your first preventive maintenance plan"
      />
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map(plan => (
        <Link
          key={plan.id}
          to={createPageUrl('PPMPlanDetail') + `?id=${plan.id}`}
        >
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-base line-clamp-2">{plan.name}</CardTitle>
              <div className="flex gap-2 mt-2">
                {plan.complianceCritical && (
                  <Badge className="bg-red-100 text-red-700">Compliance Critical</Badge>
                )}
                <Badge variant="outline">{plan.appliesToAssetType}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>{plan.frequencyValue} {plan.frequencyUnit.toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="truncate">Team Assignment</span>
              </div>
              {plan.isActive ? (
                <Badge className="bg-emerald-100 text-emerald-700 w-fit">Active</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}