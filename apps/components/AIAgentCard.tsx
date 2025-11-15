"use client";
import { useState } from 'react';
import { Bot, Play, Square, RotateCcw, Settings, Activity, Clock, CheckCircle2, AlertTriangle, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIAgent {
  id: string;
  name: string;
  nameAr: string;
  type: 'finance_analyzer' | 'compliance_monitor' | 'fraud_detector' | 'workflow_automator' | 'report_generator';
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  description: string;
  descriptionAr: string;
  capabilities: string[];
  model: string;
  provider: string;
  lastActive: string;
  tasksCompleted: number;
  tasksInProgress: number;
  successRate: number;
  averageResponseTime: number;
  configuration: {
    maxConcurrentTasks: number;
    timeout: number;
    retryAttempts: number;
    priority: 'low' | 'medium' | 'high';
  };
}

interface AIAgentCardProps {
  agent: AIAgent;
  onStart?: (id: string) => void;
  onStop?: (id: string) => void;
  onRestart?: (id: string) => void;
  onConfigure?: (id: string) => void;
  locale?: 'ar' | 'en';
}

export default function AIAgentCard({ 
  agent, 
  onStart, 
  onStop, 
  onRestart, 
  onConfigure, 
  locale = 'ar' 
}: AIAgentCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const t = {
    ar: {
      active: 'نشط',
      inactive: 'غير نشط',
      error: 'خطأ',
      maintenance: 'صيانة',
      tasksCompleted: 'المهام المكتملة',
      tasksInProgress: 'المهام الجارية',
      successRate: 'معدل النجاح',
      responseTime: 'وقت الاستجابة',
      lastActive: 'آخر نشاط',
      capabilities: 'القدرات',
      configuration: 'التكوين',
      maxTasks: 'الحد الأقصى للمهام',
      timeout: 'انتهاء المهلة',
      retryAttempts: 'محاولات الإعادة',
      priority: 'الأولوية',
      start: 'تشغيل',
      stop: 'إيقاف',
      restart: 'إعادة تشغيل',
      configure: 'تكوين',
      details: 'التفاصيل',
      hideDetails: 'إخفاء التفاصيل',
      seconds: 'ثانية',
      minutes: 'دقيقة',
      hours: 'ساعة',
      days: 'يوم',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض'
    },
    en: {
      active: 'Active',
      inactive: 'Inactive',
      error: 'Error',
      maintenance: 'Maintenance',
      tasksCompleted: 'Tasks Completed',
      tasksInProgress: 'Tasks in Progress',
      successRate: 'Success Rate',
      responseTime: 'Response Time',
      lastActive: 'Last Active',
      capabilities: 'Capabilities',
      configuration: 'Configuration',
      maxTasks: 'Max Tasks',
      timeout: 'Timeout',
      retryAttempts: 'Retry Attempts',
      priority: 'Priority',
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
      configure: 'Configure',
      details: 'Details',
      hideDetails: 'Hide Details',
      seconds: 'seconds',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days',
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    }
  }[locale];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4" />;
      case 'inactive': return <Square className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      default: return <Square className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return locale === 'ar' ? 'الآن' : 'now';
    if (diffMins < 60) return `${diffMins} ${t.minutes}`;
    if (diffHours < 24) return `${diffHours} ${t.hours}`;
    return `${diffDays} ${t.days}`;
  };

  const formatResponseTime = (time: number) => {
    return `${time.toFixed(1)}${t.seconds}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <Bot className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              {locale === 'ar' ? agent.nameAr : agent.name}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {agent.model} • {agent.provider}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(agent.status)}`}>
          {getStatusIcon(agent.status)}
          <span>{t[agent.status as keyof typeof t]}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        {locale === 'ar' ? agent.descriptionAr : agent.description}
      </p>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">{t.tasksCompleted}</span>
            <span className="font-medium">{agent.tasksCompleted.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">{t.tasksInProgress}</span>
            <span className="font-medium text-emerald-600">{agent.tasksInProgress}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">{t.successRate}</span>
            <span className="font-medium">{agent.successRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">{t.responseTime}</span>
            <span className="font-medium">{formatResponseTime(agent.averageResponseTime)}</span>
          </div>
        </div>
      </div>

      {/* Success Rate Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
          <span>{t.successRate}</span>
          <span>{agent.successRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
            style={{ width: `${agent.successRate}%` }}
          />
        </div>
      </div>

      {/* Last Active */}
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        <Clock className="h-4 w-4" />
        <span>{t.lastActive}: {formatTimeAgo(agent.lastActive)}</span>
      </div>

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-4"
      >
        {showDetails ? t.hideDetails : t.details}
      </button>

      {/* Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
        >
          <div>
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              {t.capabilities}:
            </div>
            <div className="flex flex-wrap gap-1">
              {agent.capabilities.map((capability, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
              {t.configuration}:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>{t.maxTasks}:</span>
                <span className="font-medium">{agent.configuration.maxConcurrentTasks}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.timeout}:</span>
                <span className="font-medium">{agent.configuration.timeout / 1000}s</span>
              </div>
              <div className="flex justify-between">
                <span>{t.retryAttempts}:</span>
                <span className="font-medium">{agent.configuration.retryAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.priority}:</span>
                <span className={`px-1 py-0.5 rounded text-xs font-medium ${getPriorityColor(agent.configuration.priority)}`}>
                  {t[agent.configuration.priority as keyof typeof t]}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {agent.status === 'inactive' && onStart && (
          <button
            onClick={() => onStart(agent.id)}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4" />
            {t.start}
          </button>
        )}
        
        {agent.status === 'active' && onStop && (
          <button
            onClick={() => onStop(agent.id)}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <Square className="h-4 w-4" />
            {t.stop}
          </button>
        )}
        
        {(agent.status === 'error' || agent.status === 'maintenance') && onRestart && (
          <button
            onClick={() => onRestart(agent.id)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t.restart}
          </button>
        )}
        
        {onConfigure && (
          <button
            onClick={() => onConfigure(agent.id)}
            className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {t.configure}
          </button>
        )}
      </div>
    </motion.div>
  );
}
