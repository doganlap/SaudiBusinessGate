import React from 'react';
import { FileX, RefreshCw, PlusCircle } from 'lucide-react';

interface NoDataStateProps {
  message?: string;
  onCreate?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export function NoDataState({
  message = 'No data available',
  onCreate,
  onRefresh,
  className = ''
}: NoDataStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border rounded-lg ${className}`}>
      <FileX className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-4">{message}</p>
      
      <div className="flex gap-4">
        {onCreate && (
          <button 
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New</span>
          </button>
        )}
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/90"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
}
