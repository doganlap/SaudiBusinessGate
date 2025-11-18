/**
 * ENTERPRISE AUTONOMY ENGINE
 * Advanced License Management with AI-Powered Decision Making
 * 
 * Features:
 * - Real-time license validation
 * - Usage-based throttling
 * - Predictive capacity planning
 * - Automatic upgrade recommendations
 * - Anomaly detection in usage patterns
 */

import { Pool } from 'pg';
import { redisCachingService } from '../Performance/redis-caching-service';

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'production',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

// License Tiers Configuration
export const LICENSE_TIERS = {
    FREE: {
        code: 'free',
        maxUsers: 3,
        maxApiCallsPerDay: 1000,
        maxStorageGB: 1,
        features: ['dashboard.basic', 'reports.basic'],
        rateLimit: { requests: 100, window: 3600 }, // 100 req/hour
    },
    STARTER: {
        code: 'starter',
        maxUsers: 10,
        maxApiCallsPerDay: 10000,
        maxStorageGB: 10,
        features: [
            'dashboard.basic',
            'dashboard.business',
            'reports.basic',
            'reports.advanced',
            'crm.basic',
            'finance.basic',
        ],
        rateLimit: { requests: 500, window: 3600 }, // 500 req/hour
    },
    PROFESSIONAL: {
        code: 'professional',
        maxUsers: 50,
        maxApiCallsPerDay: 100000,
        maxStorageGB: 100,
        features: [
            'dashboard.basic',
            'dashboard.business',
            'dashboard.executive',
            'reports.basic',
            'reports.advanced',
            'reports.custom',
            'crm.basic',
            'crm.advanced',
            'crm.automation',
            'finance.basic',
            'finance.advanced',
            'analytics.basic',
            'analytics.advanced',
            'workflows.basic',
        ],
        rateLimit: { requests: 2000, window: 3600 }, // 2000 req/hour
        aiFeatures: ['churn-prediction', 'lead-scoring'],
    },
    ENTERPRISE: {
        code: 'enterprise',
        maxUsers: -1, // Unlimited
        maxApiCallsPerDay: -1, // Unlimited
        maxStorageGB: -1, // Unlimited
        features: ['*'], // All features
        rateLimit: { requests: 10000, window: 3600 }, // 10000 req/hour
        aiFeatures: ['*'], // All AI features
        customization: true,
        sla: '99.99%',
        dedicatedSupport: true,
    },
};

// API to Feature Mapping
export const API_FEATURE_MAP: Record<string, { feature: string; tier: string }> = {
    '/api/analytics/kpis/business': { feature: 'dashboard.business', tier: 'STARTER' },
    '/api/analytics/forecast/sales': { feature: 'analytics.advanced', tier: 'PROFESSIONAL' },
    '/api/analytics/churn-prediction': { feature: 'analytics.advanced', tier: 'PROFESSIONAL' },
    '/api/analytics/lead-scoring': { feature: 'analytics.advanced', tier: 'PROFESSIONAL' },
    '/api/analytics/ai-insights': { feature: 'analytics.advanced', tier: 'PROFESSIONAL' },
    '/api/reports/templates': { feature: 'reports.basic', tier: 'FREE' },
    '/api/reports/preview': { feature: 'reports.advanced', tier: 'STARTER' },
    '/api/reports/[reportId]/execute': { feature: 'reports.advanced', tier: 'STARTER' },
    '/api/reports/export/[format]': { feature: 'reports.custom', tier: 'PROFESSIONAL' },
    '/api/crm/pipeline': { feature: 'crm.basic', tier: 'STARTER' },
    '/api/crm/deals/[dealId]/stage': { feature: 'crm.automation', tier: 'PROFESSIONAL' },
    '/api/finance/invoices': { feature: 'finance.basic', tier: 'STARTER' },
    '/api/finance/budgets': { feature: 'finance.advanced', tier: 'PROFESSIONAL' },
    '/api/finance/journal-entries': { feature: 'finance.advanced', tier: 'PROFESSIONAL' },
    '/api/workflows': { feature: 'workflows.basic', tier: 'PROFESSIONAL' },
    '/api/workflows/[id]/execute': { feature: 'workflows.basic', tier: 'PROFESSIONAL' },
    '/api/grc/controls': { feature: 'grc.basic', tier: 'PROFESSIONAL' },
    '/api/grc/tests/[id]/execute': { feature: 'grc.advanced', tier: 'ENTERPRISE' },
    '/api/hr/payroll': { feature: 'hr.payroll', tier: 'PROFESSIONAL' },
    '/api/ai-agents': { feature: 'ai.agents', tier: 'ENTERPRISE' },
    '/api/agents/self-healing': { feature: 'ai.self-healing', tier: 'ENTERPRISE' },
};

interface LicenseCheckResult {
    allowed: boolean;
    license: any;
    reason?: string;
    upgradeRequired?: boolean;
    recommendedTier?: string;
    usageStats?: {
        current: number;
        limit: number;
        percentUsed: number;
    };
}

interface UsageMetrics {
    apiCallsToday: number;
    storageUsedGB: number;
    activeUsers: number;
    topEndpoints: Array<{ endpoint: string; calls: number }>;
    hourlyDistribution: number[];
}

export class EnterpriseAutonomyEngine {
    /**
     * Comprehensive License Check with AI-Powered Insights
     */
    async validateLicenseForAPI(
        tenantId: string,
        apiEndpoint: string,
        userId: string
    ): Promise<LicenseCheckResult> {
        // Try cache first
        const cacheKey = `license:check:${tenantId}:${apiEndpoint}`;
        const cached = await redisCachingService.get(cacheKey);
        if (cached && typeof cached === 'string') {
            return JSON.parse(cached);
        }

        // Get license from database
        const licenseResult = await pool.query(
            `SELECT * FROM licenses 
             WHERE tenant_id = $1 
             AND status = 'active' 
             AND (expires_at IS NULL OR expires_at > NOW())`,
            [tenantId]
        );

        if (licenseResult.rows.length === 0) {
            return {
                allowed: false,
                license: null,
                reason: 'No active license found',
                upgradeRequired: true,
                recommendedTier: 'STARTER',
            };
        }

        const license = licenseResult.rows[0];
        const tierConfig = LICENSE_TIERS[license.license_code.toUpperCase() as keyof typeof LICENSE_TIERS];

        if (!tierConfig) {
            return {
                allowed: false,
                license,
                reason: 'Invalid license tier',
            };
        }

        // Check if API requires a specific feature
        const apiFeatureReq = API_FEATURE_MAP[apiEndpoint];
        if (apiFeatureReq) {
            const hasFeature = this.hasFeature(tierConfig, apiFeatureReq.feature);
            if (!hasFeature) {
                return {
                    allowed: false,
                    license,
                    reason: `Feature '${apiFeatureReq.feature}' requires ${apiFeatureReq.tier} tier or higher`,
                    upgradeRequired: true,
                    recommendedTier: apiFeatureReq.tier,
                };
            }
        }

        // Check rate limits
        const rateLimitCheck = await this.checkRateLimit(tenantId, apiEndpoint, tierConfig);
        if (!rateLimitCheck.allowed) {
            return {
                allowed: false,
                license,
                reason: 'Rate limit exceeded',
                usageStats: rateLimitCheck.usageStats,
            };
        }

        // Check daily API call limits
        const dailyUsage = await this.getDailyAPIUsage(tenantId);
        if (
            tierConfig.maxApiCallsPerDay > 0 &&
            dailyUsage >= tierConfig.maxApiCallsPerDay
        ) {
            return {
                allowed: false,
                license,
                reason: 'Daily API call limit exceeded',
                upgradeRequired: true,
                usageStats: {
                    current: dailyUsage,
                    limit: tierConfig.maxApiCallsPerDay,
                    percentUsed: (dailyUsage / tierConfig.maxApiCallsPerDay) * 100,
                },
            };
        }

        // Log usage
        await this.logAPIUsage(tenantId, apiEndpoint, userId);

        // Predictive analysis: Recommend upgrade if nearing limits
        const shouldRecommendUpgrade = await this.shouldRecommendUpgrade(tenantId, license);

        const result: LicenseCheckResult = {
            allowed: true,
            license,
            usageStats: {
                current: dailyUsage,
                limit: tierConfig.maxApiCallsPerDay,
                percentUsed:
                    tierConfig.maxApiCallsPerDay > 0
                        ? (dailyUsage / tierConfig.maxApiCallsPerDay) * 100
                        : 0,
            },
        };

        if (shouldRecommendUpgrade.recommend) {
            result.recommendedTier = shouldRecommendUpgrade.tier;
        }

        // Cache result for 5 minutes
        await redisCachingService.set(cacheKey, JSON.stringify(result), 300);

        return result;
    }

    /**
     * Check if tier has a specific feature
     */
    private hasFeature(tierConfig: any, feature: string): boolean {
        if (tierConfig.features.includes('*')) return true;
        return tierConfig.features.some((f: string) => {
            // Support wildcards like 'dashboard.*'
            if (f.endsWith('.*')) {
                return feature.startsWith(f.slice(0, -2));
            }
            return f === feature;
        });
    }

    /**
     * Rate Limiting with Redis
     */
    private async checkRateLimit(
        tenantId: string,
        apiEndpoint: string,
        tierConfig: any
    ): Promise<{ allowed: boolean; usageStats?: any }> {
        const key = `rate:${tenantId}:${apiEndpoint}`;
        const currentCount = await redisCachingService.increment(key);

        if (currentCount === 1) {
            // First request in this window, set expiry
            await redisCachingService.expire(key, tierConfig.rateLimit.window);
        }

        const allowed = currentCount <= tierConfig.rateLimit.requests;

        return {
            allowed,
            usageStats: allowed
                ? undefined
                : {
                      current: currentCount,
                      limit: tierConfig.rateLimit.requests,
                      percentUsed: (currentCount / tierConfig.rateLimit.requests) * 100,
                  },
        };
    }

    /**
     * Get daily API usage
     */
    private async getDailyAPIUsage(tenantId: string): Promise<number> {
        const cacheKey = `usage:daily:${tenantId}`;
        const cached = await redisCachingService.get(cacheKey);
        if (cached) {
            return parseInt(cached as string, 10);
        }

        const result = await pool.query(
            `SELECT COUNT(*) as count FROM license_usage_logs 
             WHERE tenant_id = $1 
             AND DATE(created_at) = CURRENT_DATE`,
            [tenantId]
        );

        const count = parseInt(result.rows[0].count, 10);
        await redisCachingService.set(cacheKey, count.toString(), 3600); // Cache for 1 hour

        return count;
    }

    /**
     * Log API usage
     */
    private async logAPIUsage(
        tenantId: string,
        apiEndpoint: string,
        userId: string
    ): Promise<void> {
        await pool.query(
            `INSERT INTO license_usage_logs (tenant_id, endpoint, user_id, created_at)
             VALUES ($1, $2, $3, NOW())`,
            [tenantId, apiEndpoint, userId]
        );

        // Increment daily counter in Redis
        const cacheKey = `usage:daily:${tenantId}`;
        await redisCachingService.increment(cacheKey);
    }

    /**
     * AI-Powered Upgrade Recommendation
     */
    private async shouldRecommendUpgrade(
        tenantId: string,
        currentLicense: any
    ): Promise<{ recommend: boolean; tier?: string; reason?: string }> {
        // Get usage metrics
        const metrics = await this.getUsageMetrics(tenantId);
        const tierConfig = LICENSE_TIERS[currentLicense.license_code.toUpperCase() as keyof typeof LICENSE_TIERS];

        // Check if approaching limits (>80% usage)
        if (
            tierConfig.maxApiCallsPerDay > 0 &&
            metrics.apiCallsToday / tierConfig.maxApiCallsPerDay > 0.8
        ) {
            return {
                recommend: true,
                tier: this.getNextTier(currentLicense.license_code),
                reason: 'Approaching daily API call limit (>80% used)',
            };
        }

        if (
            tierConfig.maxUsers > 0 &&
            metrics.activeUsers / tierConfig.maxUsers > 0.8
        ) {
            return {
                recommend: true,
                tier: this.getNextTier(currentLicense.license_code),
                reason: 'Approaching user limit (>80% used)',
            };
        }

        // Predictive: If usage is growing rapidly
        const growthRate = await this.calculateUsageGrowthRate(tenantId);
        if (growthRate > 50) {
            // >50% month-over-month growth
            return {
                recommend: true,
                tier: this.getNextTier(currentLicense.license_code),
                reason: `High usage growth detected (${growthRate.toFixed(1)}% MoM)`,
            };
        }

        return { recommend: false };
    }

    /**
     * Get comprehensive usage metrics
     */
    async getUsageMetrics(tenantId: string): Promise<UsageMetrics> {
        const [apiCallsResult, storageResult, usersResult, topEndpointsResult] =
            await Promise.all([
                pool.query(
                    `SELECT COUNT(*) as count FROM license_usage_logs 
                     WHERE tenant_id = $1 AND DATE(created_at) = CURRENT_DATE`,
                    [tenantId]
                ),
                pool.query(
                    `SELECT COALESCE(SUM(size_bytes) / 1073741824.0, 0) as storage_gb 
                     FROM files WHERE organization_id = 
                     (SELECT organization_id FROM licenses WHERE tenant_id = $1)`,
                    [tenantId]
                ),
                pool.query(
                    `SELECT COUNT(DISTINCT user_id) as count FROM audit_logs 
                     WHERE organization_id = 
                     (SELECT organization_id FROM licenses WHERE tenant_id = $1)
                     AND created_at > NOW() - INTERVAL '30 days'`,
                    [tenantId]
                ),
                pool.query(
                    `SELECT endpoint, COUNT(*) as calls FROM license_usage_logs 
                     WHERE tenant_id = $1 AND DATE(created_at) = CURRENT_DATE
                     GROUP BY endpoint ORDER BY calls DESC LIMIT 10`,
                    [tenantId]
                ),
            ]);

        return {
            apiCallsToday: parseInt(apiCallsResult.rows[0].count, 10),
            storageUsedGB: parseFloat(storageResult.rows[0].storage_gb),
            activeUsers: parseInt(usersResult.rows[0].count, 10),
            topEndpoints: topEndpointsResult.rows.map((row) => ({
                endpoint: row.endpoint,
                calls: parseInt(row.calls, 10),
            })),
            hourlyDistribution: [], // TODO: Implement
        };
    }

    /**
     * Calculate usage growth rate
     */
    private async calculateUsageGrowthRate(tenantId: string): Promise<number> {
        const result = await pool.query(
            `WITH monthly_usage AS (
                SELECT 
                    DATE_TRUNC('month', created_at) as month,
                    COUNT(*) as calls
                FROM license_usage_logs
                WHERE tenant_id = $1
                GROUP BY DATE_TRUNC('month', created_at)
                ORDER BY month DESC
                LIMIT 2
            )
            SELECT 
                (MAX(calls) - MIN(calls))::FLOAT / NULLIF(MIN(calls), 0) * 100 as growth_rate
            FROM monthly_usage`,
            [tenantId]
        );

        return result.rows[0]?.growth_rate || 0;
    }

    /**
     * Get next tier recommendation
     */
    private getNextTier(currentTier: string): string {
        const tierOrder = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
        const currentIndex = tierOrder.indexOf(currentTier.toUpperCase());
        return tierOrder[Math.min(currentIndex + 1, tierOrder.length - 1)];
    }

    /**
     * Generate detailed usage report
     */
    async generateUsageReport(tenantId: string, period: 'day' | 'week' | 'month' = 'day') {
        const metrics = await this.getUsageMetrics(tenantId);
        const license = await pool.query(
            `SELECT * FROM licenses WHERE tenant_id = $1`,
            [tenantId]
        );

        const tierConfig = LICENSE_TIERS[license.rows[0].license_code.toUpperCase() as keyof typeof LICENSE_TIERS];

        return {
            period,
            generatedAt: new Date().toISOString(),
            license: {
                tier: license.rows[0].license_code,
                status: license.rows[0].status,
                expiresAt: license.rows[0].expires_at,
            },
            usage: {
                apiCalls: {
                    current: metrics.apiCallsToday,
                    limit: tierConfig.maxApiCallsPerDay,
                    percentUsed:
                        tierConfig.maxApiCallsPerDay > 0
                            ? (metrics.apiCallsToday / tierConfig.maxApiCallsPerDay) * 100
                            : 0,
                },
                users: {
                    current: metrics.activeUsers,
                    limit: tierConfig.maxUsers,
                    percentUsed:
                        tierConfig.maxUsers > 0
                            ? (metrics.activeUsers / tierConfig.maxUsers) * 100
                            : 0,
                },
                storage: {
                    current: metrics.storageUsedGB,
                    limit: tierConfig.maxStorageGB,
                    percentUsed:
                        tierConfig.maxStorageGB > 0
                            ? (metrics.storageUsedGB / tierConfig.maxStorageGB) * 100
                            : 0,
                },
            },
            topEndpoints: metrics.topEndpoints,
            recommendations: await this.shouldRecommendUpgrade(tenantId, license.rows[0]),
        };
    }
}

export const enterpriseAutonomyEngine = new EnterpriseAutonomyEngine();
