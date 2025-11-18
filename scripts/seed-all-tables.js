import { Pool } from 'pg';

// Comprehensive database seeding script for SBG Platform
const seedAllTables = async () => {
  const connectionString = "postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require";
  
  console.log('🌱 Starting comprehensive database seeding...');
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Clear existing data (in correct order due to foreign keys)
    console.log('🧹 Clearing existing data...');
    await client.query('TRUNCATE TABLE invoices, subscriptions, users, tenants CASCADE');
    
    // Seed Tenants
    console.log('🏢 Seeding tenants...');
    const tenantInserts = [
      {
        name: 'Saudi Business Gate HQ',
        slug: 'sbg-hq',
        subscription_tier: 'enterprise',
        max_users: 100,
        is_verified: true
      },
      {
        name: 'Riyadh Tech Solutions',
        slug: 'riyadh-tech',
        subscription_tier: 'professional',
        max_users: 50,
        is_verified: true
      },
      {
        name: 'Jeddah Commerce Hub',
        slug: 'jeddah-commerce',
        subscription_tier: 'business',
        max_users: 25,
        is_verified: true
      },
      {
        name: 'Dammam Industries',
        slug: 'dammam-industries',
        subscription_tier: 'professional',
        max_users: 30,
        is_verified: false
      },
      {
        name: 'Mecca Services Group',
        slug: 'mecca-services',
        subscription_tier: 'basic',
        max_users: 10,
        is_verified: true
      }
    ];
    
    const tenantIds = [];
    for (const tenant of tenantInserts) {
      const result = await client.query(`
        INSERT INTO tenants (name, slug, subscription_tier, max_users, is_verified)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [tenant.name, tenant.slug, tenant.subscription_tier, tenant.max_users, tenant.is_verified]);
      tenantIds.push(result.rows[0].id);
    }
    
    console.log(`✅ Inserted ${tenantIds.length} tenants`);
    
    // Seed Users
    console.log('👥 Seeding users...');
    const userInserts = [
      // SBG HQ Users
      {
        tenant_id: tenantIds[0],
        email: 'admin@saudistore.sa',
        username: 'admin',
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin',
        email_verified: true,
        license_tier: 'enterprise'
      },
      {
        tenant_id: tenantIds[0],
        email: 'manager@saudistore.sa',
        username: 'manager',
        first_name: 'Business',
        last_name: 'Manager',
        role: 'manager',
        email_verified: true,
        license_tier: 'professional'
      },
      // Riyadh Tech Users
      {
        tenant_id: tenantIds[1],
        email: 'ceo@riyadhtech.sa',
        username: 'ceo_riyadh',
        first_name: 'Ahmed',
        last_name: 'Al-Rashid',
        role: 'admin',
        email_verified: true,
        license_tier: 'professional'
      },
      {
        tenant_id: tenantIds[1],
        email: 'dev@riyadhtech.sa',
        username: 'dev_riyadh',
        first_name: 'Sara',
        last_name: 'Al-Mahmoud',
        role: 'user',
        email_verified: true,
        license_tier: 'basic'
      },
      // Jeddah Commerce Users
      {
        tenant_id: tenantIds[2],
        email: 'owner@jeddahcommerce.sa',
        username: 'owner_jeddah',
        first_name: 'Mohammed',
        last_name: 'Al-Zahrani',
        role: 'admin',
        email_verified: true,
        license_tier: 'business'
      },
      {
        tenant_id: tenantIds[2],
        email: 'sales@jeddahcommerce.sa',
        username: 'sales_jeddah',
        first_name: 'Fatima',
        last_name: 'Al-Ghamdi',
        role: 'user',
        email_verified: true,
        license_tier: 'basic'
      },
      // Dammam Industries Users
      {
        tenant_id: tenantIds[3],
        email: 'director@dammamindustries.sa',
        username: 'director_dammam',
        first_name: 'Khalid',
        last_name: 'Al-Otaibi',
        role: 'admin',
        email_verified: false,
        license_tier: 'professional'
      },
      // Mecca Services Users
      {
        tenant_id: tenantIds[4],
        email: 'manager@meccaservices.sa',
        username: 'manager_mecca',
        first_name: 'Aisha',
        last_name: 'Al-Harbi',
        role: 'manager',
        email_verified: true,
        license_tier: 'basic'
      }
    ];
    
    const userIds = [];
    for (const user of userInserts) {
      const result = await client.query(`
        INSERT INTO users (tenant_id, email, username, password_hash, first_name, last_name, role, email_verified, license_tier)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        user.tenant_id,
        user.email,
        user.username,
        '$2b$10$dummy.hash.for.demo.user', // Dummy password hash
        user.first_name,
        user.last_name,
        user.role,
        user.email_verified,
        user.license_tier
      ]);
      userIds.push(result.rows[0].id);
    }
    
    console.log(`✅ Inserted ${userIds.length} users`);
    
    // Seed Subscriptions
    console.log('💳 Seeding subscriptions...');
    const subscriptionInserts = [
      {
        tenant_id: tenantIds[0],
        plan_name: 'Enterprise Plan',
        status: 'active',
        amount: 299.99,
        billing_cycle: 'monthly'
      },
      {
        tenant_id: tenantIds[1],
        plan_name: 'Professional Plan',
        status: 'active',
        amount: 99.99,
        billing_cycle: 'monthly'
      },
      {
        tenant_id: tenantIds[2],
        plan_name: 'Business Plan',
        status: 'active',
        amount: 49.99,
        billing_cycle: 'monthly'
      },
      {
        tenant_id: tenantIds[3],
        plan_name: 'Professional Plan',
        status: 'trial',
        amount: 99.99,
        billing_cycle: 'monthly'
      },
      {
        tenant_id: tenantIds[4],
        plan_name: 'Basic Plan',
        status: 'active',
        amount: 19.99,
        billing_cycle: 'monthly'
      }
    ];
    
    const subscriptionIds = [];
    for (const subscription of subscriptionInserts) {
      const result = await client.query(`
        INSERT INTO subscriptions (tenant_id, plan_name, status, amount, billing_cycle, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        subscription.tenant_id,
        subscription.plan_name,
        subscription.status,
        subscription.amount,
        subscription.billing_cycle,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      ]);
      subscriptionIds.push(result.rows[0].id);
    }
    
    console.log(`✅ Inserted ${subscriptionIds.length} subscriptions`);
    
    // Seed Invoices
    console.log('🧾 Seeding invoices...');
    const invoiceInserts = [];
    
    // Generate multiple invoices for each subscription
    for (let i = 0; i < subscriptionIds.length; i++) {
      const subscription = subscriptionInserts[i];
      
      // Past paid invoice
      invoiceInserts.push({
        tenant_id: tenantIds[i],
        subscription_id: subscriptionIds[i],
        amount: subscription.amount,
        status: 'paid',
        due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        paid_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)   // 25 days ago
      });
      
      // Current pending invoice
      invoiceInserts.push({
        tenant_id: tenantIds[i],
        subscription_id: subscriptionIds[i],
        amount: subscription.amount,
        status: 'pending',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        paid_at: null
      });
      
      // Future invoice
      invoiceInserts.push({
        tenant_id: tenantIds[i],
        subscription_id: subscriptionIds[i],
        amount: subscription.amount,
        status: 'draft',
        due_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
        paid_at: null
      });
    }
    
    let invoiceCount = 0;
    for (const invoice of invoiceInserts) {
      await client.query(`
        INSERT INTO invoices (tenant_id, subscription_id, amount, status, due_date, paid_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        invoice.tenant_id,
        invoice.subscription_id,
        invoice.amount,
        invoice.status,
        invoice.due_date,
        invoice.paid_at
      ]);
      invoiceCount++;
    }
    
    console.log(`✅ Inserted ${invoiceCount} invoices`);
    
    // Verify seeded data
    console.log('\n📊 Verifying seeded data...');
    
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM tenants) as tenant_count,
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM subscriptions) as subscription_count,
        (SELECT COUNT(*) FROM invoices) as invoice_count,
        (SELECT COUNT(*) FROM invoices WHERE status = 'paid') as paid_invoices,
        (SELECT COUNT(*) FROM invoices WHERE status = 'pending') as pending_invoices,
        (SELECT SUM(amount) FROM invoices WHERE status = 'paid') as total_revenue
    `);
    
    const data = stats.rows[0];
    console.log('📈 Database Statistics:');
    console.log(`   - Tenants: ${data.tenant_count}`);
    console.log(`   - Users: ${data.user_count}`);
    console.log(`   - Subscriptions: ${data.subscription_count}`);
    console.log(`   - Total Invoices: ${data.invoice_count}`);
    console.log(`   - Paid Invoices: ${data.paid_invoices}`);
    console.log(`   - Pending Invoices: ${data.pending_invoices}`);
    console.log(`   - Total Revenue: $${parseFloat(data.total_revenue || 0).toFixed(2)}`);
    
    // Show sample data
    console.log('\n🔍 Sample Data Preview:');
    
    const sampleTenants = await client.query(`
      SELECT name, slug, subscription_tier, is_verified 
      FROM tenants 
      ORDER BY created_at 
      LIMIT 3
    `);
    
    console.log('🏢 Sample Tenants:');
    sampleTenants.rows.forEach(tenant => {
      console.log(`   - ${tenant.name} (${tenant.slug}) - ${tenant.subscription_tier} ${tenant.is_verified ? '✅' : '⏳'}`);
    });
    
    const sampleUsers = await client.query(`
      SELECT u.first_name, u.last_name, u.email, u.role, t.name as tenant_name
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      ORDER BY u.created_at
      LIMIT 5
    `);
    
    console.log('\n👥 Sample Users:');
    sampleUsers.rows.forEach(user => {
      console.log(`   - ${user.first_name} ${user.last_name} (${user.email}) - ${user.role} @ ${user.tenant_name}`);
    });
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('✅ All tables populated with realistic sample data');
    console.log('✅ Foreign key relationships established');
    console.log('✅ Ready for application testing and deployment');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    console.error('Full error:', error);
    await pool.end();
    process.exit(1);
  }
};

seedAllTables();
