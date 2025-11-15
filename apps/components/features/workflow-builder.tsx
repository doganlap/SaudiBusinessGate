'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'trigger';
  status: 'active' | 'inactive' | 'error';
}

interface WorkflowBuilderProps {
  className?: string;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ className = "" }) => {
  const [steps] = useState<WorkflowStep[]>([
    { id: '1', name: 'Trigger: New Order', type: 'trigger', status: 'active' },
    { id: '2', name: 'Check Inventory', type: 'condition', status: 'active' },
    { id: '3', name: 'Send Notification', type: 'action', status: 'active' },
  ]);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Workflow Builder</h3>
        <Button size="sm">Add Step</Button>
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
              {index + 1}
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-900">{step.name}</span>
                <Badge 
                  variant={step.type === 'trigger' ? 'default' : step.type === 'condition' ? 'secondary' : 'outline'}
                  className="ml-2"
                >
                  {step.type}
                </Badge>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                step.status === 'active' ? 'bg-green-500' : 
                step.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
              }`} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <Button variant="outline" className="w-full">
          Test Workflow
        </Button>
      </div>
    </Card>
  );
};