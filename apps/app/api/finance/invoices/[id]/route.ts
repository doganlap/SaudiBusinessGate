import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Pool } from 'pg';

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'doganhubstore',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});



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

        const tenantId = session.user.organizationId || 'default';
        const { id, reportId, tenantId: paramTenantId, organizationId, dealId } = params;

        
        // Database query
        const result = await pool.query(
            `SELECT * FROM invoices 
             WHERE organization_id = $1 
             ORDER BY created_at DESC 
             LIMIT 100`,
            [tenantId]
        );

        return NextResponse.json(result.rows);
        
    } catch (error) {
        console.error('/api/finance/invoices/[id] error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}







