import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPool } from '@/lib/db/connection';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { RBACService } from '@/lib/auth/rbac-service';
import { apiLogger } from '@/lib/logger';

// Database connection
const pool = getPool();



export async function GET(
    request: NextRequest,
    { params }: { params: any }
) {
    try {
        // Authentication check
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const audit = new AuditLogger(pool);
        const rbac = new RBACService(pool);
        const organizationId = (session.user as any)?.organizationId || 0;
        const userId = (session.user as any)?.id || 0;
        const allowed = await rbac.checkPermission(userId, 'finance.invoices.read', organizationId);
        if (!allowed) {
            await audit.logPermissionCheck(userId, organizationId, 'finance.invoices.read', false);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const tenantId = String(organizationId);
        const { id, reportId, tenantId: paramTenantId, organizationId: paramOrgId, dealId } = params;
        
        
        // Database query
        const result = await pool.query(
            `SELECT * FROM invoices 
             WHERE organization_id = $1 
             ORDER BY created_at DESC 
             LIMIT 100`,
            [tenantId]
        );
        await audit.logDataAccess(userId, organizationId, 'invoice', 0, 'read');
        return NextResponse.json(result.rows);
        
    } catch (error) {
        apiLogger.error('/api/finance/invoices/[id] error', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}







