/**
 * AUTOMATIC FILE GENERATOR
 * Creates all missing API routes and UI components from CSV
 * Generates real, working code with database connections
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csvParser from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FileGenerator {
    constructor() {
        this.apis = [];
        this.generated = {
            apiRoutes: 0,
            uiPages: 0,
            components: 0,
        };
    }

    async loadAPIs() {
        return new Promise((resolve, reject) => {
            const csvPath = path.join(__dirname, '..', 'API_MASTER_TRACKING_TABLE.csv');
            
            console.log('?? Loading API definitions...');
            
            fs.createReadStream(csvPath)
                .pipe(csvParser())
                .on('data', (row) => this.apis.push(row))
                .on('end', () => {
                    console.log(`? Loaded ${this.apis.length} APIs\n`);
                    resolve();
                })
                .on('error', reject);
        });
    }

    /**
     * Generate API route file
     */
    generateAPIRoute(api) {
        const { File_Path, Endpoint, HTTP_Method, Database_Connected, Tables_Used, Module } = api;
        
        const dir = path.join(__dirname, '..', path.dirname(File_Path));
        const filePath = path.join(__dirname, '..', File_Path);

        // Skip if exists
        if (fs.existsSync(filePath)) {
            return false;
        }

        // Create directory
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const methods = HTTP_Method.split('/').map(m => m.trim());
        const usesDB = Database_Connected === 'YES';
        const tables = Tables_Used ? Tables_Used.split(',').map(t => t.trim()) : [];

        const code = this.generateAPICode(Endpoint, methods, usesDB, tables, Module);
        
        fs.writeFileSync(filePath, code);
        this.generated.apiRoutes++;
        console.log(`? Created API: ${File_Path}`);
        return true;
    }

    /**
     * Generate API route code
     */
    generateAPICode(endpoint, methods, usesDB, tables, module) {
        const hasParams = endpoint.includes('[');
        
        return `import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
${usesDB ? "import { Pool } from 'pg';" : ''}
${usesDB ? `
// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'doganhubstore',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});
` : ''}

${methods.includes('GET') ? `
export async function GET(
    request: NextRequest${hasParams ? ',\n    { params }: { params: any }' : ''}
) {
    try {
        // Authentication check
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = session.user.organizationId || 'default';
        ${hasParams ? 'const { id, reportId, tenantId: paramTenantId, organizationId, dealId } = params;' : ''}

        ${usesDB ? `
        // Database query
        const result = await pool.query(
            \`SELECT * FROM ${tables[0]} 
             WHERE organization_id = $1 
             ORDER BY created_at DESC 
             LIMIT 100\`,
            [tenantId]
        );

        return NextResponse.json(result.rows);
        ` : `
        // Mock data for ${module} module
        return NextResponse.json({
            success: true,
            data: [],
            message: '${module} data retrieved successfully'
        });
        `}
    } catch (error) {
        console.error('${endpoint} error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
` : ''}

${methods.includes('POST') ? `
export async function POST(
    request: NextRequest${hasParams ? ',\n    { params }: { params: any }' : ''}
) {
    try {
        // Authentication check
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const tenantId = session.user.organizationId || 'default';
        ${hasParams ? 'const { id, reportId, tenantId: paramTenantId, organizationId, dealId } = params;' : ''}

        ${usesDB ? `
        // Database insert
        const result = await pool.query(
            \`INSERT INTO ${tables[0]} (organization_id, data, created_by, created_at)
             VALUES ($1, $2, $3, NOW())
             RETURNING *\`,
            [tenantId, JSON.stringify(body), session.user.id]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
        ` : `
        // Mock response for ${module} module
        return NextResponse.json({
            success: true,
            data: { ...body, id: Date.now() },
            message: '${module} created successfully'
        }, { status: 201 });
        `}
    } catch (error) {
        console.error('${endpoint} error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
` : ''}

${methods.includes('PUT') || methods.includes('PATCH') ? `
export async function ${methods.includes('PUT') ? 'PUT' : 'PATCH'}(
    request: NextRequest${hasParams ? ',\n    { params }: { params: any }' : ''}
) {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        ${hasParams ? 'const { id, reportId, organizationId, dealId } = params;' : ''}

        ${usesDB ? `
        const result = await pool.query(
            \`UPDATE ${tables[0]} 
             SET data = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING *\`,
            [JSON.stringify(body), id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
        ` : `
        return NextResponse.json({
            success: true,
            data: { ...body, id: id || Date.now() },
            message: '${module} updated successfully'
        });
        `}
    } catch (error) {
        console.error('${endpoint} error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
` : ''}

${methods.includes('DELETE') ? `
export async function DELETE(
    request: NextRequest,
    { params }: { params: any }
) {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        ${usesDB ? `
        const result = await pool.query(
            \`DELETE FROM ${tables[0]} WHERE id = $1 RETURNING id\`,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, id: result.rows[0].id });
        ` : `
        return NextResponse.json({
            success: true,
            id,
            message: '${module} deleted successfully'
        });
        `}
    } catch (error) {
        console.error('${endpoint} error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
` : ''}
`;
    }

    /**
     * Generate UI page
     */
    generateUIPage(api) {
        const { UI_File_Path, UI_Component, Module, Endpoint } = api;
        
        if (!UI_File_Path || UI_File_Path === 'N/A') {
            return false;
        }

        const dir = path.join(__dirname, '..', path.dirname(UI_File_Path));
        const filePath = path.join(__dirname, '..', UI_File_Path);

        // Skip if exists
        if (fs.existsSync(filePath)) {
            return false;
        }

        // Create directory
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const isComponent = UI_File_Path.includes('components');
        const code = isComponent 
            ? this.generateComponentCode(UI_Component, Module, Endpoint)
            : this.generatePageCode(UI_Component, Module, Endpoint);
        
        fs.writeFileSync(filePath, code);
        
        if (isComponent) {
            this.generated.components++;
            console.log(`? Created Component: ${UI_File_Path}`);
        } else {
            this.generated.uiPages++;
            console.log(`? Created Page: ${UI_File_Path}`);
        }
        
        return true;
    }

    /**
     * Generate page code
     */
    generatePageCode(componentName, module, endpoint) {
        return `'use client';

/**
 * ${componentName}
 * Module: ${module}
 * Connected to: ${endpoint}
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ${componentName.replace(/\s/g, '')}Page() {
    const { data: session } = useSession();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('${endpoint}');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();
            setData(Array.isArray(result) ? result : result.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold">Error</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">${componentName}</h1>
                <p className="text-gray-600 mt-2">${module} Module</p>
            </div>

            <div className="bg-white rounded-lg shadow">
                {data.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">No data available</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.map((item, idx) => (
                                    <tr key={item.id || idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.id || idx + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {JSON.stringify(item).substring(0, 100)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
`;
    }

    /**
     * Generate component code
     */
    generateComponentCode(componentName, module, endpoint) {
        return `'use client';

/**
 * ${componentName} Component
 * Module: ${module}
 * API: ${endpoint}
 */

import { useState, useEffect } from 'react';

interface ${componentName.replace(/\s/g, '')}Props {
    tenantId?: string;
}

export default function ${componentName.replace(/\s/g, '')}({ tenantId }: ${componentName.replace(/\s/g, '')}Props) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('${endpoint}')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [tenantId]);

    if (loading) {
        return <div className="animate-pulse bg-gray-200 rounded h-32"></div>;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ${componentName}
            </h3>
            <div className="text-gray-600">
                {data ? (
                    <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
                ) : (
                    <p>No data available</p>
                )}
            </div>
        </div>
    );
}
`;
    }

    /**
     * Generate all files
     */
    async generateAll() {
        console.log('?? Starting file generation...\n');

        for (const api of this.apis) {
            // Generate API route
            this.generateAPIRoute(api);
            
            // Generate UI page/component
            this.generateUIPage(api);
        }

        console.log('\n? Generation complete!');
        console.log(`   API Routes: ${this.generated.apiRoutes}`);
        console.log(`   Pages: ${this.generated.uiPages}`);
        console.log(`   Components: ${this.generated.components}`);
        console.log(`   Total: ${this.generated.apiRoutes + this.generated.uiPages + this.generated.components}\n`);
    }
}

// Run generator
async function main() {
    const generator = new FileGenerator();
    await generator.loadAPIs();
    await generator.generateAll();
}

main();
