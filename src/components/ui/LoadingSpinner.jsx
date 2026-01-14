import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoadingSpinner({ size = 'md', className, text }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 
        className={cn(
          "animate-spin text-indigo-600",
          size === 'sm' && 'h-5 w-5',
          size === 'md' && 'h-8 w-8',
          size === 'lg' && 'h-12 w-12'
        )} 
      />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );
}