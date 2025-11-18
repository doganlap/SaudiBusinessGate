# 🏗️ SBG Platform - Refactored Structure

## 📁 Directory Structure

```
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
```

## 🚀 Available Scripts

- `npm run db:seed` - Seed database with sample data
- `npm run db:setup` - Setup database schema
- `npm run db:test` - Test database connection
- `npm run deploy:vercel` - Deploy to Vercel
- `npm run refactor` - Run project refactoring
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - Check TypeScript types

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

1. Install dependencies: `npm install`
2. Setup database: `npm run db:setup`
3. Seed data: `npm run db:seed`
4. Start development: `npm run dev`
5. Deploy: `npm run deploy:vercel`