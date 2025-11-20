/**
 * Multi-Tenant Navigation Structure
 * Supports Platform Admin, Tenant Admin, and Team Member roles
 * SINGLE SOURCE OF TRUTH - Used by both React Router and Next.js apps
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Shield, Users, DollarSign, Settings, 
  Crown, BarChart3, Home, Target, FileText, AlertTriangle,
  CheckCircle, Activity, Bell, Bot, TrendingUp, Globe,
  Briefcase, Database, Code, ChevronDown, ChevronRight, Zap,
  Workflow, Calendar, Brain, Search, FolderOpen,
  Scale, BarChart2, Building, ShieldCheck, MessageSquare,
  Upload, Monitor, LayoutDashboard, Globe2, UserCheck, Package
} from 'lucide-react';

/**
 * Multi-Tenant Navigation Configuration
 * Based on user role: platform_admin, tenant_admin, team_member
 */
export const getNavigationForRole = (userRole, tenantContext, stats = {}) => {
  const normalizeRole = (role) => {
    if (!role) return 'team_member';
    const r = String(role).toLowerCase();
    if (['platform_admin','admin','super_admin'].includes(r)) return 'platform_admin';
    if (['tenant_admin','organization_admin','org_admin','owner','tenant_owner','organization_owner'].includes(r)) return 'tenant_admin';
    return 'team_member';
  };
  const roleNorm = normalizeRole(userRole);
  let advancedEnabled = roleNorm !== 'team_member';
  try {
    const pref = localStorage.getItem('enable_advanced_ui');
    if (pref !== null) advancedEnabled = pref === 'true';
  } catch {}
  const baseNavigation = {
    platform_admin: [
      { id: 'platform-dashboard', name: 'Platform Dashboard', icon: Crown, path: '/app', items: [], category: 'Platform' },
      {
        id: 'platform-licenses', name: 'License Management', icon: Shield, collapsed: true,
        items: [
          { id: 'advanced-dashboard', name: 'Advanced Analytics Dashboard', path: '/app/advanced', icon: BarChart3 },
          { id: 'auto-assessment', name: 'Auto Assessment Generator', path: '/app/auto-assessment', icon: Zap },
          { id: 'usage-analytics', name: 'Usage Analytics', path: '/app/usage', icon: Activity },
          { id: 'renewals-pipeline', name: 'Renewals Pipeline', path: '/app/renewals', icon: TrendingUp },
          { id: 'licenses-catalog', name: 'License Catalog', path: '/app/licenses', icon: Shield }
        ],
        category: 'Platform'
      },
      {
        id: 'onboarding-preview', name: 'Onboarding & Preview', icon: Users, collapsed: false,
        items: [
          { id: 'tenant-onboarding', name: 'Onboarding', path: '/app/onboarding', icon: Users },
          { id: 'tenant-preview', name: 'Tenant Preview', path: '/app/dashboard/tenant', icon: Home }
        ],
        category: 'Platform'
      },
      {
        id: 'users-access', name: 'Users & Access', icon: ShieldCheck, collapsed: true,
        items: [
          { id: 'users', name: 'Users', path: '/app/users', icon: Users },
          { id: 'roles-permissions', name: 'Roles & Permissions', path: '/app/settings/security', icon: ShieldCheck }
        ],
        category: 'Platform'
      },
      {
        id: 'platform-ai-services', name: 'AI & Intelligence', icon: Brain, collapsed: true,
        items: [
          { id: 'rag-service', name: 'RAG Service', path: '/app/ai/rag', icon: Brain },
          { id: 'regulatory-intelligence', name: 'Regulatory Intelligence', path: '/app/regulatory', icon: Search },
          { id: 'sector-intelligence', name: 'Sector Intelligence', path: '/app/regulatory/sectors', icon: BarChart2 }
        ],
        category: 'Platform'
      },
      {
        id: 'tenant-management', name: 'Tenant Management', icon: Building2, collapsed: false,
        items: [
          { id: 'all-tenants', name: 'All Tenants', path: '/app/organizations', icon: Building2, badge: stats.tenants || 0 },
          { id: 'tenant-billing', name: 'Billing & Subscriptions', path: '/app/licenses', icon: DollarSign, badge: stats.invoices || 0 },
          { id: 'tenant-licenses', name: 'License Management', path: '/app/licenses', icon: Shield }
        ],
        category: 'Platform'
      },
      {
        id: 'platform-analytics', name: 'Platform Analytics', icon: BarChart3, collapsed: true,
        items: [
          { id: 'revenue-analytics', name: 'Revenue & Growth', path: '/app/reports', icon: TrendingUp },
          { id: 'usage-analytics', name: 'Usage Analytics', path: '/app/usage', icon: Activity },
          { id: 'compliance-overview', name: 'Compliance Overview', path: '/app/reports/compliance', icon: CheckCircle }
        ],
        category: 'Platform'
      },
      {
        id: 'platform-automation', name: 'Platform Automation', icon: Bot, collapsed: true,
        items: [
          { id: 'regulatory-engine', name: 'Regulatory Engine', path: '/app/regulatory', icon: Globe },
          { id: 'platform-workflows', name: 'Global Workflows', path: '/app/workflows', icon: Workflow },
          { id: 'ai-scheduler', name: 'AI Scheduler', path: '/app/ai/scheduler', icon: Calendar }
        ],
        category: 'Platform'
      },
      {
        id: 'system-management', name: 'System Management', icon: Settings, collapsed: true, category: 'Platform',
        items: [
          { id: 'database', name: 'Database Management', path: '/app/database', icon: Database },
          { id: 'api-management', name: 'API Management', path: '/app/system/api', icon: Code },
          { id: 'system-health', name: 'System Health', path: '/app/system/health', icon: Monitor }
        ]
      },
      {
        id: 'advanced-ui', name: 'Advanced UI', icon: BarChart3, collapsed: true, category: 'Platform',
        items: [
          { id: 'advanced-dashboard', name: 'Advanced Dashboard', path: '/advanced', icon: BarChart3 },
          { id: 'modern-dashboard', name: 'Modern Advanced Dashboard', path: '/app/dashboard/advanced', icon: LayoutDashboard },
          { id: 'regulatory-market', name: 'Regulatory Market Dashboard', path: '/app/dashboard/regulatory-market', icon: Globe2 },
          { id: 'advanced-assessments', name: 'Advanced Assessments', path: '/advanced/assessments', icon: FileText },
          { id: 'advanced-frameworks', name: 'Advanced Frameworks', path: '/advanced/frameworks', icon: Target },
          { id: 'advanced-controls', name: 'Advanced Controls', path: '/app/controls', icon: Shield },
          { id: 'advanced-reports', name: 'Advanced Reports', path: '/app/reports', icon: BarChart3 }
        ],
        visible: advancedEnabled
      },
      {
        id: 'administration', name: 'Administration', icon: Building2, collapsed: false,
        items: [
          { id: 'all-tenants', name: 'All Tenants', path: '/app/organizations', icon: Building2, badge: stats.tenants || 0 },
          { id: 'tenant-billing', name: 'Billing & Subscriptions', path: '/app/licenses', icon: DollarSign, badge: stats.invoices || 0 }
        ],
        category: 'Platform'
      },
      {
        id: 'sales-module-platform', name: 'Sales', icon: TrendingUp, collapsed: true, category: 'Platform',
        items: [
          { id: 'sales-dashboard', name: 'Sales Dashboard', path: '/app/sales', icon: BarChart3 },
          { id: 'sales-pipeline', name: 'Sales Pipeline', path: '/app/sales/pipeline', icon: Target },
          { id: 'sales-deals', name: 'Deals', path: '/app/sales/deals', icon: Briefcase },
          { id: 'sales-leads', name: 'Leads', path: '/app/sales/leads', icon: Users },
          { id: 'sales-quotes', name: 'Quotes', path: '/app/sales/quotes', icon: FileText },
          { id: 'sales-orders', name: 'Orders', path: '/app/sales/orders', icon: CheckCircle }
        ]
      },
      {
        id: 'hr-module-platform', name: 'HR Management', icon: UserCheck, collapsed: true, category: 'Platform',
        items: [
          { id: 'hr-dashboard', name: 'HR Dashboard', path: '/[lng]/hr', icon: BarChart3 },
          { id: 'hr-employees', name: 'Employees', path: '/[lng]/hr/employees', icon: Users },
          { id: 'hr-employees-create', name: 'Create Employee', path: '/hr/employees/create', icon: Users },
          { id: 'hr-attendance', name: 'Attendance', path: '/[lng]/hr/attendance', icon: Calendar },
          { id: 'hr-attendance-log', name: 'Log Attendance', path: '/hr/attendance/log', icon: Calendar },
          { id: 'hr-payroll', name: 'Payroll', path: '/[lng]/hr/payroll', icon: DollarSign },
          { id: 'hr-payroll-process', name: 'Process Payroll', path: '/hr/payroll/process', icon: DollarSign }
        ]
      },
      {
        id: 'procurement-module-platform', name: 'Procurement', icon: Package, collapsed: true, category: 'Platform',
        items: [
          { id: 'procurement-dashboard', name: 'Procurement Dashboard', path: '/[lng]/procurement', icon: BarChart3 },
          { id: 'procurement-orders', name: 'Purchase Orders', path: '/[lng]/procurement/orders', icon: FileText },
          { id: 'procurement-orders-create', name: 'Create Order', path: '/procurement/orders/create', icon: FileText },
          { id: 'procurement-vendors', name: 'Vendors', path: '/[lng]/procurement/vendors', icon: Building2 },
          { id: 'procurement-vendors-create', name: 'Create Vendor', path: '/procurement/vendors/create', icon: Building2 },
          { id: 'procurement-inventory', name: 'Inventory', path: '/[lng]/procurement/inventory', icon: Package },
          { id: 'procurement-inventory-create', name: 'Add Item', path: '/procurement/inventory/create', icon: Package }
        ]
      }
    ],
    tenant_admin: [
      { id: 'tenant-dashboard', name: 'Home Dashboard', icon: Home, path: '/app/dashboard/tenant', items: [], category: 'GRC' },
      {
        id: 'grc-core', name: 'GRC Core Modules', icon: Shield, collapsed: false, category: 'GRC',
        items: [
          { id: 'frameworks', name: 'Frameworks', path: '/app/frameworks', icon: Target, badge: stats.frameworks || 0 },
          { id: 'assessments', name: 'Assessments', path: '/app/assessments', icon: FileText, badge: stats.assessments || 0 },
          { id: 'risks', name: 'Risks', path: '/app/risks', icon: AlertTriangle, badge: stats.risks || 0 },
          { id: 'controls', name: 'Controls', path: '/app/controls', icon: Shield, badge: stats.controls || 0 },
          { id: 'compliance', name: 'Compliance Tracking', path: '/app/compliance', icon: CheckCircle },
          { id: 'tasks', name: 'Task Management', path: '/app/tasks', icon: CheckCircle },
          { id: 'tasks-board', name: 'Task Board', path: '/app/tasks/board', icon: CheckCircle },
          { id: 'gaps', name: 'Gap Analysis', path: '/app/gaps', icon: AlertTriangle },
          { id: 'remediation', name: 'Remediation Plans', path: '/app/remediation', icon: Target },
          { id: 'evidence-upload', name: 'Evidence Upload', path: '/app/evidence/upload', icon: Upload }
        ]
      },
      {
        id: 'organization-management', name: 'Organization Management', icon: Building2, collapsed: true, category: 'Team',
        items: [
          { id: 'teams-users', name: 'Teams & Users', path: '/app/users', icon: Users, badge: stats.users || 0 },
          { id: 'departments', name: 'Departments', path: '/app/organizations', icon: Building2 },
          { id: 'onboarding', name: 'Onboarding', path: '/app/onboarding', icon: Users },
          { id: 'roles-permissions', name: 'Roles & Permissions', path: '/app/settings/security', icon: ShieldCheck },
          { id: 'documents', name: 'Document Management', path: '/app/documents', icon: FolderOpen }
        ]
      },
      { id: 'reports-analytics', name: 'Reports & Analytics', icon: BarChart3, path: `/tenant/${tenantContext?.id}/reports`, items: [], category: 'GRC' },
      { id: 'vendors-partners', name: 'Vendors & Partners', icon: Briefcase, path: `/tenant/${tenantContext?.id}/partners`, items: [], category: 'Team' },
      { id: 'documents-evidence', name: 'Documents & Evidence', icon: FileText, path: `/tenant/${tenantContext?.id}/documents`, items: [], category: 'Team' },
      { id: 'workflows', name: 'Workflows', icon: Workflow, path: `/tenant/${tenantContext?.id}/workflows`, items: [], category: 'Team' },
      { id: 'team-communication', name: 'Team Communication', icon: Users, collapsed: true, category: 'Team',
        items: [
          { id: 'announcements', name: 'Announcements', path: '/app/notifications', icon: Bell },
          { id: 'partner-collab', name: 'Partner Collaboration', path: `/tenant/${tenantContext?.id}/partners`, icon: Briefcase },
          { id: 'shared-docs', name: 'Shared Documents', path: `/tenant/${tenantContext?.id}/documents`, icon: FolderOpen }
        ]
      },
      {
        id: 'advanced-ui-grc', name: 'Advanced UI', icon: BarChart3, collapsed: true, category: 'GRC',
        items: [
          { id: 'advanced-dashboard', name: 'Advanced Dashboard', path: '/advanced', icon: BarChart3 },
          { id: 'modern-dashboard', name: 'Modern Advanced Dashboard', path: '/app/dashboard/advanced', icon: LayoutDashboard },
          { id: 'regulatory-market', name: 'Regulatory Market Dashboard', path: '/app/dashboard/regulatory-market', icon: Globe2 },
          { id: 'advanced-assessments', name: 'Advanced Assessments', path: '/advanced/assessments', icon: FileText },
          { id: 'advanced-frameworks', name: 'Advanced Frameworks', path: '/advanced/frameworks', icon: Target },
          { id: 'advanced-controls', name: 'Advanced Controls', path: '/app/controls', icon: Shield },
          { id: 'advanced-reports', name: 'Advanced Reports', path: '/app/reports', icon: BarChart3 }
        ],
        visible: advancedEnabled
      },
      { id: 'team-communication', name: 'Team Communication', icon: MessageSquare, collapsed: true, category: 'Team',
        items: [
          { id: 'announcements', name: 'Announcements', path: '/app/notifications', icon: Bell },
          { id: 'collaborations', name: 'Collaborations', path: `/tenant/${tenantContext?.id}/partners`, icon: Users },
          { id: 'share-center', name: 'Shared Documents', path: `/tenant/${tenantContext?.id}/documents`, icon: FolderOpen }
        ]
      },
      { id: 'ai-services', name: 'AI Services', icon: Bot, path: `/tenant/${tenantContext?.id}/rag`, items: [], category: 'GRC', visible: !!(stats.aiLicensed || tenantContext?.aiLicensed) },
      {
        id: 'sales-module', name: 'Sales', icon: TrendingUp, collapsed: true, category: 'Business',
        items: [
          { id: 'sales-dashboard', name: 'Sales Dashboard', path: '/app/sales', icon: BarChart3 },
          { id: 'sales-pipeline', name: 'Sales Pipeline', path: '/app/sales/pipeline', icon: Target },
          { id: 'sales-deals', name: 'Deals', path: '/app/sales/deals', icon: Briefcase },
          { id: 'sales-leads', name: 'Leads', path: '/app/sales/leads', icon: Users },
          { id: 'sales-quotes', name: 'Quotes', path: '/app/sales/quotes', icon: FileText },
          { id: 'sales-orders', name: 'Orders', path: '/app/sales/orders', icon: CheckCircle }
        ]
      },
      {
        id: 'hr-module', name: 'HR Management', icon: UserCheck, collapsed: true, category: 'Business',
        items: [
          { id: 'hr-dashboard', name: 'HR Dashboard', path: '/[lng]/hr', icon: BarChart3 },
          { id: 'hr-employees', name: 'Employees', path: '/[lng]/hr/employees', icon: Users },
          { id: 'hr-employees-create', name: 'Create Employee', path: '/hr/employees/create', icon: Users },
          { id: 'hr-attendance', name: 'Attendance', path: '/[lng]/hr/attendance', icon: Calendar },
          { id: 'hr-attendance-log', name: 'Log Attendance', path: '/hr/attendance/log', icon: Calendar },
          { id: 'hr-payroll', name: 'Payroll', path: '/[lng]/hr/payroll', icon: DollarSign },
          { id: 'hr-payroll-process', name: 'Process Payroll', path: '/hr/payroll/process', icon: DollarSign }
        ]
      },
      {
        id: 'procurement-module', name: 'Procurement', icon: Package, collapsed: true, category: 'Business',
        items: [
          { id: 'procurement-dashboard', name: 'Procurement Dashboard', path: '/[lng]/procurement', icon: BarChart3 },
          { id: 'procurement-orders', name: 'Purchase Orders', path: '/[lng]/procurement/orders', icon: FileText },
          { id: 'procurement-orders-create', name: 'Create Order', path: '/procurement/orders/create', icon: FileText },
          { id: 'procurement-vendors', name: 'Vendors', path: '/[lng]/procurement/vendors', icon: Building2 },
          { id: 'procurement-vendors-create', name: 'Create Vendor', path: '/procurement/vendors/create', icon: Building2 },
          { id: 'procurement-inventory', name: 'Inventory', path: '/[lng]/procurement/inventory', icon: Package },
          { id: 'procurement-inventory-create', name: 'Add Item', path: '/procurement/inventory/create', icon: Package }
        ]
      }
    ],
    team_member: [
      { id: 'my-dashboard', name: 'Home Dashboard', icon: Home, path: '/app/dashboard/tenant', items: [], category: 'Team' },
      { id: 'my-assessments', name: 'My Assessments', icon: FileText, path: '/app/assessments', badge: stats.myAssessments || 0, items: [], category: 'Team' },
      { id: 'my-tasks', name: 'My Tasks', icon: CheckCircle, path: '/app/tasks/list', badge: stats.myTasks || 0, items: [], category: 'Team' },
      { id: 'tasks-board', name: 'Task Board', path: '/app/tasks/board', icon: CheckCircle, items: [], category: 'Team' },
      { id: 'my-documents', name: 'My Documents', icon: FileText, path: '/app/documents', items: [], category: 'Team' },
      { id: 'compliance-status', name: 'Compliance Status', icon: CheckCircle, path: '/app/compliance', items: [], category: 'Team' },
      { id: 'reports-view', name: 'Reports', icon: BarChart3, path: '/app/reports', items: [], category: 'Team' },
      { id: 'team-tools', name: 'Team Tools', icon: Users, collapsed: true, category: 'Team',
        items: [
          { id: 'chat', name: 'Real-Time Chat', path: '/app/mission-control', icon: MessageSquare },
          { id: 'announcements', name: 'Announcements', path: '/app/notifications', icon: Bell },
          { id: 'shared-docs', name: 'Shared Documents', path: '/app/documents', icon: FolderOpen }
        ]
      },
      {
        id: 'advanced-ui-team', name: 'Advanced UI', icon: BarChart3, collapsed: true, category: 'Team',
        items: [
          { id: 'advanced-dashboard', name: 'Advanced Dashboard', path: '/advanced', icon: BarChart3 },
          { id: 'modern-dashboard', name: 'Modern Advanced Dashboard', path: '/app/dashboard/advanced', icon: LayoutDashboard },
          { id: 'regulatory-market', name: 'Regulatory Market Dashboard', path: '/app/dashboard/regulatory-market', icon: Globe2 },
          { id: 'advanced-assessments', name: 'Advanced Assessments', path: '/advanced/assessments', icon: FileText },
          { id: 'advanced-frameworks', name: 'Advanced Frameworks', path: '/advanced/frameworks', icon: Target },
          { id: 'advanced-controls', name: 'Advanced Controls', path: '/app/controls', icon: Shield },
          { id: 'advanced-reports', name: 'Advanced Reports', path: '/app/reports', icon: BarChart3 }
        ],
        visible: advancedEnabled
      },
      {
        id: 'sales-module-team', name: 'Sales', icon: TrendingUp, collapsed: true, category: 'Business',
        items: [
          { id: 'sales-pipeline', name: 'Sales Pipeline', path: '/app/sales/pipeline', icon: Target },
          { id: 'sales-deals', name: 'My Deals', path: '/app/sales/deals', icon: Briefcase },
          { id: 'sales-leads', name: 'My Leads', path: '/app/sales/leads', icon: Users }
        ]
      },
      {
        id: 'hr-module-team', name: 'HR', icon: UserCheck, collapsed: true, category: 'Business',
        items: [
          { id: 'hr-employees-team', name: 'Employees', path: '/[lng]/hr/employees', icon: Users },
          { id: 'hr-attendance-team', name: 'My Attendance', path: '/[lng]/hr/attendance', icon: Calendar },
          { id: 'hr-attendance-log-team', name: 'Log Attendance', path: '/hr/attendance/log', icon: Calendar }
        ]
      }
    ]
  };

  const nav = baseNavigation[normalizeRole(userRole)] || baseNavigation.team_member;
  const filtered = nav
    .filter(section => section.visible !== false)
    .map(section => {
      if (section.items && section.items.length) {
        const items = section.items.filter(item => item.visible !== false);
        return { ...section, items };
      }
      return section;
    });
  return filtered;
};

/**
 * Tenant Selector Component for Platform Admin
 * Framework-agnostic - works with both React Router and Next.js
 */
export const TenantSelector = ({ currentTenant, tenants, onTenantSwitch }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Note: Theme hook should be imported by the component using this
  // This is a framework-agnostic component

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {currentTenant?.name || 'All Tenants'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {currentTenant ? 'Client Organization' : 'Platform View'}
            </div>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border z-50 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="max-h-60 overflow-y-auto">
            <button
              onClick={() => {
                onTenantSwitch(null);
                setIsOpen(false);
              }}
              className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-900 dark:text-white">
                  Platform View
                </span>
              </div>
            </button>
            {tenants.map(tenant => (
              <button
                key={tenant.id}
                onClick={() => {
                  onTenantSwitch(tenant);
                  setIsOpen(false);
                }}
                className={`w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  currentTenant?.id === tenant.id ? 'bg-blue-600 text-white' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{tenant.name}</div>
                    <div className="text-xs opacity-75 text-gray-500 dark:text-gray-400">{tenant.compliance}% Compliant</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Role Badge Component
 * Framework-agnostic
 */
export const RoleBadge = ({ role }) => {
  const roleConfig = {
    platform_admin: { label: 'Platform Admin', icon: Crown, color: 'bg-purple-600' },
    tenant_admin: { label: 'Tenant Admin', icon: Building2, color: 'bg-blue-600' },
    team_member: { label: 'Team Member', icon: Users, color: 'bg-green-600' }
  };

  const config = roleConfig[role] || roleConfig.team_member;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  );
};

/**
 * Role Activation Panel
 * Framework-agnostic - requires useApp, useI18n, useTheme to be provided by parent
 */
export const RoleActivationPanel = ({ role, currentTenant, tenants = [], onTenantSwitch, useAppHook, useI18nHook, useThemeHook }) => {
  const [list, setList] = useState(tenants || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === 'platform_admin' && (!list || list.length === 0)) {
      setLoading(true);
      // Dynamic import to avoid framework-specific dependencies
      import('../../services/api').then(({ apiServices }) => {
        apiServices.tenants.getAll()
          .then(res => {
            const data = res?.data?.data || res?.data || [];
            setList(Array.isArray(data) ? data : []);
          })
          .catch(() => setList([]))
          .finally(() => setLoading(false));
      }).catch(() => setLoading(false));
    }
  }, [role]);
  
  return (
    <div className="auto-container w-full max-w-full">
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="w-auto-responsive">
          <RoleBadge role={role} />
        </div>
        {role === 'platform_admin' && (
          <div className="flex-1 min-w-0 w-auto-responsive">
            <TenantSelector 
              currentTenant={currentTenant} 
              tenants={list} 
              onTenantSwitch={(tenant) => {
                try {
                  if (tenant && tenant.id) {
                    localStorage.setItem('tenant_id', String(tenant.id));
                  } else {
                    localStorage.removeItem('tenant_id');
                  }
                } catch {}
                if (useAppHook?.actions) {
                  useAppHook.actions.setCurrentTenant(tenant || null);
                }
                onTenantSwitch?.(tenant || null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  getNavigationForRole,
  TenantSelector,
  RoleBadge,
  RoleActivationPanel
};

