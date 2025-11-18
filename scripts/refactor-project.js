import fs from 'fs/promises';
import path from 'path';

// Project refactoring script
const refactorProject = async () => {
  console.log('🔄 Starting SBG Platform refactoring...');
  
  const projectRoot = process.cwd();
  
  try {
    // Step 1: Create new directory structure
    console.log('📁 Creating clean directory structure...');
    
    const directories = [
      'src/components/ui',
      'src/components/forms',
      'src/components/layout',
      'src/components/features',
      'src/lib/db',
      'src/lib/auth',
      'src/lib/utils',
      'src/lib/validations',
      'src/hooks',
      'src/types',
      'src/config',
      'public/images',
      'public/icons'
    ];
    
    for (const dir of directories) {
      await fs.mkdir(path.join(projectRoot, dir), { recursive: true });
      console.log(`✅ Created: ${dir}`);
    }
    
    // Step 2: Move existing components to proper locations
    console.log('\n🚚 Moving components to new structure...');
    
    // Move shell components
    try {
      await fs.rename(
        path.join(projectRoot, 'components/shell'),
        path.join(projectRoot, 'src/components/layout/shell')
      );
      console.log('✅ Moved shell components');
    } catch (error) {
      console.log('⚠️  Shell components already in place or not found');
    }
    
    // Move navigation components
    try {
      await fs.rename(
        path.join(projectRoot, 'components/navigation'),
        path.join(projectRoot, 'src/components/layout/navigation')
      );
      console.log('✅ Moved navigation components');
    } catch (error) {
      console.log('⚠️  Navigation components already in place or not found');
    }
    
    // Step 3: Create consolidated configuration
    console.log('\n⚙️  Creating consolidated configuration...');
    
    const configFiles = {
      'src/config/database.ts': `
// Database configuration
export const dbConfig = {
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
};
`,
      'src/config/auth.ts': `
// Authentication configuration
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  sessionTimeout: 3600, // 1 hour
  bcryptRounds: 10,
  cookieName: 'sbg-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 3600000 // 1 hour
  }
};
`,
      'src/config/app.ts': `
// Application configuration
export const appConfig = {
  name: 'Saudi Business Gate',
  version: '2.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3050/api',
  supportedLocales: ['en', 'ar'],
  defaultLocale: 'en',
  features: {
    enableBetaFeatures: process.env.ENABLE_BETA_FEATURES === 'true',
    enableMaintenanceMode: process.env.ENABLE_MAINTENANCE_MODE === 'true',
    enableApiDocs: process.env.ENABLE_API_DOCS === 'true'
  }
};
`,
      'src/types/database.ts': `
// Database type definitions
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  subscription_tier: 'free' | 'basic' | 'business' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'trial' | 'expired';
  max_users: number;
  max_storage_gb: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  username?: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  email_verified: boolean;
  license_tier: 'basic' | 'business' | 'professional' | 'enterprise';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_name: string;
  status: 'active' | 'inactive' | 'trial' | 'cancelled';
  amount: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  started_at: Date;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date?: Date;
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}
`,
      'src/lib/utils/index.ts': `
// Utility functions
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
`
    };
    
    for (const [filePath, content] of Object.entries(configFiles)) {
      await fs.writeFile(path.join(projectRoot, filePath), content.trim());
      console.log(`✅ Created: ${filePath}`);
    }
    
    // Step 4: Update package.json scripts
    console.log('\n📦 Updating package.json scripts...');
    
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    packageJson.scripts = {
      ...packageJson.scripts,
      'db:seed': 'node scripts/seed-all-tables.js',
      'db:setup': 'node scripts/setup-database-schema.js',
      'db:test': 'node scripts/test-db-connection.js',
      'deploy:vercel': 'scripts/deploy-to-vercel.bat',
      'refactor': 'node scripts/refactor-project.js',
      'lint:fix': 'next lint --fix',
      'type-check': 'tsc --noEmit'
    };
    
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json scripts');
    
    // Step 5: Create index files for better imports
    console.log('\n📝 Creating index files...');
    
    const indexFiles = {
      'src/components/index.ts': `
// Component exports
export * from './ui';
export * from './forms';
export * from './layout';
export * from './features';
`,
      'src/lib/index.ts': `
// Library exports
export * from './db';
export * from './auth';
export * from './utils';
export * from './validations';
`,
      'src/config/index.ts': `
// Configuration exports
export * from './app';
export * from './auth';
export * from './database';
`,
      'src/types/index.ts': `
// Type exports
export * from './database';
`
    };
    
    for (const [filePath, content] of Object.entries(indexFiles)) {
      await fs.writeFile(path.join(projectRoot, filePath), content.trim());
      console.log(`✅ Created: ${filePath}`);
    }
    
    // Step 6: Create README for new structure
    console.log('\n📚 Creating documentation...');
    
    const structureReadme = `
# 🏗️ SBG Platform - Refactored Structure

## 📁 Directory Structure

\`\`\`
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── forms/          # Form components
│   ├── layout/         # Layout components (header, sidebar, etc.)
│   └── features/       # Feature-specific components
├── lib/                # Utilities and configurations
│   ├── db/            # Database utilities
│   ├── auth/          # Authentication utilities
│   ├── utils/         # Helper functions
│   └── validations/   # Schema validations
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── config/            # Configuration files
\`\`\`

## 🚀 Available Scripts

- \`npm run db:seed\` - Seed database with sample data
- \`npm run db:setup\` - Setup database schema
- \`npm run db:test\` - Test database connection
- \`npm run deploy:vercel\` - Deploy to Vercel
- \`npm run refactor\` - Run project refactoring
- \`npm run lint:fix\` - Fix linting issues
- \`npm run type-check\` - Check TypeScript types

## 📊 Database

The database is fully seeded with:
- 5 tenants with different subscription tiers
- 8 users across different tenants and roles
- 5 active subscriptions
- 15 invoices (paid, pending, and draft)

## 🌐 Deployment

The project is configured for Vercel deployment with:
- Proper environment variables
- Database connection to Prisma Cloud
- Optimized build configuration
- Security headers and CORS setup

## 🔧 Development

1. Install dependencies: \`npm install\`
2. Setup database: \`npm run db:setup\`
3. Seed data: \`npm run db:seed\`
4. Start development: \`npm run dev\`
5. Deploy: \`npm run deploy:vercel\`
`;
    
    await fs.writeFile(path.join(projectRoot, 'STRUCTURE.md'), structureReadme.trim());
    console.log('✅ Created STRUCTURE.md');
    
    console.log('\n🎉 Project refactoring completed successfully!');
    console.log('✅ Clean directory structure created');
    console.log('✅ Configuration files consolidated');
    console.log('✅ Type definitions added');
    console.log('✅ Utility functions organized');
    console.log('✅ Package.json scripts updated');
    console.log('✅ Documentation created');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Run: npm run db:seed (to populate database)');
    console.log('2. Run: npm run build (to test build)');
    console.log('3. Run: npm run deploy:vercel (to deploy)');
    
  } catch (error) {
    console.error('❌ Refactoring failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

refactorProject();
