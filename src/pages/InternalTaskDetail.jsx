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
import { Calendar, CheckSquare, AlertTriangle } from 'lucide-react';

const categoryColors = {
  'Housekeeping': 'bg-blue-100 text-blue-700',
  'H&S': 'bg-red-100 text-red-700',
  'Vehicle Checks': 'bg-purple-100 text-purple-700',
  'Workshop Equipment Checks': 'bg-amber-100 text-amber-700',
  'Audit': 'bg-green-100 text-green-700',
  'Other': 'bg-slate-100 text-slate-700'
};

export default function InternalTaskDetail() {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('id');

  const { data: task, isLoading } = useQuery({
    queryKey: ['internalTask', taskId],
    queryFn: () => base44.entities.InternalTask.filter({ id: taskId }).then(r => r[0]),
    enabled: !!taskId
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!task) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Task not found"
        description="The internal task you're looking for doesn't exist"
      />
    );
  }

  const isOverdue = task.status === 'Overdue';

  return (
    <div className="pb-8">
      <PageHeader
        title={task.title}
        subtitle={task.category}
        backLink="InternalOps"
        backLabel="Back to Internal Ops"
      >
        <div className="flex gap-2 mt-4 flex-wrap">
          <Badge className={categoryColors[task.category] || categoryColors['Other']}>
            {task.category}
          </Badge>
          <Badge variant={
            task.status === 'Done' ? 'default' :
            task.status === 'Verified' ? 'default' :
            task.status === 'Overdue' ? 'destructive' :
            'secondary'
          }>
            {task.status}
          </Badge>
          {task.verificationRequired && (
            <Badge variant="outline">Verification Required</Badge>
          )}
          {isOverdue && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </Badge>
          )}
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {task.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{task.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Due Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <p className="font-medium">
                      {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {task.recurrenceType !== 'None' && (
                  <div>
                    <p className="text-xs text-slate-500">Recurrence</p>
                    <p className="font-medium text-sm">
                      {task.recurrenceType}
                      {task.recurrenceDetail && ` - ${task.recurrenceDetail}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification Status */}
            {task.verificationRequired && (
              <Card className={task.status === 'Verified' ? 'border-emerald-200 bg-emerald-50' : ''}>
                <CardHeader>
                  <CardTitle className="text-base">Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.status === 'Verified' ? (
                    <>
                      <p className="text-sm text-emerald-700 font-medium">✓ Verified</p>
                      {task.verifiedAt && (
                        <p className="text-xs text-slate-500">
                          {format(new Date(task.verifiedAt), 'MMM d, yyyy HH:mm')}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-600">Pending verification</p>
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