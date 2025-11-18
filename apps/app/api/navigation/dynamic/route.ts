import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';

/**
 * DYNAMIC NAVIGATION API
 * Generates navigation structure from CSV and file system
 * Returns real-time availability of all modules and pages
 */

interface API {
    API_ID: string;
    Module: string;
    Endpoint: string;
    HTTP_Method: string;
    File_Path: string;
    Database_Connected: string;
    Tables_Used: string;
    UI_Component: string;
    UI_File_Path: string;
    Description: string;
    Status: string;
}

interface NavItem {
    id: string;
    module: string;
    label: string;
    path: string;
    icon: string;
    badge?: number;
    children?: NavItem[];
    available: boolean;
}

export async function GET(request: NextRequest) {
    try {
        // Load APIs from CSV
        const apis = await loadAPIsFromCSV();
        
        // Group by module
        const moduleMap = new Map<string, API[]>();
        apis.forEach(api => {
            if (!moduleMap.has(api.Module)) {
                moduleMap.set(api.Module, []);
            }
            moduleMap.get(api.Module)!.push(api);
        });

        // Build navigation structure
        const navigation: NavItem[] = [];
        const stats = {
            totalAPIs: apis.length,
            availableAPIs: 0,
            modules: moduleMap.size,
        };

        // Check which files actually exist
        moduleMap.forEach((moduleAPIs, moduleName) => {
            const modulePages = new Set<string>();
            const children: NavItem[] = [];
            
            moduleAPIs.forEach(api => {
                if (api.UI_File_Path && api.UI_File_Path !== 'N/A') {
                    const pagePath = extractPagePath(api.UI_File_Path);
                    if (pagePath && !modulePages.has(pagePath)) {
                        modulePages.add(pagePath);
                        
                        const available = fileExists(api.UI_File_Path) && fileExists(api.File_Path);
                        if (available) {
                            stats.availableAPIs++;
                        }
                        
                        children.push({
                            id: `${moduleName}-${api.API_ID}`,
                            module: moduleName,
                            label: api.UI_Component,
                            path: pagePath,
                            icon: getComponentIcon(api.UI_Component),
                            available,
                        });
                    }
                }
            });

            // Get main module path
            const mainPath = getModulePath(moduleName);
            
            navigation.push({
                id: moduleName,
                module: moduleName,
                label: moduleName,
                path: mainPath,
                icon: getModuleIcon(moduleName),
                badge: children.filter(c => c.available).length,
                children: children.length > 0 ? children : undefined,
                available: children.some(c => c.available),
            });
        });

        // Sort by module name
        navigation.sort((a, b) => a.module.localeCompare(b.module));

        return NextResponse.json({
            modules: Array.from(moduleMap.keys()),
            items: navigation,
            stats,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Dynamic navigation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate navigation', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

/**
 * Load APIs from CSV
 */
async function loadAPIsFromCSV(): Promise<API[]> {
    return new Promise((resolve, reject) => {
        const apis: API[] = [];
        const csvPath = path.join(process.cwd(), 'API_MASTER_TRACKING_TABLE.csv');

        fs.createReadStream(csvPath)
            .pipe(csvParser())
            .on('data', (row) => apis.push(row as API))
            .on('end', () => resolve(apis))
            .on('error', reject);
    });
}

/**
 * Check if file exists
 */
function fileExists(filePath: string): boolean {
    try {
        const fullPath = path.join(process.cwd(), filePath);
        return fs.existsSync(fullPath);
    } catch {
        return false;
    }
}

/**
 * Extract page path from UI file path
 */
function extractPagePath(uiFilePath: string): string | null {
    // Convert file path to URL path
    // app/dashboard/page.tsx -> /dashboard
    // app/reports/[reportId]/page.tsx -> /reports
    
    if (!uiFilePath.includes('page.tsx')) {
        return null; // Component, not a page
    }

    const match = uiFilePath.match(/app\/(.+?)\/page\.tsx/);
    if (match) {
        let pagePath = '/' + match[1];
        // Remove dynamic segments for main nav
        pagePath = pagePath.replace(/\/\[.*?\]/g, '');
        return pagePath;
    }

    return null;
}

/**
 * Get module main path
 */
function getModulePath(module: string): string {
    const paths: Record<string, string> = {
        'Dashboard': '/dashboard',
        'Analytics': '/analytics',
        'Reports': '/reports',
        'Finance': '/finance',
        'CRM': '/crm',
        'Billing': '/billing',
        'License': '/admin/licenses',
        'GRC': '/grc',
        'HR': '/hr',
        'AI': '/ai',
        'Integrations': '/integrations',
        'Themes': '/settings/theme',
        'Platform': '/admin',
        'Workflows': '/workflows',
        'Payment': '/payments',
        'Authentication': '/auth',
    };
    return paths[module] || `/${module.toLowerCase()}`;
}

/**
 * Get module icon
 */
function getModuleIcon(module: string): string {
    const icons: Record<string, string> = {
        'Dashboard': '??',
        'Analytics': '??',
        'Reports': '??',
        'Finance': '??',
        'CRM': '??',
        'Billing': '??',
        'License': '??',
        'GRC': '???',
        'HR': '??',
        'AI': '??',
        'Integrations': '??',
        'Themes': '??',
        'Platform': '??',
        'Workflows': '??',
        'Payment': '??',
        'Authentication': '??',
    };
    return icons[module] || '??';
}

/**
 * Get component icon
 */
function getComponentIcon(componentName: string): string {
    if (componentName.includes('List')) return '??';
    if (componentName.includes('Dashboard')) return '??';
    if (componentName.includes('Form')) return '??';
    if (componentName.includes('Create')) return '?';
    if (componentName.includes('Edit')) return '??';
    if (componentName.includes('View')) return '???';
    if (componentName.includes('Settings')) return '??';
    return '�';
}
