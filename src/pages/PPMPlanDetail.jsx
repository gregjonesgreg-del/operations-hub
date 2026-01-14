import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { CheckSquare, Users, Calendar } from 'lucide-react';

export default function PPMPlanDetail() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('id');

  const { data: plan, isLoading } = useQuery({
    queryKey: ['ppmPlan', planId],
    queryFn: () => base44.entities.PPMPlan.filter({ id: planId }).then(r => r[0]),
    enabled: !!planId
  });

  const { data: team } = useQuery({
    queryKey: ['team', plan?.responsibilityTeam],
    queryFn: () => base44.entities.Team.filter({ id: plan?.responsibilityTeam }).then(r => r[0]),
    enabled: !!plan?.responsibilityTeam
  });

  const { data: template } = useQuery({
    queryKey: ['template', plan?.checklistTemplate],
    queryFn: () => base44.entities.ChecklistTemplate.filter({ id: plan?.checklistTemplate }).then(r => r[0]),
    enabled: !!plan?.checklistTemplate
  });

  const { data: checklistItems = [] } = useQuery({
    queryKey: ['checklistItems', template?.id],
    queryFn: () => base44.entities.ChecklistItem.filter({ template: template?.id }),
    enabled: !!template?.id
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!plan) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Plan not found"
        description="The PPM plan you're looking for doesn't exist"
      />
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title={plan.name}
        subtitle={`${plan.frequencyValue} ${plan.frequencyUnit}`}
        backLink="PPM"
        backLabel="Back to PPM"
      >
        <div className="flex gap-2 mt-4">
          {plan.complianceCritical && (
            <Badge className="bg-red-100 text-red-700">Compliance Critical</Badge>
          )}
          <Badge variant="outline">{plan.appliesToAssetType}</Badge>
          {plan.isActive ? (
            <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
          ) : (
            <Badge variant="outline">Inactive</Badge>
          )}
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Checklist Template */}
            {template && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Checklist Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {checklistItems.length === 0 ? (
                      <p className="text-slate-500 text-sm">No items in this template</p>
                    ) : (
                      checklistItems.map(item => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.itemText}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.responseType}
                              </Badge>
                              {item.photoRequired && (
                                <Badge variant="outline" className="text-xs">📸 Photo</Badge>
                              )}
                              {item.notesRequired && (
                                <Badge variant="outline" className="text-xs">📝 Notes</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Frequency */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Frequency</p>
                    <p className="font-medium">
                      Every {plan.frequencyValue} {plan.frequencyUnit.toLowerCase()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team */}
            {team && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Responsibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Team</p>
                      <p className="font-medium">{team.name}</p>
                    </div>
                  </div>
                  {plan.responsibilityRole && (
                    <p className="text-xs text-slate-600 mt-2">
                      Role: <span className="font-medium">{plan.responsibilityRole}</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}