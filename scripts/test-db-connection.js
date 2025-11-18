import { Pool } from 'pg';

// Test database connection with the new credentials
const testConnection = async () => {
  const connectionString = "postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require";
  
  console.log('🔍 Testing database connection...');
  console.log('Host: db.prisma.io');
  console.log('Database: postgres');
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('📅 Current time:', result.rows[0].current_time);
    console.log('🗄️  Database version:', result.rows[0].db_version.substring(0, 50) + '...');
    
    // Check existing tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Existing tables:', tablesResult.rowCount);
    if (tablesResult.rows.length > 0) {
      console.log('Tables:', tablesResult.rows.map(row => row.table_name).join(', '));
    }
    
    // Create basic tables if they don't exist
    console.log('🔧 Creating basic tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
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
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id),
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Basic tables created successfully!');
    
    // Insert sample data
    console.log('📝 Inserting sample data...');
    
    // Insert sample tenant
    await client.query(`
      INSERT INTO tenants (name, slug, subscription_tier, max_users) 
      VALUES ('Demo Company', 'demo-company', 'professional', 25)
      ON CONFLICT (slug) DO NOTHING
    `);
    
    // Insert sample user
    await client.query(`
      INSERT INTO users (email, username, password_hash, first_name, last_name, role) 
      VALUES ('admin@demo.com', 'admin', '$2b$10$dummy.hash.for.demo', 'Admin', 'User', 'admin')
      ON CONFLICT (email) DO NOTHING
    `);
    
    console.log('✅ Sample data inserted!');
    
    client.release();
    await pool.end();
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    await pool.end();
    process.exit(1);
  }
};

testConnection();
