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





export async function POST(
    request: NextRequest
) {
    try {
        // Authentication check
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const tenantId = (session.user as any).organizationId || 'default';
        

        
        // Database insert
        const result = await pool.query(
            `INSERT INTO transactions (organization_id, data, created_by, created_at)
             VALUES ($1, $2, $3, NOW())
             RETURNING *`,
            [tenantId, JSON.stringify(body), (session.user as any).id]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
        
    } catch (error) {
        console.error('/api/analytics/anomaly-detection error:', error);
        const msg = (error as any)?.message || 'Unknown error';
        return NextResponse.json(
            { error: 'Internal server error', details: msg },
            { status: 500 }
        );
    }
}





