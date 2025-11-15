# 🚀 دليل الميزات المتقدمة - Advanced Features Guide

## **المتجر السعودي - Saudi Store**

---

## **📦 المكتبات المطلوبة - Required Libraries**

### **✅ تم التأكد من التثبيت:**

```json
{
  "dependencies": {
    "tailwindcss": "^3.4.14",          // ✅ مثبت
    "framer-motion": "^11.11.17",      // ✅ مضاف
    "lucide-react": "^0.553.0",        // ✅ مثبت
    "cmdk": "^1.0.0",                  // ✅ مضاف (Command Palette)
    "socket.io": "^4.8.1",             // ✅ مضاف (Server)
    "socket.io-client": "^4.8.1"       // ✅ مثبت (Client)
  }
}
```

### **تثبيت المكتبات:**
```bash
npm install framer-motion cmdk socket.io
```

---

## **1. ⌨️ Command Palette (Ctrl/⌘K)**

### **الملف:** `components/CommandPalette.tsx`

### **الميزات:**
✅ اختصار لوحة مفاتيح (Ctrl/Cmd + K)  
✅ بحث سريع في جميع الصفحات  
✅ RBAC - إخفاء العناصر حسب الدور  
✅ دعم ثنائي اللغة (AR/EN)  
✅ تصميم Glassmorphic  
✅ إجراءات سريعة (Theme, Language, Logout)  

### **الاستخدام:**
```tsx
import CommandPalette from '@/components/CommandPalette';

<CommandPalette 
  locale="ar"
  userRole="admin"
  onThemeToggle={() => setDark(!dark)}
  onLocaleToggle={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
/>
```

### **RBAC - الأدوار:**
- **user:** Dashboard, Sales
- **manager:** + Finance, Reports, Analytics
- **admin:** + Users, Billing, Security
- **super_admin:** + Tenants, All Settings

### **الاختصارات:**
- `Ctrl/Cmd + K` - فتح Command Palette
- `↑↓` - التنقل
- `Enter` - اختيار
- `ESC` - إغلاق

---

## **2. 📊 Real-Time Workflow Timeline**

### **الملف:** `components/RealTimeWorkflowTimeline.tsx`

### **الميزات:**
✅ اتصال WebSocket للتحديثات الفورية  
✅ عرض حالة سير العمل (Queued, Running, Completed, Failed)  
✅ تتبع الخطوات بالوقت الفعلي  
✅ شريط تقدم للخطوات الجارية  
✅ رسوم متحركة Framer Motion  
✅ دعم ثنائي اللغة  

### **الاستخدام:**
```tsx
import RealTimeWorkflowTimeline from '@/components/RealTimeWorkflowTimeline';

<RealTimeWorkflowTimeline 
  locale="ar"
  tenantId="tenant-123"
  workflowId="workflow-456" // اختياري
/>
```

### **WebSocket Events:**
```typescript
// Server → Client
socket.emit('workflow:update', workflowInstance);
socket.emit('workflow:step:update', { workflowId, step });
socket.emit('workflow:created', newWorkflow);

// Client → Server
socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));
```

### **API Endpoint:**
```typescript
// GET /api/workflows/instances?tenantId=xxx&workflowId=yyy
{
  "workflows": [
    {
      "id": "wf-123",
      "workflowName": "Compliance Check",
      "workflowNameAr": "فحص الامتثال",
      "status": "running",
      "steps": [
        {
          "id": "step-1",
          "stepName": "Initialize",
          "stepNameAr": "التهيئة",
          "status": "completed",
          "startedAt": "2025-01-01T10:00:00Z",
          "completedAt": "2025-01-01T10:00:05Z",
          "duration": 5000
        }
      ]
    }
  ]
}
```

---

## **3. 🎨 Royal Enterprise Theme**

### **الألوان الرئيسية:**
```css
/* Saudi Store Theme - Emerald/Green */
--primary: from-emerald-400/70 via-green-400/70 to-teal-400/70;
--accent: from-cyan-400/70 to-sky-400/70;
--success: from-emerald-500 to-teal-500;
--warning: from-amber-500 to-orange-500;
--error: from-rose-500 to-red-500;
--info: from-blue-500 to-cyan-500;

/* Glassmorphic */
--glass-bg: bg-white/10 dark:bg-neutral-900/40;
--glass-border: border-white/15;
--glass-ring: ring-1 ring-white/10;
--glass-blur: backdrop-blur-xl;
```

### **تطبيق الثيم:**
```tsx
// في التصميم
className="rounded-2xl border border-white/15 bg-white/10 
           dark:bg-neutral-900/40 backdrop-blur-xl 
           ring-1 ring-white/10 shadow-xl"
```

---

## **4. 🔐 RBAC - Role-Based Access Control**

### **الأدوار المتاحة:**
```typescript
type UserRole = 
  | 'viewer'        // عرض فقط
  | 'user'          // مستخدم عادي
  | 'manager'       // مدير
  | 'admin'         // مسؤول
  | 'tenant_admin'  // مسؤول العميل
  | 'super_admin';  // مسؤول النظام
```

### **الصلاحيات:**
```typescript
const permissions = {
  viewer: ['dashboard:read'],
  user: ['dashboard:read', 'sales:read', 'sales:create'],
  manager: ['dashboard:*', 'sales:*', 'finance:read', 'reports:read'],
  admin: ['*:read', '*:create', '*:update', 'users:*'],
  tenant_admin: ['tenant:*'],
  super_admin: ['*:*']
};
```

### **إخفاء العناصر حسب الدور:**
```tsx
// في Navigation
const navItems = [
  { 
    label: 'Users', 
    href: '/users', 
    roles: ['admin', 'super_admin'] 
  },
  { 
    label: 'Tenants', 
    href: '/tenants', 
    roles: ['super_admin'] 
  }
].filter(item => item.roles.includes(userRole));

// في Component
{userRole === 'admin' || userRole === 'super_admin' ? (
  <AdminPanel />
) : null}
```

---

## **5. 🌐 WebSocket Server Setup**

### **ملف:** `server/websocket.ts`

```typescript
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  const { tenantId, workflowId } = socket.handshake.query;
  
  // Join tenant room
  if (tenantId) {
    socket.join(`tenant:${tenantId}`);
  }
  
  // Join workflow room
  if (workflowId) {
    socket.join(`workflow:${workflowId}`);
  }
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Emit workflow updates
export function emitWorkflowUpdate(tenantId: string, workflow: any) {
  io.to(`tenant:${tenantId}`).emit('workflow:update', workflow);
}

export function emitStepUpdate(tenantId: string, workflowId: string, step: any) {
  io.to(`tenant:${tenantId}`).emit('workflow:step:update', { workflowId, step });
}

httpServer.listen(3051, () => {
  console.log('🚀 WebSocket server running on port 3051');
});
```

### **تشغيل السيرفر:**
```bash
# في package.json
"scripts": {
  "ws": "ts-node server/websocket.ts",
  "dev:all": "concurrently \"npm run dev\" \"npm run ws\""
}

# تشغيل
npm run ws
```

---

## **6. 📊 Database Schema للـ Workflows**

```sql
-- جدول Workflow Instances
CREATE TABLE workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  workflow_name VARCHAR(255) NOT NULL,
  workflow_name_ar VARCHAR(255),
  status VARCHAR(50) NOT NULL, -- queued, running, completed, failed, paused
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_by UUID REFERENCES platform_users(id)
);

-- جدول Workflow Steps
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id),
  step_name VARCHAR(255) NOT NULL,
  step_name_ar VARCHAR(255),
  step_order INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL, -- pending, running, completed, failed, paused
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  progress INTEGER DEFAULT 0, -- 0-100
  details TEXT,
  details_ar TEXT,
  agent_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_workflow_instances_tenant ON workflow_instances(tenant_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_workflow_steps_instance ON workflow_steps(workflow_instance_id);
CREATE INDEX idx_workflow_steps_status ON workflow_steps(status);

-- Trigger للتحديث التلقائي
CREATE OR REPLACE FUNCTION update_workflow_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_instances_updated_at
  BEFORE UPDATE ON workflow_instances
  FOR EACH ROW EXECUTE FUNCTION update_workflow_timestamp();

CREATE TRIGGER workflow_steps_updated_at
  BEFORE UPDATE ON workflow_steps
  FOR EACH ROW EXECUTE FUNCTION update_workflow_timestamp();
```

---

## **7. 🎯 API Endpoints للـ Workflows**

### **GET /api/workflows/instances**
```typescript
// app/api/workflows/instances/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId');
  const workflowId = searchParams.get('workflowId');
  
  const workflows = await query(`
    SELECT 
      wi.*,
      json_agg(
        json_build_object(
          'id', ws.id,
          'stepName', ws.step_name,
          'stepNameAr', ws.step_name_ar,
          'status', ws.status,
          'startedAt', ws.started_at,
          'completedAt', ws.completed_at,
          'duration', ws.duration_ms,
          'progress', ws.progress,
          'details', ws.details,
          'detailsAr', ws.details_ar
        ) ORDER BY ws.step_order
      ) as steps
    FROM workflow_instances wi
    LEFT JOIN workflow_steps ws ON ws.workflow_instance_id = wi.id
    WHERE wi.tenant_id = $1
    ${workflowId ? 'AND wi.id = $2' : ''}
    GROUP BY wi.id
    ORDER BY wi.created_at DESC
  `, workflowId ? [tenantId, workflowId] : [tenantId]);
  
  return Response.json({ workflows: workflows.rows });
}
```

### **POST /api/workflows/instances**
```typescript
export async function POST(req: Request) {
  const { tenantId, workflowName, workflowNameAr, steps } = await req.json();
  
  const client = await getClient();
  try {
    await client.query('BEGIN');
    
    // Create workflow instance
    const workflow = await client.query(`
      INSERT INTO workflow_instances (tenant_id, workflow_name, workflow_name_ar, status)
      VALUES ($1, $2, $3, 'queued')
      RETURNING *
    `, [tenantId, workflowName, workflowNameAr]);
    
    // Create steps
    for (let i = 0; i < steps.length; i++) {
      await client.query(`
        INSERT INTO workflow_steps (
          workflow_instance_id, step_name, step_name_ar, 
          step_order, status
        ) VALUES ($1, $2, $3, $4, 'pending')
      `, [workflow.rows[0].id, steps[i].name, steps[i].nameAr, i]);
    }
    
    await client.query('COMMIT');
    
    // Emit WebSocket event
    emitWorkflowUpdate(tenantId, workflow.rows[0]);
    
    return Response.json({ success: true, workflow: workflow.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

---

## **8. 📝 Tooltips**

### **استخدام Tooltips:**
```tsx
import { Tooltip } from '@/components/ui/Tooltip';

<Tooltip content="هذا زر للحفظ" contentAr="Save button">
  <button>حفظ</button>
</Tooltip>
```

---

## **9. ✅ قائمة التحقق - Checklist**

### **المكتبات:**
- ✅ Tailwind CSS (مثبت)
- ✅ Framer Motion (مضاف)
- ✅ Lucide React (مثبت)
- ✅ CMDK (مضاف)
- ✅ Socket.IO (مضاف)

### **المكونات:**
- ✅ Command Palette
- ✅ Real-Time Workflow Timeline
- ✅ RBAC Integration
- ✅ Glassmorphic Theme

### **الميزات:**
- ✅ اختصارات لوحة المفاتيح
- ✅ WebSocket للتحديثات الفورية
- ✅ إخفاء العناصر حسب الدور
- ✅ دعم ثنائي اللغة
- ✅ رسوم متحركة

---

## **10. 🚀 التشغيل**

### **تثبيت المكتبات:**
```bash
npm install
```

### **تشغيل التطوير:**
```bash
# Next.js
npm run dev

# WebSocket Server
npm run ws

# كلاهما معاً
npm run dev:all
```

### **متغيرات البيئة:**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3050
NEXT_PUBLIC_WS_URL=http://localhost:3051
```

---

**🎉 جميع الميزات المتقدمة جاهزة!**

**الميزات:**
✅ Command Palette (Ctrl/⌘K)  
✅ Real-Time Workflow Timeline  
✅ RBAC - إخفاء حسب الدور  
✅ Royal Enterprise Theme  
✅ WebSocket Integration  
✅ Framer Motion Animations  
✅ Bilingual AR/EN  

**جاهز للاستخدام!** 🚀
