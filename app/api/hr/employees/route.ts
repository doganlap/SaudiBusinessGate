import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { HRService } from '@/lib/services/hr.service';
import { multiLayerCache, CACHE_TTL, CACHE_PREFIXES } from '@/lib/services/multi-layer-cache.service';
import { requestQueue } from '@/lib/services/request-queue.service';
import { withRateLimit } from '@/lib/middleware/rate-limit';

const hrService = new HRService();

/**
 * GET /api/hr/employees
 * Get all employees with optional filtering
 * Enhanced with caching and rate limiting
 */
export const GET = withRateLimit(async (request: NextRequest) => {
  return requestQueue.processRequest(
    request,
    async (req) => {
      try {
        // Authentication
        const session = await getServerSession();
        if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get tenant ID
        const tenantId =
          req.headers.get('x-tenant-id') ||
          (session.user as any).tenantId ||
          'default-tenant';

        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const department = searchParams.get('department');
        const employment_type = searchParams.get('employment_type');
        const limit = searchParams.get('limit')
          ? parseInt(searchParams.get('limit')!)
          : undefined;
        const offset = searchParams.get('offset')
          ? parseInt(searchParams.get('offset')!)
          : undefined;

        // Build cache key
        const cacheKey = `${CACHE_PREFIXES.HR}employees:${tenantId}:${status || 'all'}:${department || 'all'}:${employment_type || 'all'}`;

        // Get or fetch with caching
        const { employees, summary } = await multiLayerCache.getOrFetch(
          cacheKey,
          async () => {
            return await hrService.getEmployees(tenantId, {
              status: status || undefined,
              department: department || undefined,
              employment_type: employment_type as any,
              limit,
              offset,
            });
          },
          { 
            ttl: CACHE_TTL.MEDIUM, 
            module: 'hr',
            staleWhileRevalidate: true,
          }
        );

        // Return HTTP response with cache headers
        const response = NextResponse.json({
          success: true,
          employees,
          total: employees.length,
          summary,
          source: 'database',
        });

        // Add cache headers
        multiLayerCache.addCacheHeaders(response, {
          maxAge: 300, // 5 minutes
          staleWhileRevalidate: 60,
        });

        return response;
      } catch (error: any) {
        console.error('Error fetching employees:', error);
        return NextResponse.json(
          { success: false, error: error.message || 'Failed to fetch employees' },
          { status: 500 }
        );
      }
    },
    { windowMs: 60000, maxRequests: 100 }
  );
}, { windowMs: 60000, maxRequests: 100 });

/**
 * POST /api/hr/employees
 * Create new employee
 * Enhanced with cache invalidation and rate limiting
 */
export async function POST(request: NextRequest) {
  // Rate limiting is handled at the middleware level
  try {
    // Authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID
    const tenantId =
      request.headers.get('x-tenant-id') ||
      (session.user as any).tenantId ||
      'default-tenant';

    // Parse and validate request body
    const body = await request.json();

    const {
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      job_title,
      employment_type,
      hire_date,
      salary,
      work_location,
      currency,
    } = body;

    // Validation
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'first_name, last_name, and email are required',
        },
        { status: 400 }
      );
    }

    // Call service layer (business logic)
    const employee = await hrService.createEmployee(tenantId, {
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      job_title,
      employment_type,
      hire_date,
      salary,
      work_location,
      currency,
    });

    // Invalidate cache for employees list
    await multiLayerCache.invalidatePattern(`${CACHE_PREFIXES.HR}employees:*`);

    // Return HTTP response
    return NextResponse.json(
      {
        success: true,
        employee,
        message: 'Employee created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating employee:', error);

    // Handle specific error cases
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create employee' },
      { status: 500 }
    );
  }
}
