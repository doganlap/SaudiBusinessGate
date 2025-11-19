/**
 * Environment Variable Validator - P0 BLOCKER FIX
 *
 * Enforces required configuration before app starts
 * Prevents runtime failures from missing env vars
 */

export interface EnvConfig {
  // Core Infrastructure (P0 - REQUIRED)
  DATABASE_URL: string;
  DIRECT_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
  LICENSE_ENCRYPTION_KEY: string;

  // App Metadata (P0 - REQUIRED)
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_URL: string;
  APP_NAME: string;
  APP_VERSION: string;

  // Payment (P0 - REQUIRED for production)
  STRIPE_SECRET_KEY?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;

  // Email (P0 - REQUIRED for production)
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  SENDGRID_API_KEY?: string;

  // Redis (P1 - REQUIRED for production)
  REDIS_HOST?: string;
  REDIS_PORT?: number;
  REDIS_PASSWORD?: string;
  REDIS_TLS?: boolean;

  // Storage (P1 - REQUIRED for file uploads)
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_S3_BUCKET?: string;
  AWS_REGION?: string;

  // Monitoring (P1 - RECOMMENDED)
  NEXT_PUBLIC_SENTRY_DSN?: string;
  SENTRY_AUTH_TOKEN?: string;
  NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  missingOptional: string[];
}

/**
 * Validate environment configuration on startup
 * FAIL FAST if critical config is missing
 */
export class EnvValidator {
  private static readonly REQUIRED_ALWAYS = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'LICENSE_ENCRYPTION_KEY',
    'NEXT_PUBLIC_APP_URL',
  ];

  private static readonly REQUIRED_PRODUCTION = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'REDIS_HOST',
    'REDIS_PASSWORD',
  ];

  private static readonly REQUIRED_EMAIL = [
    ['SMTP_USER', 'SMTP_PASSWORD'], // Either SMTP
    ['SENDGRID_API_KEY'],           // Or SendGrid
  ];

  private static readonly RECOMMENDED = [
    'NEXT_PUBLIC_SENTRY_DSN',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  ];

  /**
   * Validate all environment variables
   * Throws in production if critical vars missing
   */
  static validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingRequired: string[] = [];
    const missingOptional: string[] = [];

    // 1. Check always-required variables
    for (const key of this.REQUIRED_ALWAYS) {
      if (!process.env[key] || process.env[key]?.includes('YOUR_') || process.env[key]?.includes('PLACEHOLDER')) {
        errors.push(`CRITICAL: ${key} is missing or contains placeholder value`);
        missingRequired.push(key);
      }
    }

    // 2. Check production-specific requirements
    if (process.env.NODE_ENV === 'production') {
      for (const key of this.REQUIRED_PRODUCTION) {
        if (!process.env[key] || process.env[key]?.includes('YOUR_') || process.env[key]?.includes('localhost')) {
          errors.push(`PRODUCTION BLOCKER: ${key} is missing or invalid for production`);
          missingRequired.push(key);
        }
      }

      // 3. Check email configuration (at least one method)
      const hasEmail = this.REQUIRED_EMAIL.some(group =>
        group.every(key => process.env[key] && !process.env[key]?.includes('YOUR_'))
      );

      if (!hasEmail) {
        errors.push('PRODUCTION BLOCKER: No email service configured (need SMTP or SendGrid)');
        missingRequired.push('EMAIL_SERVICE');
      }
    }

    // 4. Check recommended configurations
    for (const key of this.RECOMMENDED) {
      if (!process.env[key]) {
        warnings.push(`RECOMMENDED: ${key} not configured - some features may be limited`);
        missingOptional.push(key);
      }
    }

    // 5. Validate secret strengths
    const secretValidation = this.validateSecretStrength();
    errors.push(...secretValidation.errors);
    warnings.push(...secretValidation.warnings);

    // 6. Check for localhost URLs in production
    if (process.env.NODE_ENV === 'production') {
      const localhostChecks = this.checkLocalhostUrls();
      errors.push(...localhostChecks);
    }

    const valid = errors.length === 0;

    return {
      valid,
      errors,
      warnings,
      missingRequired,
      missingOptional,
    };
  }

  /**
   * Validate JWT and encryption key strength
   */
  private static validateSecretStrength(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const secrets = {
      JWT_SECRET: process.env.JWT_SECRET,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
      LICENSE_ENCRYPTION_KEY: process.env.LICENSE_ENCRYPTION_KEY,
    };

    for (const [name, value] of Object.entries(secrets)) {
      if (!value) continue;

      // Check length (minimum 32 characters)
      if (value.length < 32) {
        errors.push(`SECURITY: ${name} is too short (minimum 32 characters, found ${value.length})`);
      }

      // Check for common weak secrets
      const weakSecrets = [
        'secret',
        'password',
        'changeme',
        '12345',
        'test',
        'default',
      ];

      if (weakSecrets.some(weak => value.toLowerCase().includes(weak))) {
        errors.push(`SECURITY: ${name} contains weak/common pattern`);
      }

      // Warn if not using cryptographically random values
      if (!/^[a-f0-9]{32,}$/i.test(value) && !/^[A-Za-z0-9+/=]{32,}$/.test(value)) {
        warnings.push(`SECURITY: ${name} may not be cryptographically random`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Check for localhost URLs in production
   */
  private static checkLocalhostUrls(): string[] {
    const errors: string[] = [];
    const urlKeys = [
      'NEXT_PUBLIC_APP_URL',
      'NEXTAUTH_URL',
      'REDIS_HOST',
      'OLLAMA_URL',
    ];

    for (const key of urlKeys) {
      const value = process.env[key];
      if (value && (value.includes('localhost') || value.includes('127.0.0.1'))) {
        errors.push(`PRODUCTION BLOCKER: ${key} points to localhost: ${value}`);
      }
    }

    return errors;
  }

  /**
   * Get specific env var with type safety and validation
   */
  static getRequired<T = string>(key: string, transform?: (val: string) => T): T {
    const value = process.env[key];

    if (!value) {
      throw new Error(
        `CONFIGURATION ERROR: Required environment variable ${key} is not set. ` +
        `Check your .env file or deployment configuration.`
      );
    }

    if (value.includes('YOUR_') || value.includes('PLACEHOLDER')) {
      throw new Error(
        `CONFIGURATION ERROR: ${key} contains placeholder value: ${value}. ` +
        `Replace with actual configuration.`
      );
    }

    if (transform) {
      try {
        return transform(value);
      } catch (error) {
        throw new Error(
          `CONFIGURATION ERROR: Invalid value for ${key}: ${value}. ` +
          `Transformation failed: ${error}`
        );
      }
    }

    return value as T;
  }

  /**
   * Get optional env var with default
   */
  static getOptional<T = string>(
    key: string,
    defaultValue: T,
    transform?: (val: string) => T
  ): T {
    const value = process.env[key];

    if (!value) {
      return defaultValue;
    }

    if (value.includes('YOUR_') || value.includes('PLACEHOLDER')) {
      console.warn(`⚠️ ${key} contains placeholder, using default:`, defaultValue);
      return defaultValue;
    }

    if (transform) {
      try {
        return transform(value);
      } catch (error) {
        console.warn(`⚠️ Invalid ${key}, using default:`, defaultValue);
        return defaultValue;
      }
    }

    return value as T;
  }

  /**
   * Enforce validation - throw if invalid
   * Call this at app startup
   */
  static enforceValidation(): void {
    const result = this.validate();

    // Always log warnings
    if (result.warnings.length > 0) {
      console.warn('\n⚠️  CONFIGURATION WARNINGS:');
      result.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    // In production, fail fast on errors
    if (process.env.NODE_ENV === 'production' && !result.valid) {
      console.error('\n❌ CRITICAL CONFIGURATION ERRORS:');
      result.errors.forEach(error => console.error(`  - ${error}`));
      console.error('\n🚫 Application cannot start with invalid configuration.');
      console.error('📋 See PRODUCTION_DEPLOYMENT_ACTION_PLAN.md for setup instructions.\n');

      process.exit(1); // FAIL FAST
    }

    // In development, log errors but continue
    if (result.errors.length > 0) {
      console.error('\n❌ CONFIGURATION ERRORS (dev mode - continuing):');
      result.errors.forEach(error => console.error(`  - ${error}`));
    }

    // Log success
    if (result.valid) {
      console.log('✅ Environment configuration validated successfully');
    }
  }

  /**
   * Generate configuration report
   */
  static generateReport(): string {
    const result = this.validate();

    let report = '# Environment Configuration Report\n\n';
    report += `**Status:** ${result.valid ? '✅ VALID' : '❌ INVALID'}\n`;
    report += `**Environment:** ${process.env.NODE_ENV}\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    if (result.errors.length > 0) {
      report += '## ❌ Errors (Must Fix)\n\n';
      result.errors.forEach(error => {
        report += `- ${error}\n`;
      });
      report += '\n';
    }

    if (result.warnings.length > 0) {
      report += '## ⚠️ Warnings (Should Fix)\n\n';
      result.warnings.forEach(warning => {
        report += `- ${warning}\n`;
      });
      report += '\n';
    }

    if (result.missingRequired.length > 0) {
      report += '## 🔴 Missing Required\n\n';
      result.missingRequired.forEach(key => {
        report += `- \`${key}\`\n`;
      });
      report += '\n';
    }

    if (result.missingOptional.length > 0) {
      report += '## 🟡 Missing Optional\n\n';
      result.missingOptional.forEach(key => {
        report += `- \`${key}\`\n`;
      });
      report += '\n';
    }

    return report;
  }
}

/**
 * Type-safe environment configuration accessor
 */
export const env = {
  // Core - Always required
  DATABASE_URL: () => EnvValidator.getRequired('DATABASE_URL'),
  NEXTAUTH_SECRET: () => EnvValidator.getRequired('NEXTAUTH_SECRET'),
  JWT_SECRET: () => EnvValidator.getRequired('JWT_SECRET'),
  ENCRYPTION_KEY: () => EnvValidator.getRequired('ENCRYPTION_KEY'),

  // App config
  NODE_ENV: () => EnvValidator.getRequired('NODE_ENV') as 'development' | 'production' | 'test',
  APP_URL: () => EnvValidator.getRequired('NEXT_PUBLIC_APP_URL'),

  // Stripe (required in production)
  STRIPE_SECRET: () => EnvValidator.getOptional('STRIPE_SECRET_KEY', ''),
  STRIPE_PUBLISHABLE: () => EnvValidator.getOptional('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', ''),
  STRIPE_WEBHOOK_SECRET: () => EnvValidator.getOptional('STRIPE_WEBHOOK_SECRET', ''),

  // Redis
  REDIS_HOST: () => EnvValidator.getOptional('REDIS_HOST', 'localhost'),
  REDIS_PORT: () => EnvValidator.getOptional('REDIS_PORT', 6379, parseInt),
  REDIS_PASSWORD: () => EnvValidator.getOptional('REDIS_PASSWORD', ''),
  REDIS_TLS: () => EnvValidator.getOptional('REDIS_TLS', false, val => val === 'true'),

  // Email
  SMTP_HOST: () => EnvValidator.getOptional('SMTP_HOST', ''),
  SMTP_USER: () => EnvValidator.getOptional('SMTP_USER', ''),
  SMTP_PASSWORD: () => EnvValidator.getOptional('SMTP_PASSWORD', ''),
  SENDGRID_API_KEY: () => EnvValidator.getOptional('SENDGRID_API_KEY', ''),

  // Storage
  AWS_ACCESS_KEY: () => EnvValidator.getOptional('AWS_ACCESS_KEY_ID', ''),
  AWS_SECRET_KEY: () => EnvValidator.getOptional('AWS_SECRET_ACCESS_KEY', ''),

  // Monitoring
  SENTRY_DSN: () => EnvValidator.getOptional('NEXT_PUBLIC_SENTRY_DSN', ''),
} as const;

export default EnvValidator;
