import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';

export interface Customer {
  id: string;
  stripeCustomerId: string;
  email: string;
  name?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  tenantId: string;
  status: string;
  priceId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'pending_activation';
  subscriptionTier?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerParams {
  stripeCustomerId: string;
  email: string;
  name?: string;
  tenantId: string;
}

export interface CreateSubscriptionParams {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  tenantId: string;
  status: string;
  priceId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

export interface UpdateSubscriptionParams {
  status?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date;
}

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });
  }

  /**
   * Initialize database tables
   */
  async initializeTables(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create customers table
      await client.query(`
        CREATE TABLE IF NOT EXISTS billing_customers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          tenant_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create subscriptions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS billing_subscriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
          stripe_customer_id VARCHAR(255) NOT NULL,
          tenant_id VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL,
          price_id VARCHAR(255),
          current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
          current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
          cancel_at_period_end BOOLEAN DEFAULT FALSE,
          canceled_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          FOREIGN KEY (stripe_customer_id) REFERENCES billing_customers(stripe_customer_id)
        )
      `);

      // Create tenants table (if not exists)
      await client.query(`
        CREATE TABLE IF NOT EXISTS tenants (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending_activation',
          subscription_tier VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create billing events table for audit trail
      await client.query(`
        CREATE TABLE IF NOT EXISTS billing_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id VARCHAR(255) NOT NULL,
          stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
          event_type VARCHAR(100) NOT NULL,
          event_data JSONB NOT NULL,
          processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_billing_customers_tenant_id ON billing_customers(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_tenant_id ON billing_subscriptions(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_status ON billing_subscriptions(status);
        CREATE INDEX IF NOT EXISTS idx_billing_events_tenant_id ON billing_events(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_billing_events_type ON billing_events(event_type);
      `);

      await client.query('COMMIT');
      logger.info('Database tables initialized successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to initialize database tables', { error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(params: CreateCustomerParams): Promise<Customer> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO billing_customers (stripe_customer_id, email, name, tenant_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await client.query(query, [
        params.stripeCustomerId,
        params.email,
        params.name,
        params.tenantId,
      ]);

      return this.mapCustomerRow(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create customer', { error, params });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get customer by Stripe customer ID
   */
  async getCustomerByStripeId(stripeCustomerId: string): Promise<Customer | null> {
    const client = await this.pool.connect();
    
    try {
      const query = 'SELECT * FROM billing_customers WHERE stripe_customer_id = $1';
      const result = await client.query(query, [stripeCustomerId]);

      return result.rows.length > 0 ? this.mapCustomerRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Failed to get customer by Stripe ID', { error, stripeCustomerId });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get customer by tenant ID
   */
  async getCustomerByTenantId(tenantId: string): Promise<Customer | null> {
    const client = await this.pool.connect();
    
    try {
      const query = 'SELECT * FROM billing_customers WHERE tenant_id = $1';
      const result = await client.query(query, [tenantId]);

      return result.rows.length > 0 ? this.mapCustomerRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Failed to get customer by tenant ID', { error, tenantId });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<Subscription> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO billing_subscriptions 
        (stripe_subscription_id, stripe_customer_id, tenant_id, status, price_id, current_period_start, current_period_end)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const result = await client.query(query, [
        params.stripeSubscriptionId,
        params.stripeCustomerId,
        params.tenantId,
        params.status,
        params.priceId,
        params.currentPeriodStart,
        params.currentPeriodEnd,
      ]);

      return this.mapSubscriptionRow(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create subscription', { error, params });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update a subscription
   */
  async updateSubscription(stripeSubscriptionId: string, params: UpdateSubscriptionParams): Promise<Subscription> {
    const client = await this.pool.connect();
    
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (params.status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        values.push(params.status);
        paramIndex++;
      }

      if (params.currentPeriodStart !== undefined) {
        updates.push(`current_period_start = $${paramIndex}`);
        values.push(params.currentPeriodStart);
        paramIndex++;
      }

      if (params.currentPeriodEnd !== undefined) {
        updates.push(`current_period_end = $${paramIndex}`);
        values.push(params.currentPeriodEnd);
        paramIndex++;
      }

      if (params.cancelAtPeriodEnd !== undefined) {
        updates.push(`cancel_at_period_end = $${paramIndex}`);
        values.push(params.cancelAtPeriodEnd);
        paramIndex++;
      }

      if (params.canceledAt !== undefined) {
        updates.push(`canceled_at = $${paramIndex}`);
        values.push(params.canceledAt);
        paramIndex++;
      }

      updates.push(`updated_at = NOW()`);
      values.push(stripeSubscriptionId);

      const query = `
        UPDATE billing_subscriptions 
        SET ${updates.join(', ')}
        WHERE stripe_subscription_id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error(`Subscription not found: ${stripeSubscriptionId}`);
      }

      return this.mapSubscriptionRow(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update subscription', { error, stripeSubscriptionId, params });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get subscription by Stripe subscription ID
   */
  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
    const client = await this.pool.connect();
    
    try {
      const query = 'SELECT * FROM billing_subscriptions WHERE stripe_subscription_id = $1';
      const result = await client.query(query, [stripeSubscriptionId]);

      return result.rows.length > 0 ? this.mapSubscriptionRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Failed to get subscription by Stripe ID', { error, stripeSubscriptionId });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get subscriptions by tenant ID
   */
  async getSubscriptionsByTenantId(tenantId: string): Promise<Subscription[]> {
    const client = await this.pool.connect();
    
    try {
      const query = 'SELECT * FROM billing_subscriptions WHERE tenant_id = $1 ORDER BY created_at DESC';
      const result = await client.query(query, [tenantId]);

      return result.rows.map(row => this.mapSubscriptionRow(row));
    } catch (error) {
      logger.error('Failed to get subscriptions by tenant ID', { error, tenantId });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Activate tenant
   */
  async activateTenant(tenantId: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO tenants (id, name, status, updated_at)
        VALUES ($1, $1, 'active', NOW())
        ON CONFLICT (id) 
        DO UPDATE SET status = 'active', updated_at = NOW()
      `;
      
      await client.query(query, [tenantId]);
      logger.info('Tenant activated', { tenantId });
    } catch (error) {
      logger.error('Failed to activate tenant', { error, tenantId });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Suspend tenant
   */
  async suspendTenant(tenantId: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        UPDATE tenants 
        SET status = 'suspended', updated_at = NOW()
        WHERE id = $1
      `;
      
      await client.query(query, [tenantId]);
      logger.info('Tenant suspended', { tenantId });
    } catch (error) {
      logger.error('Failed to suspend tenant', { error, tenantId });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get tenant status
   */
  async getTenantStatus(tenantId: string): Promise<string | null> {
    const client = await this.pool.connect();
    
    try {
      const query = 'SELECT status FROM tenants WHERE id = $1';
      const result = await client.query(query, [tenantId]);

      return result.rows.length > 0 ? result.rows[0].status : null;
    } catch (error) {
      logger.error('Failed to get tenant status', { error, tenantId });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Log billing event
   */
  async logBillingEvent(tenantId: string, stripeEventId: string, eventType: string, eventData: any): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO billing_events (tenant_id, stripe_event_id, event_type, event_data)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (stripe_event_id) DO NOTHING
      `;
      
      await client.query(query, [tenantId, stripeEventId, eventType, JSON.stringify(eventData)]);
    } catch (error) {
      logger.error('Failed to log billing event', { error, tenantId, stripeEventId, eventType });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  private mapCustomerRow(row: any): Customer {
    return {
      id: row.id,
      stripeCustomerId: row.stripe_customer_id,
      email: row.email,
      name: row.name,
      tenantId: row.tenant_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapSubscriptionRow(row: any): Subscription {
    return {
      id: row.id,
      stripeSubscriptionId: row.stripe_subscription_id,
      stripeCustomerId: row.stripe_customer_id,
      tenantId: row.tenant_id,
      status: row.status,
      priceId: row.price_id,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      canceledAt: row.canceled_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
