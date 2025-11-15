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







export async function PATCH(
    request: NextRequest,
    { params }: { params: any }
) {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, reportId, organizationId, dealId } = params;

        
        const result = await pool.query(
            `UPDATE deals 
             SET data = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [JSON.stringify(body), id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
        
    } catch (error) {
        console.error('/api/crm/deals/[dealId]/stage error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}



