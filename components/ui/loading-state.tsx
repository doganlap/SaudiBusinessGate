'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({ 
  message = 'Loading...', 
  size = 'md',
  className = '' 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]} text-primary mb-4`} />
      <p className={`text-muted-foreground ${textSizeClasses[size]}`}>
        {message}
      </p>
    </div>
  );
}

export default LoadingState;