/**
 * COMPREHENSIVE API-UI CONNECTION VALIDATOR (ES Modules Version)
 * Tests all 95 APIs and their UI component connections
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csvParser from 'csv-parser';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

class APIUIValidator {
    constructor() {
        this.apis = [];
        this.results = {
            total: 0,
            apiFilesExist: 0,
            apiFilesMissing: 0,
            uiFilesExist: 0,
            uiFilesMissing: 0,
            connectionsValid: 0,
            connectionsInvalid: 0,
            errors: [],
        };
        this.detailedResults = [];
    }

    /**
     * Load APIs from CSV
     */
    async loadAPIs() {
        return new Promise((resolve, reject) => {
            const csvPath = path.join(__dirname, '..', 'API_MASTER_TRACKING_TABLE.csv');
            
            console.log(`${colors.blue}?? Loading API definitions from CSV...${colors.reset}`);
            
            if (!fs.existsSync(csvPath)) {
                reject(new Error(`CSV file not found: ${csvPath}`));
                return;
            }

            fs.createReadStream(csvPath)
                .pipe(csvParser())
                .on('data', (row) => {
                    this.apis.push(row);
                })
                .on('end', () => {
                    this.results.total = this.apis.length;
                    console.log(`${colors.green}? Loaded ${this.results.total} APIs${colors.reset}\n`);
                    resolve();
                })
                .on('error', reject);
        });
    }

    /**
     * Check if a file exists
     */
    fileExists(filePath) {
        const fullPath = path.join(__dirname, '..', filePath);
        return fs.existsSync(fullPath);
    }

    /**
     * Check if UI component imports/calls the API
     */
    checkAPIConnection(uiFilePath, endpoint) {
        try {
            const fullPath = path.join(__dirname, '..', uiFilePath);
            
            if (!fs.existsSync(fullPath)) {
                return { connected: false, reason: 'UI file does not exist' };
            }

            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check if the endpoint is referenced in the file
            if (content.includes(endpoint)) {
                return { connected: true, reason: 'Direct API call found' };
            }

            // Check for fetch calls that might use this endpoint
            const fetchPattern = new RegExp(`fetch\\(['\`"][^'\`"]*${endpoint.replace(/\[.*?\]/g, '.*?')}`, 'g');
            if (fetchPattern.test(content)) {
                return { connected: true, reason: 'Fetch call detected' };
            }

            // Check for hook usage
            if (content.includes('useLicensedDashboard') && endpoint.includes('/api/license')) {
                return { connected: true, reason: 'Connected via license hook' };
            }

            return { connected: false, reason: 'No API reference found in UI file' };
        } catch (error) {
            return { connected: false, reason: `Error reading file: ${error.message}` };
        }
    }

    /**
     * Validate a single API
     */
    validateAPI(api) {
        const result = {
            id: api.API_ID,
            module: api.Module,
            endpoint: api.Endpoint,
            apiFile: api.File_Path,
            uiFile: api.UI_File_Path,
            apiExists: false,
            uiExists: false,
            connected: false,
            issues: [],
        };

        // Check API file exists
        result.apiExists = this.fileExists(api.File_Path);
        if (!result.apiExists) {
            result.issues.push(`API file missing: ${api.File_Path}`);
            this.results.apiFilesMissing++;
        } else {
            this.results.apiFilesExist++;
        }

        // Check UI file exists (skip N/A)
        if (api.UI_File_Path && api.UI_File_Path !== 'N/A') {
            result.uiExists = this.fileExists(api.UI_File_Path);
            if (!result.uiExists) {
                result.issues.push(`UI file missing: ${api.UI_File_Path}`);
                this.results.uiFilesMissing++;
            } else {
                this.results.uiFilesExist++;
                
                // Check if UI properly calls the API
                const connection = this.checkAPIConnection(api.UI_File_Path, api.Endpoint);
                result.connected = connection.connected;
                result.connectionReason = connection.reason;
                
                if (connection.connected) {
                    this.results.connectionsValid++;
                } else {
                    this.results.connectionsInvalid++;
                    result.issues.push(`Connection issue: ${connection.reason}`);
                }
            }
        } else {
            result.uiExists = null; // Not applicable
        }

        return result;
    }

    /**
     * Validate all APIs
     */
    async validateAll() {
        console.log(`${colors.cyan}?? Starting validation of ${this.results.total} APIs...${colors.reset}\n`);

        for (const api of this.apis) {
            const result = this.validateAPI(api);
            this.detailedResults.push(result);

            // Print progress
            const status = result.issues.length === 0 ? 
                `${colors.green}?${colors.reset}` : 
                `${colors.red}?${colors.reset}`;
            
            console.log(`${status} API #${result.id}: ${result.module} - ${result.endpoint}`);
            
            if (result.issues.length > 0) {
                result.issues.forEach(issue => {
                    console.log(`   ${colors.yellow}? ${issue}${colors.reset}`);
                });
            }
        }

        console.log('\n');
    }

    /**
     * Generate summary report
     */
    generateReport() {
        console.log(`${colors.bright}${colors.cyan}???????????????????????????????????????????????????????${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}       API-UI CONNECTION VALIDATION REPORT${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}???????????????????????????????????????????????????????${colors.reset}\n`);

        // Overall Statistics
        console.log(`${colors.bright}?? OVERALL STATISTICS:${colors.reset}`);
        console.log(`Total APIs: ${colors.bright}${this.results.total}${colors.reset}`);
        console.log('');

        // API Files
        console.log(`${colors.bright}?? API FILES:${colors.reset}`);
        console.log(`  Exist:    ${colors.green}${this.results.apiFilesExist}${colors.reset} (${this.percentage(this.results.apiFilesExist, this.results.total)}%)`);
        console.log(`  Missing:  ${colors.red}${this.results.apiFilesMissing}${colors.reset} (${this.percentage(this.results.apiFilesMissing, this.results.total)}%)`);
        console.log('');

        // UI Files
        const totalUIFiles = this.results.uiFilesExist + this.results.uiFilesMissing;
        console.log(`${colors.bright}?? UI FILES:${colors.reset}`);
        console.log(`  Exist:    ${colors.green}${this.results.uiFilesExist}${colors.reset} (${this.percentage(this.results.uiFilesExist, totalUIFiles)}%)`);
        console.log(`  Missing:  ${colors.red}${this.results.uiFilesMissing}${colors.reset} (${this.percentage(this.results.uiFilesMissing, totalUIFiles)}%)`);
        console.log('');

        // Connections
        const totalConnections = this.results.connectionsValid + this.results.connectionsInvalid;
        console.log(`${colors.bright}?? API-UI CONNECTIONS:${colors.reset}`);
        console.log(`  Valid:    ${colors.green}${this.results.connectionsValid}${colors.reset} (${this.percentage(this.results.connectionsValid, totalConnections)}%)`);
        console.log(`  Invalid:  ${colors.red}${this.results.connectionsInvalid}${colors.reset} (${this.percentage(this.results.connectionsInvalid, totalConnections)}%)`);
        console.log('');

        // Health Score
        const healthScore = this.calculateHealthScore();
        const healthColor = healthScore >= 80 ? colors.green : healthScore >= 60 ? colors.yellow : colors.red;
        console.log(`${colors.bright}?? OVERALL HEALTH SCORE: ${healthColor}${healthScore.toFixed(1)}%${colors.reset}\n`);

        // Module Breakdown
        this.printModuleBreakdown();

        // Critical Issues
        this.printCriticalIssues();

        console.log(`${colors.bright}${colors.cyan}???????????????????????????????????????????????????????${colors.reset}\n`);
    }

    /**
     * Calculate percentage
     */
    percentage(value, total) {
        if (total === 0) return '0.0';
        return ((value / total) * 100).toFixed(1);
    }

    /**
     * Calculate overall health score
     */
    calculateHealthScore() {
        const apiScore = (this.results.apiFilesExist / this.results.total) * 40;
        const uiScore = (this.results.uiFilesExist / (this.results.uiFilesExist + this.results.uiFilesMissing)) * 30;
        const connectionScore = (this.results.connectionsValid / (this.results.connectionsValid + this.results.connectionsInvalid)) * 30;
        
        return apiScore + uiScore + connectionScore;
    }

    /**
     * Print module breakdown
     */
    printModuleBreakdown() {
        console.log(`${colors.bright}?? MODULE BREAKDOWN:${colors.reset}`);

        const moduleStats = {};
        this.detailedResults.forEach(result => {
            if (!moduleStats[result.module]) {
                moduleStats[result.module] = { total: 0, issues: 0 };
            }
            moduleStats[result.module].total++;
            if (result.issues.length > 0) {
                moduleStats[result.module].issues++;
            }
        });

        Object.keys(moduleStats).sort().forEach(module => {
            const stats = moduleStats[module];
            const healthyAPIs = stats.total - stats.issues;
            const status = stats.issues === 0 ? colors.green : stats.issues < stats.total ? colors.yellow : colors.red;
            
            console.log(`  ${status}${module.padEnd(15)}${colors.reset}: ${healthyAPIs}/${stats.total} healthy`);
        });
        console.log('');
    }

    /**
     * Print critical issues
     */
    printCriticalIssues() {
        const criticalIssues = this.detailedResults.filter(r => r.issues.length > 0);
        
        if (criticalIssues.length === 0) {
            console.log(`${colors.green}${colors.bright}? NO CRITICAL ISSUES FOUND!${colors.reset}\n`);
            return;
        }

        console.log(`${colors.bright}??  CRITICAL ISSUES (${criticalIssues.length}):${colors.reset}`);
        
        criticalIssues.slice(0, 10).forEach(result => {
            console.log(`\n  ${colors.red}? API #${result.id}: ${result.endpoint}${colors.reset}`);
            result.issues.forEach(issue => {
                console.log(`    - ${issue}`);
            });
        });

        if (criticalIssues.length > 10) {
            console.log(`\n  ${colors.yellow}... and ${criticalIssues.length - 10} more issues${colors.reset}`);
        }
        console.log('');
    }

    /**
     * Generate JSON report
     */
    saveJSONReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.results,
            healthScore: this.calculateHealthScore(),
            details: this.detailedResults,
        };

        const reportPath = path.join(__dirname, '..', 'api-ui-validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`${colors.green}? Detailed report saved to: api-ui-validation-report.json${colors.reset}\n`);
    }
}

/**
 * Main execution
 */
async function main() {
    console.log(`${colors.bright}${colors.cyan}`);
    console.log('???????????????????????????????????????????????????????');
    console.log('     API-UI CONNECTION VALIDATOR');
    console.log('     DoganHubStore Enterprise Platform');
    console.log('???????????????????????????????????????????????????????');
    console.log(`${colors.reset}\n`);

    const validator = new APIUIValidator();

    try {
        // Load APIs from CSV
        await validator.loadAPIs();

        // Validate all APIs
        await validator.validateAll();

        // Generate reports
        validator.generateReport();
        validator.saveJSONReport();

        // Exit code based on health
        const healthScore = validator.calculateHealthScore();
        if (healthScore < 80) {
            console.log(`${colors.yellow}? WARNING: Health score below 80%. Please review issues.${colors.reset}\n`);
            process.exit(1);
        } else {
            console.log(`${colors.green}? All systems healthy! Health score: ${healthScore.toFixed(1)}%${colors.reset}\n`);
            process.exit(0);
        }
    } catch (error) {
        console.error(`${colors.red}? Fatal error: ${error.message}${colors.reset}\n`);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run
main();
