import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ 
  message = 'Loading...',
  className = ''
}: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[300px] ${className}`}>
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
