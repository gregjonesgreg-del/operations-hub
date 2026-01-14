import React from 'react';
import { cn } from '@/lib/utils';

const statusStyles = {
  // Job statuses
  'Draft': 'bg-slate-100 text-slate-700 border-slate-200',
  'Scheduled': 'bg-blue-50 text-blue-700 border-blue-200',
  'Assigned': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'Awaiting Parts': 'bg-orange-50 text-orange-700 border-orange-200',
  'Awaiting Customer': 'bg-purple-50 text-purple-700 border-purple-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Closed': 'bg-slate-100 text-slate-600 border-slate-200',
  'Cancelled': 'bg-red-50 text-red-700 border-red-200',
  
  // Priority
  'Low': 'bg-slate-100 text-slate-600 border-slate-200',
  'Medium': 'bg-blue-50 text-blue-700 border-blue-200',
  'High': 'bg-orange-50 text-orange-700 border-orange-200',
  'Urgent': 'bg-red-50 text-red-700 border-red-200',
  
  // Asset statuses
  'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'In Repair': 'bg-amber-50 text-amber-700 border-amber-200',
  'Off Hire': 'bg-slate-100 text-slate-600 border-slate-200',
  'Decommissioned': 'bg-red-50 text-red-700 border-red-200',
  
  // Availability
  'Available': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Reserved': 'bg-blue-50 text-blue-700 border-blue-200',
  'On Hire': 'bg-purple-50 text-purple-700 border-purple-200',
  'In Maintenance': 'bg-amber-50 text-amber-700 border-amber-200',
  
  // Task statuses
  'Open': 'bg-slate-100 text-slate-600 border-slate-200',
  'Done': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  
  // Customer status
  'Inactive': 'bg-slate-100 text-slate-500 border-slate-200',
  
  // Default
  'default': 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function StatusBadge({ status, size = 'sm', className }) {
  const style = statusStyles[status] || statusStyles['default'];
  
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        size === 'xs' && 'px-2 py-0.5 text-xs',
        size === 'sm' && 'px-2.5 py-1 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        style,
        className
      )}
    >
      {status}
    </span>
  );
}