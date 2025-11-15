"use client";
import { useState, useEffect } from 'react';
import { Workflow, Plus, Play, Save, Eye, Settings, Trash2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

interface WorkflowNode {
  id: string;
  type: 'start' | 'task' | 'decision' | 'end' | 'approval' | 'notification';
  label: string;
  labelAr: string;
  position: { x: number; y: number };
  data: {
    assignedTo?: string;
    condition?: string;
    action?: string;
    timeout?: number;
  };
}

interface WorkflowTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 'finance' | 'compliance' | 'hr' | 'general';
  nodes: WorkflowNode[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowDesignerPage({ params }: { params: Promise<{ lng: string }> }) {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    params.then(p => setLocale(p.lng as 'ar' | 'en'));
  }, [params]);

  const t = {
    ar: {
      title: 'مصمم سير العمل',
      subtitle: 'إنشاء وإدارة سير العمل التلقائي',
      newWorkflow: 'سير عمل جديد',
      templates: 'القوالب',
      designer: 'المصمم',
      preview: 'معاينة',
      save: 'حفظ',
      delete: 'حذف',
      copy: 'نسخ',
      run: 'تشغيل',
      finance: 'مالي',
      compliance: 'امتثال',
      hr: 'موارد بشرية',
      general: 'عام',
      active: 'نشط',
      inactive: 'غير نشط',
      nodes: 'العقد',
      connections: 'الاتصالات',
      noWorkflows: 'لا توجد سير عمل',
      createFirst: 'إنشاء أول سير عمل'
    },
    en: {
      title: 'Workflow Designer',
      subtitle: 'Create and manage automated workflows',
      newWorkflow: 'New Workflow',
      templates: 'Templates',
      designer: 'Designer',
      preview: 'Preview',
      save: 'Save',
      delete: 'Delete',
      copy: 'Copy',
      run: 'Run',
      finance: 'Finance',
      compliance: 'Compliance',
      hr: 'HR',
      general: 'General',
      active: 'Active',
      inactive: 'Inactive',
      nodes: 'Nodes',
      connections: 'Connections',
      noWorkflows: 'No Workflows',
      createFirst: 'Create First Workflow'
    }
  }[locale];

  // Mock workflow templates
  const mockWorkflows: WorkflowTemplate[] = [
    {
      id: 'wf-1',
      name: 'Invoice Approval',
      nameAr: 'الموافقة على الفواتير',
      description: 'Automated invoice approval process',
      descriptionAr: 'عملية الموافقة التلقائية على الفواتير',
      category: 'finance',
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          label: 'Invoice Received',
          labelAr: 'استلام الفاتورة',
          position: { x: 100, y: 100 },
          data: {}
        },
        {
          id: 'task-1',
          type: 'task',
          label: 'Validate Invoice',
          labelAr: 'التحقق من الفاتورة',
          position: { x: 300, y: 100 },
          data: { assignedTo: 'finance-team' }
        },
        {
          id: 'decision-1',
          type: 'decision',
          label: 'Amount > 10,000?',
          labelAr: 'المبلغ > 10,000؟',
          position: { x: 500, y: 100 },
          data: { condition: 'amount > 10000' }
        },
        {
          id: 'approval-1',
          type: 'approval',
          label: 'Manager Approval',
          labelAr: 'موافقة المدير',
          position: { x: 700, y: 50 },
          data: { assignedTo: 'manager' }
        },
        {
          id: 'end-1',
          type: 'end',
          label: 'Process Complete',
          labelAr: 'اكتمال العملية',
          position: { x: 900, y: 100 },
          data: {}
        }
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'wf-2',
      name: 'Employee Onboarding',
      nameAr: 'إدخال الموظف الجديد',
      description: 'New employee onboarding workflow',
      descriptionAr: 'سير عمل إدخال الموظف الجديد',
      category: 'hr',
      nodes: [
        {
          id: 'start-2',
          type: 'start',
          label: 'New Employee',
          labelAr: 'موظف جديد',
          position: { x: 100, y: 100 },
          data: {}
        },
        {
          id: 'task-2',
          type: 'task',
          label: 'Collect Documents',
          labelAr: 'جمع الوثائق',
          position: { x: 300, y: 100 },
          data: { assignedTo: 'hr-team' }
        },
        {
          id: 'task-3',
          type: 'task',
          label: 'Setup Accounts',
          labelAr: 'إعداد الحسابات',
          position: { x: 500, y: 100 },
          data: { assignedTo: 'it-team' }
        },
        {
          id: 'end-2',
          type: 'end',
          label: 'Onboarding Complete',
          labelAr: 'اكتمال الإدخال',
          position: { x: 700, y: 100 },
          data: {}
        }
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    setWorkflows(mockWorkflows);
    setLoading(false);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'finance': return 'text-green-600 bg-green-50 border-green-200';
      case 'compliance': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'hr': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'general': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'start': return 'bg-green-500';
      case 'task': return 'bg-blue-500';
      case 'decision': return 'bg-yellow-500';
      case 'approval': return 'bg-purple-500';
      case 'notification': return 'bg-orange-500';
      case 'end': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const WorkflowCanvas = ({ workflow }: { workflow: WorkflowTemplate }) => (
    <div className="relative w-full h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        {/* Draw connections between nodes */}
        {workflow.nodes.map((node, index) => {
          const nextNode = workflow.nodes[index + 1];
          if (nextNode) {
            return (
              <line
                key={`connection-${node.id}`}
                x1={node.position.x + 50}
                y1={node.position.y + 25}
                x2={nextNode.position.x}
                y2={nextNode.position.y + 25}
                stroke="#6b7280"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          }
          return null;
        })}
        
        {/* Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6b7280"
            />
          </marker>
        </defs>
      </svg>
      
      {/* Render nodes */}
      {workflow.nodes.map((node) => (
        <div
          key={node.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: node.position.x,
            top: node.position.y
          }}
        >
          <div className={`
            w-24 h-12 rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-lg
            ${getNodeTypeColor(node.type)}
          `}>
            {locale === 'ar' ? node.labelAr : node.label}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-emerald-900/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <Workflow className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                {t.title}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t.subtitle}
              </p>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition">
            <Plus className="h-4 w-4" />
            {t.newWorkflow}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workflow Templates List */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-neutral-700 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                {t.templates}
              </h2>
              
              {workflows.length === 0 ? (
                <div className="text-center py-8">
                  <Workflow className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-600 dark:text-neutral-400 mb-2">{t.noWorkflows}</p>
                  <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                    {t.createFirst}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {workflows.map((workflow, index) => (
                    <motion.div
                      key={workflow.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border cursor-pointer transition ${
                        selectedWorkflow?.id === workflow.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-emerald-300'
                      }`}
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          {locale === 'ar' ? workflow.nameAr : workflow.name}
                        </h3>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(workflow.category)}`}>
                          {t[workflow.category as keyof typeof t]}
                        </div>
                      </div>
                      
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        {locale === 'ar' ? workflow.descriptionAr : workflow.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>{workflow.nodes.length} {t.nodes}</span>
                        <span className={workflow.isActive ? 'text-green-600' : 'text-red-600'}>
                          {workflow.isActive ? t.active : t.inactive}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Workflow Designer/Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-neutral-700 p-6">
              {selectedWorkflow ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                        {locale === 'ar' ? selectedWorkflow.nameAr : selectedWorkflow.name}
                      </h2>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {locale === 'ar' ? selectedWorkflow.descriptionAr : selectedWorkflow.description}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                        <Play className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                        <Save className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Workflow Canvas */}
                  <WorkflowCanvas workflow={selectedWorkflow} />

                  {/* Workflow Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {selectedWorkflow.nodes.length}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t.nodes}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {selectedWorkflow.nodes.length - 1}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t.connections}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className={`text-2xl font-bold ${selectedWorkflow.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedWorkflow.isActive ? t.active : t.inactive}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Status
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <Workflow className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                    {t.designer}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Select a workflow template to start designing
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
