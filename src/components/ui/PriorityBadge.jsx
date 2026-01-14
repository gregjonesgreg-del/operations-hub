import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const priorityConfig = {
  'Urgent': {
    bg: 'bg-red-500',
    text: 'text-white',
    icon: AlertTriangle,
    pulse: true
  },
  'High': {
    bg: 'bg-orange-500',
    text: 'text-white',
    icon: ArrowUp,
    pulse: false
  },
  'Medium': {
    bg: 'bg-blue-500',
    text: 'text-white',
    icon: Minus,
    pulse: false
  },
  'Low': {
    bg: 'bg-slate-400',
    text: 'text-white',
    icon: ArrowDown,
    pulse: false
  }
};

export default function PriorityBadge({ priority, showLabel = true, size = 'sm' }) {
  const config = priorityConfig[priority] || priorityConfig['Medium'];
  const Icon = config.icon;
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        config.bg,
        config.text,
        config.pulse && 'animate-pulse',
        size === 'xs' && 'px-1.5 py-0.5 text-xs',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm'
      )}
    >
      <Icon className={cn(
        size === 'xs' && 'h-3 w-3',
        size === 'sm' && 'h-3 w-3',
        size === 'md' && 'h-4 w-4'
      )} />
      {showLabel && priority}
    </span>
  );
}