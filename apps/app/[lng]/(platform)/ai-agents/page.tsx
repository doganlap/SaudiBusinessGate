"use client";
import { useState, useEffect } from 'react';
import { Bot, Activity, Zap, Settings, Filter, Search, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import AIAgentCard from '@/components/AIAgentCard';

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

export default function AIAgentsPage({ params }: { params: Promise<{ lng: string }> }) {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    params.then(p => setLocale(p.lng as 'ar' | 'en'));
  }, [params]);

  const t = {
    ar: {
      title: 'إدارة الوكلاء الأذكياء',
      subtitle: 'مراقبة وإدارة وكلاء الذكاء الاصطناعي والأتمتة',
      totalAgents: 'إجمالي الوكلاء',
      activeAgents: 'الوكلاء النشطة',
      totalTasks: 'إجمالي المهام',
      averageSuccess: 'متوسط النجاح',
      filters: 'المرشحات',
      allTypes: 'جميع الأنواع',
      allStatuses: 'جميع الحالات',
      search: 'البحث...',
      refresh: 'تحديث',
      noAgents: 'لا توجد وكلاء',
      noAgentsDesc: 'لم يتم تكوين أي وكلاء ذكية حتى الآن',
      finance_analyzer: 'محلل مالي',
      compliance_monitor: 'مراقب الامتثال',
      fraud_detector: 'كاشف الاحتيال',
      workflow_automator: 'أتمتة سير العمل',
      report_generator: 'مولد التقارير',
      active: 'نشط',
      inactive: 'غير نشط',
      error: 'خطأ',
      maintenance: 'صيانة'
    },
    en: {
      title: 'AI Agents Management',
      subtitle: 'Monitor and manage AI agents and automation',
      totalAgents: 'Total Agents',
      activeAgents: 'Active Agents',
      totalTasks: 'Total Tasks',
      averageSuccess: 'Average Success',
      filters: 'Filters',
      allTypes: 'All Types',
      allStatuses: 'All Statuses',
      search: 'Search...',
      refresh: 'Refresh',
      noAgents: 'No Agents',
      noAgentsDesc: 'No AI agents have been configured yet',
      finance_analyzer: 'Finance Analyzer',
      compliance_monitor: 'Compliance Monitor',
      fraud_detector: 'Fraud Detector',
      workflow_automator: 'Workflow Automator',
      report_generator: 'Report Generator',
      active: 'Active',
      inactive: 'Inactive',
      error: 'Error',
      maintenance: 'Maintenance'
    }
  }[locale];

  useEffect(() => {
    fetchAgents();
  }, [filters]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/ai-agents?${params.toString()}`, {
        headers: { 'x-tenant-id': 'demo-tenant' }
      });
      
      const data = await response.json();
      if (data.success) {
        setAgents(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentAction = async (agentId: string, action: string) => {
    try {
      const response = await fetch('/api/ai-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'demo-tenant'
        },
        body: JSON.stringify({ agentId, action })
      });

      if (response.ok) {
        fetchAgents();
      }
    } catch (error) {
      console.error(`Failed to ${action} agent:`, error);
    }
  };

  const filteredAgents = agents.filter(agent => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        agent.name.toLowerCase().includes(searchTerm) ||
        agent.nameAr.includes(searchTerm) ||
        agent.type.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  const StatCard = ({ title, value, icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border ${color} backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/20">
          {icon}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-emerald-900/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {t.title}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {t.subtitle}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t.totalAgents}
            value={stats.total || 0}
            icon={<Bot className="h-6 w-6" />}
            color="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200 text-blue-700"
          />
          <StatCard
            title={t.activeAgents}
            value={stats.active || 0}
            icon={<Activity className="h-6 w-6" />}
            color="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200 text-green-700"
          />
          <StatCard
            title={t.totalTasks}
            value={(stats.totalTasks || 0).toLocaleString()}
            icon={<Zap className="h-6 w-6" />}
            color="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200 text-purple-700"
          />
          <StatCard
            title={t.averageSuccess}
            value={`${(stats.averageSuccessRate || 0).toFixed(1)}%`}
            icon={<Settings className="h-6 w-6" />}
            color="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-200 text-emerald-700"
          />
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-neutral-700 p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">{t.filters}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            >
              <option value="">{t.allTypes}</option>
              <option value="finance_analyzer">{t.finance_analyzer}</option>
              <option value="compliance_monitor">{t.compliance_monitor}</option>
              <option value="fraud_detector">{t.fraud_detector}</option>
              <option value="workflow_automator">{t.workflow_automator}</option>
              <option value="report_generator">{t.report_generator}</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            >
              <option value="">{t.allStatuses}</option>
              <option value="active">{t.active}</option>
              <option value="inactive">{t.inactive}</option>
              <option value="error">{t.error}</option>
              <option value="maintenance">{t.maintenance}</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder={t.search}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={fetchAgents}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {t.refresh}
            </button>
          </div>
        </div>

        {/* Agents List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              {t.noAgents}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {t.noAgentsDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AIAgentCard
                  agent={agent}
                  onStart={(id) => handleAgentAction(id, 'start')}
                  onStop={(id) => handleAgentAction(id, 'stop')}
                  onRestart={(id) => handleAgentAction(id, 'restart')}
                  onConfigure={(id) => console.log('Configure agent:', id)}
                  locale={locale}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
