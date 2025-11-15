'use client';

import React, { useState, useEffect } from 'react';
import { useArabic } from '@/lib/hooks/useArabic';
import { EnhancedCard, EnhancedCardHeader, EnhancedCardTitle, EnhancedCardContent } from '@/components/ui/enhanced-card';
import { ExportService } from '@/lib/utils/export-utils';
import { 
  Bot, Brain, Zap, TrendingUp, CheckCircle, AlertCircle, 
  Clock, Users, Settings, Activity, BarChart3, Shield, Download
} from 'lucide-react';

interface AIAgent {
  id: string;
  agent_code: string;
  agent_name: string;
  agent_title_en: string;
  agent_title_ar: string;
  agent_type: string;
  agent_status: string;
  decision_authority_level: number;
  tasks_completed: number;
  success_rate: number;
  average_processing_time: number;
  current_tasks: number;
  primary_functions: string[];
}

interface AgentMetrics {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  averageSuccessRate: number;
  totalProcessingTime: number;
}

export default function AIFinanceAgentsPage() {
  const { t, isRTL, css, format } = useArabic();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/ai/finance-agents', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.data);
        calculateMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (agentData: AIAgent[]) => {
    const totalAgents = agentData.length;
    const activeAgents = agentData.filter(a => a.agent_status === 'active').length;
    const totalTasks = agentData.reduce((sum, a) => sum + a.tasks_completed, 0);
    const averageSuccessRate = agentData.reduce((sum, a) => sum + a.success_rate, 0) / totalAgents;
    const totalProcessingTime = agentData.reduce((sum, a) => sum + a.average_processing_time, 0);

    setMetrics({
      totalAgents,
      activeAgents,
      totalTasks,
      averageSuccessRate,
      totalProcessingTime
    });
  };

  const exportAgents = () => {
    try {
      ExportService.exportAIAgents(agents, {
        format: 'csv',
        filename: `ai-finance-agents-${new Date().toISOString().split('T')[0]}.csv`
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert(isRTL ? 'فشل في التصدير' : 'Export failed');
    }
  };

  const testAgentDecision = async (agentCode: string) => {
    try {
      const response = await fetch('/api/ai/finance-agents?action=make_decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'tenant-id': 'default-tenant'
        },
        body: JSON.stringify({
          agent_code: agentCode,
          decision_context: {
            task_type: 'payment_approval',
            input_data: {
              amount: 25000,
              vendor: 'Test Vendor',
              description: 'Test payment approval'
            }
          }
        })
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Error testing agent:', error);
      setTestResult({ success: false, error: 'Test failed' });
    }
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'executive': return Shield;
      case 'operational': return Settings;
      case 'analytical': return BarChart3;
      case 'specialist': return Users;
      default: return Bot;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'learning': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${css.dir}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('AI Finance Agents')}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRTL ? 'إدارة وكلاء الذكاء الاصطناعي المالي' : 'Manage AI Finance Agents and Automation'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={exportAgents}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{isRTL ? 'تصدير البيانات' : 'Export Data'}</span>
          </button>
          <div className={`flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-lg ${css.spaceXReverse}`}>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              {isRTL ? 'نشط' : 'System Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedCard variant="gradient">
            <EnhancedCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {isRTL ? 'إجمالي الوكلاء' : 'Total Agents'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {format.number(metrics.totalAgents)}
                  </p>
                </div>
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard variant="gradient">
            <EnhancedCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {isRTL ? 'الوكلاء النشطون' : 'Active Agents'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {format.number(metrics.activeAgents)}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard variant="gradient">
            <EnhancedCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {isRTL ? 'المهام المكتملة' : 'Tasks Completed'}
                  </p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {format.number(metrics.totalTasks)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-indigo-600" />
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard variant="gradient">
            <EnhancedCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {isRTL ? 'معدل النجاح' : 'Success Rate'}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {format.percentage(metrics.averageSuccessRate)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      )}

      {/* AI Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const IconComponent = getAgentTypeIcon(agent.agent_type);
          return (
            <EnhancedCard key={agent.id} variant="glass" className="hover:shadow-xl transition-all duration-300">
              <EnhancedCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <EnhancedCardTitle className="text-lg">
                        {isRTL ? agent.agent_title_ar : agent.agent_title_en}
                      </EnhancedCardTitle>
                      <p className="text-sm text-gray-600">{agent.agent_code}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.agent_status)}`}>
                    {agent.agent_status}
                  </span>
                </div>
              </EnhancedCardHeader>

              <EnhancedCardContent>
                <div className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'المهام المكتملة' : 'Tasks'}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {format.number(agent.tasks_completed)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'معدل النجاح' : 'Success Rate'}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {format.percentage(agent.success_rate)}
                      </p>
                    </div>
                  </div>

                  {/* Authority Level */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        {isRTL ? 'مستوى السلطة' : 'Authority Level'}
                      </span>
                      <span className="text-sm font-medium">
                        {agent.decision_authority_level}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                        style={{ width: `${agent.decision_authority_level * 10}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Primary Functions */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'الوظائف الأساسية' : 'Primary Functions'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {agent.primary_functions.slice(0, 3).map((func, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {func.replace('_', ' ')}
                        </span>
                      ))}
                      {agent.primary_functions.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{agent.primary_functions.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => setSelectedAgent(agent)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isRTL ? 'عرض التفاصيل' : 'View Details'}
                    </button>
                    <button
                      onClick={() => testAgentDecision(agent.agent_code)}
                      className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          );
        })}
      </div>

      {/* Test Result Modal */}
      {testResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <EnhancedCard variant="glass" className="max-w-md w-full mx-4">
            <EnhancedCardHeader>
              <EnhancedCardTitle>
                {isRTL ? 'نتيجة اختبار الوكيل' : 'Agent Test Result'}
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className="flex items-center space-x-2">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {testResult.success ? 
                        (isRTL ? 'نجح الاختبار' : 'Test Successful') : 
                        (isRTL ? 'فشل الاختبار' : 'Test Failed')
                      }
                    </span>
                  </div>
                </div>
                
                {testResult.data && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {isRTL ? 'القرار:' : 'Decision:'} 
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {testResult.data.decision}
                      </span>
                    </p>
                    <p className="text-sm font-medium">
                      {isRTL ? 'الثقة:' : 'Confidence:'} 
                      <span className="ml-2">
                        {format.percentage(testResult.data.confidence * 100)}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">{isRTL ? 'السبب:' : 'Reasoning:'}</span>
                      <br />
                      {testResult.data.reasoning}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => setTestResult(null)}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {isRTL ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      )}

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <EnhancedCard variant="glass" className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <EnhancedCardHeader>
              <EnhancedCardTitle>
                {isRTL ? selectedAgent.agent_title_ar : selectedAgent.agent_title_en}
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-6">
                {/* Agent Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {isRTL ? 'رمز الوكيل' : 'Agent Code'}
                    </p>
                    <p className="text-lg font-semibold">{selectedAgent.agent_code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {isRTL ? 'النوع' : 'Type'}
                    </p>
                    <p className="text-lg font-semibold capitalize">{selectedAgent.agent_type}</p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">
                    {isRTL ? 'مقاييس الأداء' : 'Performance Metrics'}
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'متوسط وقت المعالجة' : 'Avg Processing Time'}
                      </p>
                      <p className="text-lg font-bold">
                        {selectedAgent.average_processing_time}s
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Activity className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'المهام الحالية' : 'Current Tasks'}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedAgent.current_tasks}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'معدل النجاح' : 'Success Rate'}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {format.percentage(selectedAgent.success_rate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Functions */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">
                    {isRTL ? 'الوظائف الأساسية' : 'Primary Functions'}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedAgent.primary_functions.map((func, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-800 capitalize">
                          {func.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAgent(null)}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {isRTL ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      )}
    </div>
  );
}
