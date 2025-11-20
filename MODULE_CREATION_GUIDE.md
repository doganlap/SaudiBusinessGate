# Module Creation Guide for SBG Platform

This guide explains how to add a new module to the Saudi Business Gate (SBG) platform.

## Module Structure Requirements

Every module in SBG requires the following components:

### 1. Service Layer (`lib/services/[module-name].service.ts`)

The service contains all business logic and database operations.

**Template:**
```typescript
import { query } from '@/lib/db/connection';

export interface [Module]Item {
  id: string;
  tenant_id: string;
  name: string;
  // ... other fields
  created_at?: Date;
  updated_at?: Date;
}

export class [Module]Service {
  static async get[Items](tenantId: string, filters?: any): Promise<[Module]Item[]> {
    // Implementation
  }

  static async create[Item](tenantId: string, data: any): Promise<[Module]Item> {
    // Implementation
  }

  static async update[Item](tenantId: string, id: string, data: any): Promise<[Module]Item | null> {
    // Implementation
  }

  static async delete[Item](tenantId: string, id: string): Promise<boolean> {
    // Implementation
  }

  static async get[Module]Analytics(tenantId: string, filters?: any): Promise<any> {
    // Analytics implementation
  }
}
```

### 2. API Routes (`app/api/[module-name]/route.ts`)

API endpoints that expose the service methods.

**Template:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { multiLayerCache, CACHE_TTL } from '@/lib/services/multi-layer-cache.service';
import { [Module]Service } from '@/lib/services/[module-name].service';

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    
    const { searchParams } = new URL(request.url);
    const filters = {
      // Extract filters from query params
    };

    const cacheKey = `[module]:list:${tenantId}:${JSON.stringify(filters)}`;
    const items = await multiLayerCache.getOrFetch(
      cacheKey,
      async () => await [Module]Service.get[Items](tenantId, filters),
      { ttl: CACHE_TTL.MEDIUM, module: '[module]', staleWhileRevalidate: true }
    );

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching [items]:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch [items]',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

export const POST = withRateLimit(async (request: NextRequest) => {
  // Implementation for creating items
});
```

### 3. Frontend Pages

#### Main Dashboard Page (`app/[lng]/(platform)/[module-name]/page.tsx`)

**Template:**
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LayoutDashboard,
  Plus,
  // ... other icons
} from 'lucide-react';

export default function [Module]Page() {
  const params = useParams();
  const lng = (params?.lng as string) || 'en';
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/[module-name]', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lng === 'ar' ? '[Arabic Title]' : '[Module Name]'}
          </h1>
          <p className="text-gray-600">
            {lng === 'ar' ? '[Arabic Description]' : '[Description]'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* KPI cards */}
      </div>

      {/* Data Grid */}
      <Card>
        <CardHeader>
          <CardTitle>{lng === 'ar' ? '[Arabic Title]' : 'Overview'}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Data grid content */}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Analytics Page (`app/[lng]/(platform)/[module-name]/analytics/page.tsx`)

**Template:**
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell
} from 'recharts';

export default function [Module]AnalyticsPage() {
  const params = useParams();
  const lng = (params?.lng as string) || 'en';
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/[module-name]/analytics', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      {/* Charts */}
    </div>
  );
}
```

### 4. Navigation Integration (`app/[lng]/layout-shell.tsx`)

Add the module to the navigation menu:

```typescript
{ 
  key: "[module-key]", 
  titleAr: "[Arabic Title]", 
  titleEn: "[Module Name]", 
  items: [
    { 
      k: "[module]-dashboard", 
      ar: "[Arabic Dashboard]", 
      en: "[Module] Dashboard", 
      icon: LayoutDashboard, 
      href: `/${locale}/[module-name]` 
    },
    { 
      k: "[module]-analytics", 
      ar: "[Arabic Analytics]", 
      en: "Analytics", 
      icon: BarChart3, 
      href: `/${locale}/[module-name]/analytics` 
    },
    // ... other sub-items
  ]
}
```

### 5. Database Tables

Create the necessary database tables:

```sql
CREATE TABLE IF NOT EXISTS [module_name]_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  -- other fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_[module]_tenant ON [module_name]_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_[module]_created ON [module_name]_items(created_at);
```

### 6. Service Export (`lib/services/index.ts`)

Export the new service:

```typescript
export { [Module]Service } from './[module-name].service';
```

## Quick Checklist

When adding a new module, ensure you have:

- [ ] Service layer (`lib/services/[module-name].service.ts`)
- [ ] API routes (`app/api/[module-name]/route.ts`)
- [ ] Main dashboard page (`app/[lng]/(platform)/[module-name]/page.tsx`)
- [ ] Analytics page (`app/[lng]/(platform)/[module-name]/analytics/page.tsx`)
- [ ] Navigation integration (`app/[lng]/layout-shell.tsx`)
- [ ] Database tables (SQL migration)
- [ ] Service exports (`lib/services/index.ts`)
- [ ] Type definitions (if needed in `types/` directory)
- [ ] Locale support (Arabic/English translations)

## Example: Adding a "Projects" Module

1. **Service:** `lib/services/project.service.ts`
2. **API:** `app/api/projects/route.ts`
3. **Pages:**
   - `app/[lng]/(platform)/projects/page.tsx`
   - `app/[lng]/(platform)/projects/analytics/page.tsx`
4. **Navigation:** Add to `layout-shell.tsx`
5. **Database:** `projects` table

## Testing Checklist

- [ ] Service methods work correctly
- [ ] API endpoints return proper responses
- [ ] Frontend pages display data correctly
- [ ] Navigation links work
- [ ] Locale switching works (AR/EN)
- [ ] Analytics dashboard shows charts
- [ ] Error handling works
- [ ] Loading states work

## Best Practices

1. **Naming Convention:** Use kebab-case for file names, PascalCase for classes
2. **Error Handling:** Always wrap API calls in try-catch
3. **Loading States:** Show loading indicators during data fetching
4. **Locale Support:** Always support both Arabic and English
5. **Type Safety:** Use TypeScript interfaces for all data structures
6. **Caching:** Use multi-layer caching for API responses
7. **Rate Limiting:** Apply rate limiting to all API endpoints
8. **Responsive Design:** Ensure pages work on mobile and desktop

