// Mock Database with Real Arabic KSA Data
export const mockDatabase = {
  users: [
    { id: '1', tenantId: '1', email: 'mohammed.otaibi@riyadh-trade.sa', fullName: 'محمد بن عبدالله العتيبي', role: 'admin', isActive: true },
    { id: '2', tenantId: '1', email: 'fahad.qahtani@riyadh-trade.sa', fullName: 'فهد بن سعد القحطاني', role: 'manager', isActive: true },
    { id: '3', tenantId: '2', email: 'abdulaziz.sulami@jeddah-invest.sa', fullName: 'عبدالعزيز بن خالد السلمي', role: 'admin', isActive: true },
    { id: '4', tenantId: '2', email: 'sarah.ghamdi@jeddah-invest.sa', fullName: 'سارة بنت أحمد الغامدي', role: 'user', isActive: true },
    { id: '5', tenantId: '3', email: 'noura.shamri@dammam-services.sa', fullName: 'نورة بنت فيصل الشمري', role: 'manager', isActive: true },
  ],

  tenants: [
    { id: '1', name: 'شركة الرياض للتجارة', slug: 'riyadh-trade', city: 'الرياض', status: 'active' },
    { id: '2', name: 'مؤسسة جدة للاستثمار', slug: 'jeddah-invest', city: 'جدة', status: 'active' },
    { id: '3', name: 'شركة الدمام للخدمات', slug: 'dammam-services', city: 'الدمام', status: 'active' },
    { id: '4', name: 'مجموعة مكة التجارية', slug: 'makkah-group', city: 'مكة المكرمة', status: 'active' },
    { id: '5', name: 'شركة المدينة للتطوير', slug: 'madinah-dev', city: 'المدينة المنورة', status: 'active' },
  ],

  customers: [
    { id: '1', tenantId: '1', name: 'شركة المستقبل للتجارة', email: 'info@almustaqbal.sa', phone: '+966501234567', city: 'الرياض' },
    { id: '2', tenantId: '1', name: 'مؤسسة الأمل التجارية', email: 'contact@alamal.sa', phone: '+966502345678', city: 'جدة' },
    { id: '3', tenantId: '1', name: 'شركة النور للمقاولات', email: 'info@alnoor.sa', phone: '+966503456789', city: 'الدمام' },
    { id: '4', tenantId: '2', name: 'مجموعة الفجر القابضة', email: 'info@alfajr.sa', phone: '+966504567890', city: 'الرياض' },
    { id: '5', tenantId: '2', name: 'شركة التطوير المتقدم', email: 'contact@tatweer.sa', phone: '+966505678901', city: 'جدة' },
  ],

  employees: [
    { id: '1', tenantId: '1', fullName: 'محمد بن عبدالله العتيبي', position: 'مدير عام', department: 'إدارة', salary: 25000, hireDate: '2022-01-15' },
    { id: '2', tenantId: '1', fullName: 'فهد بن سعد القحطاني', position: 'مدير مبيعات', department: 'مبيعات', salary: 18000, hireDate: '2022-03-20' },
    { id: '3', tenantId: '1', fullName: 'سارة بنت أحمد الغامدي', position: 'محاسبة', department: 'مالية', salary: 12000, hireDate: '2023-01-10' },
    { id: '4', tenantId: '1', fullName: 'نورة بنت فيصل الشمري', position: 'موظفة موارد بشرية', department: 'موارد بشرية', salary: 11000, hireDate: '2023-02-15' },
    { id: '5', tenantId: '1', fullName: 'خالد بن محمد الدوسري', position: 'مطور برمجيات', department: 'تقنية', salary: 15000, hireDate: '2023-05-01' },
  ],

  transactions: [
    { id: '1', date: '2024-11-01', type: 'INCOME', amount: 125000, description: 'إيراد مبيعات - العميل: شركة المستقبل', accountName: 'البنك - الراجحي' },
    { id: '2', date: '2024-11-03', type: 'INCOME', amount: 85000, description: 'إيراد خدمات - العميل: مؤسسة الأمل', accountName: 'البنك - الراجحي' },
    { id: '3', date: '2024-11-05', type: 'INCOME', amount: 95000, description: 'إيراد مبيعات - العميل: شركة النور', accountName: 'البنك - الأهلي' },
    { id: '4', date: '2024-11-10', type: 'EXPENSE', amount: 98000, description: 'رواتب الموظفين - الشهر الحالي', accountName: 'البنك - الراجحي' },
    { id: '5', date: '2024-11-12', type: 'EXPENSE', amount: 35000, description: 'إيجار المكتب - الشهر الحالي', accountName: 'البنك - الأهلي' },
    { id: '6', date: '2024-11-14', type: 'INCOME', amount: 110000, description: 'تحصيل من عميل - مجموعة الفجر', accountName: 'البنك - الأهلي' },
    { id: '7', date: '2024-11-16', type: 'EXPENSE', amount: 45000, description: 'سداد للمورد - شركة التوريدات', accountName: 'البنك - الراجحي' },
    { id: '8', date: '2024-11-18', type: 'INCOME', amount: 145000, description: 'عقد خدمات - شركة التطوير المتقدم', accountName: 'البنك - الراجحي' },
  ],

  invoices: [
    { id: '1', number: 'INV-2024-001', customer: 'شركة المستقبل للتجارة', date: '2024-11-01', amount: 125000, vat: 18750, total: 143750, status: 'paid' },
    { id: '2', number: 'INV-2024-002', customer: 'مؤسسة الأمل التجارية', date: '2024-11-03', amount: 85000, vat: 12750, total: 97750, status: 'paid' },
    { id: '3', number: 'INV-2024-003', customer: 'شركة النور للمقاولات', date: '2024-11-05', amount: 95000, vat: 14250, total: 109250, status: 'paid' },
    { id: '4', number: 'INV-2024-004', customer: 'مجموعة الفجر القابضة', date: '2024-11-14', amount: 110000, vat: 16500, total: 126500, status: 'paid' },
    { id: '5', number: 'INV-2024-005', customer: 'شركة التطوير المتقدم', date: '2024-11-18', amount: 145000, vat: 21750, total: 166750, status: 'pending' },
  ],

  deals: [
    { id: '1', tenantId: '1', name: 'عقد خدمات سنوي - شركة المستقبل', customer: 'شركة المستقبل للتجارة', value: 500000, stage: 'negotiation', probability: 75 },
    { id: '2', tenantId: '1', name: 'توريد معدات - مؤسسة الأمل', customer: 'مؤسسة الأمل التجارية', value: 350000, stage: 'proposal', probability: 60 },
    { id: '3', tenantId: '1', name: 'مشروع تطوير - شركة النور', customer: 'شركة النور للمقاولات', value: 850000, stage: 'closed_won', probability: 100 },
    { id: '4', tenantId: '2', name: 'استشارات إدارية - مجموعة الفجر', customer: 'مجموعة الفجر القابضة', value: 275000, stage: 'qualified', probability: 50 },
    { id: '5', tenantId: '2', name: 'خدمات تقنية - شركة التطوير', customer: 'شركة التطوير المتقدم', value: 425000, stage: 'presentation', probability: 65 },
  ],

  activities: [
    { id: '1', tenantId: '1', type: 'meeting', title: 'اجتماع مع شركة المستقبل', description: 'مناقشة العقد السنوي', date: '2024-11-15', assignee: 'محمد بن عبدالله العتيبي' },
    { id: '2', tenantId: '1', type: 'call', title: 'مكالمة مع مؤسسة الأمل', description: 'متابعة الطلب', date: '2024-11-16', assignee: 'فهد بن سعد القحطاني' },
    { id: '3', tenantId: '1', type: 'email', title: 'بريد لشركة النور', description: 'إرسال العرض', date: '2024-11-17', assignee: 'فهد بن سعد القحطاني' },
    { id: '4', tenantId: '2', type: 'meeting', title: 'زيارة ميدانية - مجموعة الفجر', description: 'معاينة الموقع', date: '2024-11-17', assignee: 'عبدالعزيز بن خالد السلمي' },
    { id: '5', tenantId: '2', type: 'call', title: 'مكالمة متابعة - شركة التطوير', description: 'تأكيد الاجتماع', date: '2024-11-18', assignee: 'عبدالعزيز بن خالد السلمي' },
  ],

  salesOrders: [
    { id: '1', orderNumber: 'SO-2024-001', customer: 'شركة المستقبل للتجارة', date: '2024-11-01', amount: 125000, status: 'confirmed' },
    { id: '2', orderNumber: 'SO-2024-002', customer: 'مؤسسة الأمل التجارية', date: '2024-11-05', amount: 85000, status: 'confirmed' },
    { id: '3', orderNumber: 'SO-2024-003', customer: 'شركة النور للمقاولات', date: '2024-11-10', amount: 95000, status: 'pending' },
    { id: '4', orderNumber: 'SO-2024-004', customer: 'مجموعة الفجر القابضة', date: '2024-11-15', amount: 110000, status: 'pending' },
    { id: '5', orderNumber: 'SO-2024-005', customer: 'شركة التطوير المتقدم', date: '2024-11-18', amount: 145000, status: 'pending' },
  ],
};

export function getStats() {
  const totalRevenue = mockDatabase.transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = mockDatabase.transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalUsers: mockDatabase.users.length,
    totalCustomers: mockDatabase.customers.length,
    totalEmployees: mockDatabase.employees.length,
    totalDeals: mockDatabase.deals.length,
    activeSales: mockDatabase.salesOrders.filter(o => o.status === 'pending').length,
    recentActivities: mockDatabase.activities.length,
    monthlyRevenue: totalRevenue,
    monthlyExpenses: totalExpenses,
    netProfit: totalRevenue - totalExpenses,
  };
}
