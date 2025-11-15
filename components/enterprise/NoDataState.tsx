import React from 'react';
import { FileX, RefreshCw, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoDataStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export function NoDataState({
  title = 'No data available',
  description = 'There is no data to display at the moment.',
  actionLabel = 'Create New',
  onAction,
  onRefresh,
  className = ''
}: NoDataStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 border border-dashed border-gray-300 rounded-lg ${className}`}>
      <FileX className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4 text-center">{description}</p>
      
      <div className="flex gap-4">
        {onAction && (
          <Button onClick={onAction} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>{actionLabel}</span>
          </Button>
        )}
        
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        )}
      </div>
    </div>
  );
}
