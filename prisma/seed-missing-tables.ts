import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMissingTables() {
  console.log('🌱 Seeding missing tables...');

  try {
    // Seed AI Agents
    console.log('📊 Seeding AI Agents...');
    await prisma.aIAgent.createMany({
      data: [
        {
          tenantId: 'demo-tenant',
          name: 'Finance Analyzer Pro',
          nameAr: 'محلل مالي محترف',
          agentType: 'finance_analyzer',
          status: 'active',
          description: 'Advanced AI agent for financial analysis, transaction monitoring, and budget optimization',
          descriptionAr: 'وكيل ذكي متقدم للتحليل المالي ومراقبة المعاملات وتحسين الميزانية',
          capabilities: ['Transaction Analysis', 'Budget Forecasting', 'Risk Assessment', 'Anomaly Detection', 'Financial Reporting'],
          model: 'gpt-4',
          provider: 'OpenAI',
          tasksCompleted: 1247,
          tasksInProgress: 3,
          successRate: 98.5,
          avgResponseTime: 2.3,
          configuration: {
            maxConcurrentTasks: 10,
            timeout: 30000,
            retryAttempts: 3,
            priority: 'high'
          },
          metrics: {
            totalRequests: 1265,
            successfulRequests: 1247,
            failedRequests: 18,
            averageProcessingTime: 2.3,
            uptime: 99.2
          }
        },
        {
          tenantId: 'demo-tenant',
          name: 'Compliance Monitor',
          nameAr: 'مراقب الامتثال',
          agentType: 'compliance_monitor',
          status: 'active',
          description: 'Automated compliance monitoring and regulatory requirement tracking',
          descriptionAr: 'مراقبة الامتثال التلقائية وتتبع المتطلبات التنظيمية',
          capabilities: ['Regulatory Compliance', 'Risk Assessment', 'Audit Trail', 'Policy Monitoring', 'Violation Detection'],
          model: 'gpt-4',
          provider: 'OpenAI',
          tasksCompleted: 876,
          tasksInProgress: 2,
          successRate: 98.1,
          avgResponseTime: 3.1,
          configuration: {
            maxConcurrentTasks: 5,
            timeout: 45000,
            retryAttempts: 2,
            priority: 'high'
          },
          metrics: {
            totalRequests: 892,
            successfulRequests: 876,
            failedRequests: 16,
            averageProcessingTime: 3.1,
            uptime: 98.1
          }
        },
        {
          tenantId: 'demo-tenant',
          name: 'Fraud Detector',
          nameAr: 'كاشف الاحتيال',
          agentType: 'fraud_detector',
          status: 'active',
          description: 'Real-time fraud detection and suspicious activity monitoring',
          descriptionAr: 'كشف الاحتيال في الوقت الفعلي ومراقبة الأنشطة المشبوهة',
          capabilities: ['Fraud Detection', 'Pattern Recognition', 'Risk Scoring', 'Alert Generation', 'Investigation Support'],
          model: 'gpt-4',
          provider: 'OpenAI',
          tasksCompleted: 2089,
          tasksInProgress: 5,
          successRate: 97.8,
          avgResponseTime: 1.8,
          configuration: {
            maxConcurrentTasks: 15,
            timeout: 20000,
            retryAttempts: 3,
            priority: 'critical'
          },
          metrics: {
            totalRequests: 2156,
            successfulRequests: 2089,
            failedRequests: 67,
            averageProcessingTime: 1.8,
            uptime: 97.8
          }
        }
      ],
      skipDuplicates: true
    });

    // Seed Themes
    console.log('🎨 Seeding Themes...');
    await prisma.theme.createMany({
      data: [
        {
          tenantId: 'demo-tenant',
          name: 'Saudi Store Default',
          nameAr: 'المتجر السعودي الافتراضي',
          description: 'Default theme with Saudi green colors and modern design',
          descriptionAr: 'المظهر الافتراضي بالألوان السعودية الخضراء والتصميم العصري',
          isDefault: true,
          isActive: true,
          colors: {
            primary: '#059669',
            secondary: '#0d9488',
            accent: '#0ea5e9',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#0f172a',
            textSecondary: '#64748b',
            border: '#e2e8f0',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
          },
          typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: {
              xs: '0.75rem',
              sm: '0.875rem',
              base: '1rem',
              lg: '1.125rem',
              xl: '1.25rem',
              '2xl': '1.5rem',
              '3xl': '1.875rem'
            },
            fontWeight: {
              normal: 400,
              medium: 500,
              semibold: 600,
              bold: 700
            }
          },
          spacing: {
            xs: '0.5rem',
            sm: '1rem',
            md: '1.5rem',
            lg: '2rem',
            xl: '3rem',
            '2xl': '4rem'
          },
          borderRadius: {
            sm: '0.25rem',
            md: '0.5rem',
            lg: '0.75rem',
            xl: '1rem',
            full: '9999px'
          },
          shadows: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
          },
          branding: {
            companyName: 'Saudi Store',
            companyNameAr: 'المتجر السعودي',
            tagline: 'Smart Business Management Platform',
            taglineAr: 'منصة إدارة الأعمال الذكية'
          }
        }
      ],
      skipDuplicates: true
    });

    // Seed Workflow Templates
    console.log('⚡ Seeding Workflow Templates...');
    await prisma.workflowTemplate.createMany({
      data: [
        {
          tenantId: 'demo-tenant',
          name: 'Invoice Approval Workflow',
          nameAr: 'سير عمل الموافقة على الفواتير',
          description: 'Automated invoice approval process with multi-level authorization',
          descriptionAr: 'عملية الموافقة التلقائية على الفواتير مع التفويض متعدد المستويات',
          category: 'finance',
          isActive: true,
          isPublished: true,
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
              data: {
                assignedTo: 'finance-team',
                timeout: 86400000,
                retryAttempts: 2
              }
            },
            {
              id: 'decision-1',
              type: 'decision',
              label: 'Amount > 10,000?',
              labelAr: 'المبلغ > 10,000؟',
              position: { x: 500, y: 100 },
              data: {
                condition: 'amount > 10000'
              }
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
          edges: [
            { id: 'e1', source: 'start-1', target: 'task-1' },
            { id: 'e2', source: 'task-1', target: 'decision-1' },
            { id: 'e3', source: 'decision-1', target: 'end-1' }
          ]
        },
        {
          tenantId: 'demo-tenant',
          name: 'Employee Onboarding',
          nameAr: 'إدخال الموظف الجديد',
          description: 'Complete employee onboarding process with document collection and training',
          descriptionAr: 'عملية إدخال الموظف الجديد الكاملة مع جمع الوثائق والتدريب',
          category: 'hr',
          isActive: true,
          isPublished: true,
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
              id: 'task-3',
              type: 'task',
              label: 'Collect Documents',
              labelAr: 'جمع الوثائق',
              position: { x: 300, y: 100 },
              data: {
                assignedTo: 'hr-team',
                timeout: 259200000
              }
            },
            {
              id: 'end-2',
              type: 'end',
              label: 'Onboarding Complete',
              labelAr: 'اكتمال الإدخال',
              position: { x: 500, y: 100 },
              data: {}
            }
          ],
          edges: [
            { id: 'e8', source: 'start-2', target: 'task-3' },
            { id: 'e9', source: 'task-3', target: 'end-2' }
          ]
        }
      ],
      skipDuplicates: true
    });

    console.log('✅ All missing tables seeded successfully!');
    
    // Verify data
    const agentCount = await prisma.aIAgent.count();
    const themeCount = await prisma.theme.count();
    const workflowCount = await prisma.workflowTemplate.count();
    
    console.log('📊 Seeded data summary:');
    console.log(`   🤖 AI Agents: ${agentCount}`);
    console.log(`   🎨 Themes: ${themeCount}`);
    console.log(`   ⚡ Workflow Templates: ${workflowCount}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedMissingTables();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
