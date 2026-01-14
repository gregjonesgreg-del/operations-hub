import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../../utils';

export default function PageHeader({ 
  title, 
  subtitle, 
  backLink, 
  backLabel,
  actions,
  children 
}) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
      <div className="px-4 sm:px-6 py-4">
        {backLink && (
          <Link 
            to={createPageUrl(backLink)}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {backLabel || 'Back'}
          </Link>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-2 flex-wrap">
              {actions}
            </div>
          )}
        </div>
        
        {children}
      </div>
    </div>
  );
}