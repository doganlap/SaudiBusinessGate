import { Pool } from 'pg';

// Setup database schema for SBG Platform
const setupDatabase = async () => {
  const connectionString = "postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require";
  
  console.log('🔍 Setting up SBG Platform database schema...');
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // First, let's check what tables already exist
    console.log('📊 Checking existing tables...');
    const existingTables = await client.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position
    `);
    
    if (existingTables.rows.length > 0) {
      console.log('📋 Current database structure:');
      let currentTable = '';
      for (const row of existingTables.rows) {
        if (row.table_name !== currentTable) {
          console.log(`\n🗂️  Table: ${row.table_name}`);
          currentTable = row.table_name;
        }
        console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      }
    }
    
    // Drop existing tables if they have wrong structure
    console.log('\n🔄 Recreating tables with correct structure...');
    
    await client.query('DROP TABLE IF EXISTS invoices CASCADE');
    await client.query('DROP TABLE IF EXISTS subscriptions CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query('DROP TABLE IF EXISTS tenants CASCADE');
    
    // Create tenants table
    console.log('🏢 Creating tenants table...');
    await client.query(`
      CREATE TABLE tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        domain VARCHAR(255) UNIQUE,
        subscription_tier VARCHAR(50) DEFAULT 'free',
        subscription_status VARCHAR(50) DEFAULT 'active',
        max_users INTEGER DEFAULT 5,
        max_storage_gb INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create users table
    console.log('👥 Creating users table...');
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'active',
        email_verified BOOLEAN DEFAULT FALSE,
        license_tier VARCHAR(50) DEFAULT 'basic',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create subscriptions table
    console.log('💳 Creating subscriptions table...');
    await client.query(`
      CREATE TABLE subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        plan_name VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'USD',
        billing_cycle VARCHAR(20) DEFAULT 'monthly',
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create invoices table
    console.log('🧾 Creating invoices table...');
    await client.query(`
      CREATE TABLE invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status VARCHAR(50) DEFAULT 'pending',
        due_date TIMESTAMP WITH TIME ZONE,
        paid_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for better performance
    console.log('📈 Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id)');
    
    // Insert sample data
    console.log('📝 Inserting sample data...');
    
    // Insert sample tenant
    const tenantResult = await client.query(`
      INSERT INTO tenants (name, slug, subscription_tier, max_users, is_verified) 
      VALUES ('Saudi Business Gate Demo', 'sbg-demo', 'professional', 50, true)
      RETURNING id
    `);
    const tenantId = tenantResult.rows[0].id;
    
    // Insert sample users
    await client.query(`
      INSERT INTO users (tenant_id, email, username, password_hash, first_name, last_name, role, email_verified) 
      VALUES 
        ($1, 'admin@saudistore.sa', 'admin', '$2b$10$dummy.hash.for.demo.admin', 'Admin', 'User', 'admin', true),
        ($1, 'user@saudistore.sa', 'demo_user', '$2b$10$dummy.hash.for.demo.user', 'Demo', 'User', 'user', true),
        ($1, 'manager@saudistore.sa', 'manager', '$2b$10$dummy.hash.for.demo.manager', 'Manager', 'User', 'manager', true)
    `, [tenantId]);
    
    // Insert sample subscription
    const subscriptionResult = await client.query(`
      INSERT INTO subscriptions (tenant_id, plan_name, status, amount, billing_cycle)
      VALUES ($1, 'Professional Plan', 'active', 99.99, 'monthly')
      RETURNING id
    `, [tenantId]);
    const subscriptionId = subscriptionResult.rows[0].id;
    
    // Insert sample invoices
    await client.query(`
      INSERT INTO invoices (tenant_id, subscription_id, amount, status, due_date)
      VALUES 
        ($1, $2, 99.99, 'paid', CURRENT_TIMESTAMP - INTERVAL '1 month'),
        ($1, $2, 99.99, 'pending', CURRENT_TIMESTAMP + INTERVAL '1 month')
    `, [tenantId, subscriptionId]);
    
    console.log('✅ Sample data inserted successfully!');
    
    // Verify the setup
    console.log('\n🔍 Verifying database setup...');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const tenantCount = await client.query('SELECT COUNT(*) FROM tenants');
    const subscriptionCount = await client.query('SELECT COUNT(*) FROM subscriptions');
    const invoiceCount = await client.query('SELECT COUNT(*) FROM invoices');
    
    console.log(`📊 Database Statistics:`);
    console.log(`   - Tenants: ${tenantCount.rows[0].count}`);
    console.log(`   - Users: ${userCount.rows[0].count}`);
    console.log(`   - Subscriptions: ${subscriptionCount.rows[0].count}`);
    console.log(`   - Invoices: ${invoiceCount.rows[0].count}`);
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('✅ Ready for Vercel deployment!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
    await pool.end();
    process.exit(1);
  }
};

setupDatabase();
