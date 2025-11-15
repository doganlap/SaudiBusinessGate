'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';

interface ErrorBoundaryProps {
  error: string | Error;
  title?: string;
  description?: string;
  retry?: () => void;
  className?: string;
}

export function ErrorBoundary({ 
  error, 
  title = 'Something went wrong',
  description,
  retry,
  className = ''
}: ErrorBoundaryProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`flex items-center justify-center min-h-[300px] p-4 ${className}`}>
      <Card className="max-w-md w-full p-6 text-center">
        <div className="mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600 mb-3">{description}</p>
          )}
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded border">
            {errorMessage}
          </p>
        </div>
        
        {retry && (
          <Button onClick={retry} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </Card>
    </div>
  );
}

export default ErrorBoundary;