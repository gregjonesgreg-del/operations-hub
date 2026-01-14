import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, CheckSquare } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

const categoryColors = {
  'Housekeeping': 'bg-blue-100 text-blue-700',
  'H&S': 'bg-red-100 text-red-700',
  'Vehicle Checks': 'bg-purple-100 text-purple-700',
  'Workshop Equipment Checks': 'bg-amber-100 text-amber-700',
  'Audit': 'bg-green-100 text-green-700',
  'Other': 'bg-slate-100 text-slate-700'
};

export default function InternalTasksList({ tasks }) {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const statusOrder = { Overdue: 0, Open: 1, 'In Progress': 2, Done: 3, Verified: 4 };
      const statusDiff = (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
      if (statusDiff !== 0) return statusDiff;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [tasks]);

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No internal tasks"
        description="Create tasks for housekeeping, H&S, equipment checks, and audits"
      />
    );
  }

  return (
    <div className="space-y-3">
      {sortedTasks.map(task => {
        const isOverdue = task.status === 'Overdue';

        return (
          <Link
            key={task.id}
            to={createPageUrl('InternalTaskDetail') + `?id=${task.id}`}
          >
            <Card className={cn(
              'hover:shadow-md transition-all cursor-pointer',
              isOverdue && 'border-red-300 bg-red-50/50'
            )}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">{task.title}</h3>
                      {isOverdue && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={categoryColors[task.category] || categoryColors['Other']}>
                        {task.category}
                      </Badge>
                      <Badge variant={
                        task.status === 'Done' ? 'default' :
                        task.status === 'Verified' ? 'default' :
                        task.status === 'Open' ? 'outline' : 'secondary'
                      }>
                        {task.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.dueDate), 'MMM d')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}