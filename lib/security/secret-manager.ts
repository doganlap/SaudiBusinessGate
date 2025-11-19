/**
 * Secret Manager - JWT & Encryption Key Rotation System
 * P0 BLOCKER FIX
 *
 * Handles secure storage and rotation of secrets via Postgres
 * Eliminates hard-coded secrets in env files
 */

import { query, transaction, getPool } from '@/lib/db/connection';
import { PoolClient } from 'pg';
import crypto from 'crypto';

export interface Secret {
  id: string;
  secret_type: 'jwt' | 'encryption' | 'api_key' | 'webhook';
  key_name: string;
  secret_value: string; // Encrypted at rest
  version: number;
  is_active: boolean;
  created_at: Date;
  expires_at?: Date;
  rotated_at?: Date;
  last_used_at?: Date;
  metadata?: Record<string, any>;
}

export interface SecretVersion {
  version: number;
  created_at: Date;
  expires_at?: Date;
  is_active: boolean;
}

/**
 * Secret Manager - Postgres-backed secret storage with rotation
 */
export class SecretManager {
  private masterKey: string;
  private cache: Map<string, { value: string; expires: number }> = new Map();
  private static instance: SecretManager;

  constructor(masterKey?: string) {
    // Master key for encrypting secrets at rest
    // In production, this should come from AWS Secrets Manager, HashiCorp Vault, etc.
    this.masterKey = masterKey || process.env.MASTER_ENCRYPTION_KEY || this.generateKey(32);
  }

  static getInstance(): SecretManager {
    if (!this.instance) {
      this.instance = new SecretManager();
    }
    return this.instance;
  }

  /**
   * Initialize secrets table in database
   */
  async initializeSecretsTable(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS secrets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        secret_type VARCHAR(50) NOT NULL,
        key_name VARCHAR(255) NOT NULL UNIQUE,
        secret_value TEXT NOT NULL, -- Encrypted
        version INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        rotated_at TIMESTAMP,
        last_used_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_by VARCHAR(255),
        CONSTRAINT unique_active_secret UNIQUE (key_name, version)
      );

      CREATE INDEX IF NOT EXISTS idx_secrets_type ON secrets(secret_type);
      CREATE INDEX IF NOT EXISTS idx_secrets_active ON secrets(is_active);
      CREATE INDEX IF NOT EXISTS idx_secrets_expires ON secrets(expires_at);
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS secret_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        secret_id UUID REFERENCES secrets(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL, -- 'created', 'rotated', 'accessed', 'revoked'
        performed_by VARCHAR(255),
        performed_at TIMESTAMP DEFAULT NOW(),
        ip_address INET,
        user_agent TEXT,
        metadata JSONB DEFAULT '{}'
      );

      CREATE INDEX IF NOT EXISTS idx_audit_secret ON secret_audit_log(secret_id);
      CREATE INDEX IF NOT EXISTS idx_audit_action ON secret_audit_log(action);
      CREATE INDEX IF NOT EXISTS idx_audit_time ON secret_audit_log(performed_at);
    `);

    console.log('✅ Secrets management tables initialized');
  }

  /**
   * Store a secret securely in database
   */
  async storeSecret(
    keyName: string,
    secretValue: string,
    type: Secret['secret_type'],
    expiresInDays?: number,
    metadata?: Record<string, any>
  ): Promise<Secret> {
    // Encrypt the secret before storing
    const encrypted = this.encrypt(secretValue);

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const result = await query<Secret>(
      `INSERT INTO secrets (secret_type, key_name, secret_value, expires_at, metadata)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (key_name, version)
       DO UPDATE SET
         secret_value = EXCLUDED.secret_value,
         expires_at = EXCLUDED.expires_at,
         metadata = EXCLUDED.metadata
       RETURNING *`,
      [type, keyName, encrypted, expiresAt, JSON.stringify(metadata || {})]
    );

    const secret = result.rows[0];

    // Audit log
    await this.auditLog(secret.id, 'created', 'SYSTEM');

    // Clear cache
    this.cache.delete(keyName);

    return secret;
  }

  /**
   * Retrieve a secret from database
   */
  async getSecret(keyName: string, useCache = true): Promise<string | null> {
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(keyName);
      if (cached && cached.expires > Date.now()) {
        return cached.value;
      }
    }

    const result = await query<Secret>(
      `SELECT * FROM secrets
       WHERE key_name = $1
         AND is_active = true
         AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY version DESC
       LIMIT 1`,
      [keyName]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const secret = result.rows[0];

    // Decrypt
    const decrypted = this.decrypt(secret.secret_value);

    // Update last used
    await query(
      `UPDATE secrets SET last_used_at = NOW() WHERE id = $1`,
      [secret.id]
    );

    // Audit log
    await this.auditLog(secret.id, 'accessed', 'SYSTEM');

    // Cache for 5 minutes
    this.cache.set(keyName, {
      value: decrypted,
      expires: Date.now() + 5 * 60 * 1000,
    });

    return decrypted;
  }

  /**
   * Rotate a secret - create new version and expire old
   */
  async rotateSecret(
    keyName: string,
    newSecretValue: string,
    gracePeriodDays = 7
  ): Promise<Secret> {
    return await transaction(async (client: PoolClient) => {
      // Mark current version as inactive (with grace period)
      const graceExpiry = new Date(Date.now() + gracePeriodDays * 24 * 60 * 60 * 1000);

      await client.query(
        `UPDATE secrets
         SET is_active = false,
             expires_at = $1,
             rotated_at = NOW()
         WHERE key_name = $2 AND is_active = true`,
        [graceExpiry, keyName]
      );

      // Get previous version
      const prevResult = await client.query<Secret>(
        `SELECT * FROM secrets WHERE key_name = $1 ORDER BY version DESC LIMIT 1`,
        [keyName]
      );

      const prevVersion = prevResult.rows[0]?.version || 0;
      const newVersion = prevVersion + 1;

      // Create new version
      const encrypted = this.encrypt(newSecretValue);

      const result = await client.query<Secret>(
        `INSERT INTO secrets (
           secret_type, key_name, secret_value, version, is_active
         )
         SELECT secret_type, key_name, $1, $2, true
         FROM secrets
         WHERE key_name = $3
         LIMIT 1
         RETURNING *`,
        [encrypted, newVersion, keyName]
      );

      const newSecret = result.rows[0];

      // Audit log
      await client.query(
        `INSERT INTO secret_audit_log (secret_id, action, performed_by)
         VALUES ($1, 'rotated', 'SYSTEM')`,
        [newSecret.id]
      );

      // Clear cache
      this.cache.delete(keyName);

      return newSecret;
    });
  }

  /**
   * Revoke a secret immediately
   */
  async revokeSecret(keyName: string): Promise<void> {
    const result = await query<Secret>(
      `UPDATE secrets
       SET is_active = false,
           expires_at = NOW()
       WHERE key_name = $1 AND is_active = true
       RETURNING id`,
      [keyName]
    );

    if (result.rows.length > 0) {
      await this.auditLog(result.rows[0].id, 'revoked', 'SYSTEM');
    }

    // Clear cache
    this.cache.delete(keyName);
  }

  /**
   * Get all versions of a secret
   */
  async getSecretVersions(keyName: string): Promise<SecretVersion[]> {
    const result = await query<Secret>(
      `SELECT version, created_at, expires_at, is_active
       FROM secrets
       WHERE key_name = $1
       ORDER BY version DESC`,
      [keyName]
    );

    return result.rows.map(row => ({
      version: row.version,
      created_at: row.created_at,
      expires_at: row.expires_at,
      is_active: row.is_active,
    }));
  }

  /**
   * List all secrets (metadata only, not values)
   */
  async listSecrets(type?: Secret['secret_type']): Promise<Omit<Secret, 'secret_value'>[]> {
    const query_text = type
      ? `SELECT id, secret_type, key_name, version, is_active, created_at, expires_at, rotated_at, last_used_at
         FROM secrets
         WHERE secret_type = $1 AND is_active = true
         ORDER BY key_name`
      : `SELECT id, secret_type, key_name, version, is_active, created_at, expires_at, rotated_at, last_used_at
         FROM secrets
         WHERE is_active = true
         ORDER BY secret_type, key_name`;

    const params = type ? [type] : [];
    const result = await query(query_text, params);
    return result.rows;
  }

  /**
   * Check if secrets need rotation (30 days old)
   */
  async getSecretsNeedingRotation(daysOld = 30): Promise<Secret[]> {
    const result = await query<Secret>(
      `SELECT id, secret_type, key_name, version, created_at, rotated_at
       FROM secrets
       WHERE is_active = true
         AND (
           created_at < NOW() - INTERVAL '${daysOld} days'
           OR (rotated_at IS NOT NULL AND rotated_at < NOW() - INTERVAL '${daysOld} days')
         )
       ORDER BY created_at ASC`
    );

    return result.rows;
  }

  /**
   * Generate cryptographically secure key
   */
  generateKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Encrypt secret using master key
   */
  private encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.masterKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt secret using master key
   */
  private decrypt(ciphertext: string): string {
    const [ivHex, encrypted] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(this.masterKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Audit log entry
   */
  private async auditLog(
    secretId: string,
    action: string,
    performedBy: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await query(
      `INSERT INTO secret_audit_log (secret_id, action, performed_by, metadata)
       VALUES ($1, $2, $3, $4)`,
      [secretId, action, performedBy, JSON.stringify(metadata || {})]
    );
  }

  /**
   * Migrate env vars to secure storage (one-time migration)
   */
  async migrateFromEnv(): Promise<void> {
    const secretsToMigrate = [
      { name: 'JWT_SECRET', type: 'jwt' as const },
      { name: 'NEXTAUTH_SECRET', type: 'jwt' as const },
      { name: 'ENCRYPTION_KEY', type: 'encryption' as const },
      { name: 'LICENSE_ENCRYPTION_KEY', type: 'encryption' as const },
      { name: 'WEBHOOK_SECRET', type: 'webhook' as const },
      { name: 'STRIPE_SECRET_KEY', type: 'api_key' as const },
      { name: 'STRIPE_WEBHOOK_SECRET', type: 'webhook' as const },
    ];

    console.log('🔄 Migrating secrets from environment variables to secure storage...');

    for (const { name, type } of secretsToMigrate) {
      const value = process.env[name];
      if (value && !value.includes('YOUR_') && !value.includes('PLACEHOLDER')) {
        try {
          await this.storeSecret(name, value, type, undefined, {
            migrated_from: 'env',
            migrated_at: new Date().toISOString(),
          });
          console.log(`  ✓ Migrated ${name}`);
        } catch (error) {
          console.error(`  ✗ Failed to migrate ${name}:`, error);
        }
      }
    }

    console.log('✅ Secret migration complete');
  }

  /**
   * Setup automated rotation schedule
   */
  async setupRotationSchedule(): Promise<void> {
    // Check for secrets older than 30 days
    const needRotation = await this.getSecretsNeedingRotation(30);

    if (needRotation.length > 0) {
      console.warn(`⚠️  ${needRotation.length} secrets need rotation:`);
      needRotation.forEach(secret => {
        console.warn(`  - ${secret.key_name} (${secret.secret_type})`);
      });
    }
  }
}

/**
 * Helper to get secrets with fallback to env
 */
export async function getSecretOrEnv(keyName: string): Promise<string | null> {
  const manager = SecretManager.getInstance();

  // Try to get from secure storage first
  const secret = await manager.getSecret(keyName);
  if (secret) {
    return secret;
  }

  // Fallback to environment variable
  const envValue = process.env[keyName];
  if (envValue && !envValue.includes('YOUR_') && !envValue.includes('PLACEHOLDER')) {
    return envValue;
  }

  return null;
}

export default SecretManager;
