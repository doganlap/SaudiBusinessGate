'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface EnterpriseToolbarProps {
  title?: string;
  className?: string;
}

export const EnterpriseToolbar: React.FC<EnterpriseToolbarProps> = ({ 
  title = "Enterprise Tools", 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-between p-4 bg-white shadow-sm border-b ${className}`}>
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <Badge variant="outline">Enterprise</Badge>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          Export
        </Button>
        <Button variant="outline" size="sm">
          Settings
        </Button>
        <Button size="sm">
          New
        </Button>
      </div>
    </div>
  );
};