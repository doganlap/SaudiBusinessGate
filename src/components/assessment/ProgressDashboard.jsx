import React from 'react';
import { TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

/**
 * ==========================================
 * PROGRESS DASHBOARD
 * ==========================================
 * 
 * Displays assessment progress and statistics
 */

function ProgressDashboard({ stats }) {
  const defaultStats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    ...stats
  };

  const progressPercentage = defaultStats.total > 0 
    ? Math.round((defaultStats.completed / defaultStats.total) * 100)
    : 0;

  const metrics = [
    {
      label: 'Completed',
      value: defaultStats.completed,
      icon: CheckCircle,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'In Progress',
      value: defaultStats.inProgress,
      icon: Clock,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      label: 'Pending',
      value: defaultStats.pending,
      icon: AlertTriangle,
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
    {
      label: 'Total',
      value: defaultStats.total,
      icon: TrendingUp,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Overall Progress</h3>
          <span className="text-2xl font-bold text-blue-600">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div 
            key={index}
            className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: metric.bgColor }}
            >
              <metric.icon size={24} style={{ color: metric.color }} />
            </div>
            <p className="text-2xl font-bold mb-1">{metric.value}</p>
            <p className="text-sm text-gray-600">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressDashboard;
