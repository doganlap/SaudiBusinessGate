import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  timeframe?: string;
  className?: string;
}

export function KpiCard({ 
  icon: Icon, 
  label, 
  value, 
  delta, 
  trend = 'neutral',
  timeframe,
  className = ''
}: KpiCardProps) {
  return (
    <div className={`p-6 rounded-lg border border-border bg-surface ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        
        {delta && (
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${trend === 'up' ? 'bg-success/10 text-success' : 
              trend === 'down' ? 'bg-danger/10 text-danger' : 
              'bg-muted/10 text-muted-foreground'}
          `}>
            {delta}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        
        {timeframe && (
          <p className="text-xs text-muted-foreground">
            {timeframe}
          </p>
        )}
      </div>
    </div>
  );
}
