import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { 
  Clock, 
  CheckCircle, 
  Edit, 
  UserPlus, 
  MessageSquare, 
  Camera, 
  Plus,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingSpinner from './ui/LoadingSpinner';

const activityIcons = {
  'Created': Plus,
  'Status Change': ArrowRight,
  'Assignment Change': UserPlus,
  'Edit': Edit,
  'Note Added': MessageSquare,
  'Photo Added': Camera,
  'Completed': CheckCircle,
  'Other': Clock
};

const activityColors = {
  'Created': 'bg-emerald-100 text-emerald-600',
  'Status Change': 'bg-blue-100 text-blue-600',
  'Assignment Change': 'bg-purple-100 text-purple-600',
  'Edit': 'bg-amber-100 text-amber-600',
  'Note Added': 'bg-slate-100 text-slate-600',
  'Photo Added': 'bg-pink-100 text-pink-600',
  'Completed': 'bg-emerald-100 text-emerald-600',
  'Other': 'bg-slate-100 text-slate-600'
};

export default function ActivityTimeline({ entityType, entityId, limit = 20 }) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', entityType, entityId],
    queryFn: () => base44.entities.ActivityLog.filter(
      { entityType, entityId },
      '-created_date',
      limit
    ),
    enabled: !!entityId
  });

  if (isLoading) {
    return <LoadingSpinner size="sm" className="py-8" />;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        No activity recorded yet
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => {
          const Icon = activityIcons[activity.activityType] || activityIcons['Other'];
          const colorClass = activityColors[activity.activityType] || activityColors['Other'];
          const isLast = idx === activities.length - 1;

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start gap-3">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white",
                    colorClass
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium text-slate-900">
                        {activity.performedByName || activity.performedBy || 'System'}
                      </span>
                      <span className="text-slate-500 ml-1">
                        {activity.description}
                      </span>
                    </div>
                    {(activity.previousValue || activity.newValue) && (
                      <div className="mt-1 text-xs text-slate-500">
                        {activity.previousValue && (
                          <span className="line-through mr-2">{activity.previousValue}</span>
                        )}
                        {activity.newValue && (
                          <span className="text-slate-700">{activity.newValue}</span>
                        )}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      {format(new Date(activity.created_date), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}