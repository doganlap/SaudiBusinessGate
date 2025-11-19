# Mock Data and Incomplete Implementation Replacement Plan

## Overview

This document outlines the comprehensive plan to replace hardcoded mock data and incomplete implementations across the Saudi Business Gate platform with production-ready database-driven solutions.

## ✅ **COMPLETED FIXES**

### 1. Database Connection Pool ✅

- **Fixed**: `lib/services/database.service.ts`
- **Status**: Real PostgreSQL connection pool implemented
- **Details**: Replaced mock connection pool with actual database connection using `lib/db/connection.ts`

### 2. Notification Service ✅

- **Fixed**: `lib/services/notification.service.ts`
- **Status**: Real webhook configuration and notification history implemented
- **Details**:
  - Added database-driven webhook configuration checks
  - Implemented notification history retrieval from database
  - Added proper notification marking as read functionality

## 🔄 **HIGH PRIORITY FIXES NEEDED**

### 3. CRM Mock Customer Data 🚨

- **File**: `app/api/crm/customers/route.ts`
- **Issue**: API already has database integration but may have fallback to mock data
- **Status**: Needs verification and cleanup of any remaining mock fallbacks
- **Impact**: Customer management functionality

### 4. Procurement Mock Vendor Data 🚨

- **File**: `app/api/procurement/vendors/route.ts`
- **Issue**: Hardcoded vendor array instead of database queries
- **Mock Data**: 4 vendors with test contact information
- **Required Fix**: Replace with database queries to `vendors` table

### 5. User Authentication Mock System 🚨

- **File**: `app/api/auth/sync-user/route.ts`
- **Issue**: Hardcoded user array with test credentials
- **Mock Data**: 3 users including <admin@saudistore.com>
- **Required Fix**: Integrate with real user management system

### 6. Environment Configuration Placeholders 🚨

- **File**: `.env.production.template`
- **Issue**: Contains placeholder values for production services
- **Critical Placeholders**:
  - `NEXTAUTH_SECRET=CHANGE_THIS_TO_RANDOM_32_CHAR_STRING`
  - `DATABASE_URL=postgresql://user:password@host:5432/database`
  - `STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY`
  - `SMTP_USER=your-email@gmail.com`
  - `AWS_ACCESS_KEY_ID=your-access-key`
  - `SENTRY_DSN=https://your-sentry-dsn@sentry.io/project`

## 🔄 **MEDIUM PRIORITY FIXES NEEDED**

### 7. AI Agent Mock Configurations

- **File**: `app/api/ai-agents/route.ts`
- **Issue**: Hardcoded agent definitions with fake metrics
- **Mock Data**: 5 AI agents with fake performance data
- **Required Fix**: Move to database-driven configuration system

### 8. Theme Management Mock System

- **File**: `app/api/themes/route.ts`
- **Issue**: Hardcoded theme configurations
- **Mock Data**: 3 themes with hardcoded Saudi green colors
- **Required Fix**: Database-driven theme management

### 9. Workflow Designer Mock Templates

- **File**: `app/api/workflows/designer/route.ts`
- **Issue**: Hardcoded workflow templates
- **Mock Data**: 2 workflow templates with hardcoded business logic
- **Required Fix**: Configurable workflow engine

### 10. Red Flags Detection Mock System

- **File**: `app/api/red-flags/route.ts`
- **Issue**: Hardcoded fraud detection events
- **Mock Data**: 5 red flag events with fake detection data
- **Required Fix**: Real-time monitoring integration

### 11. AI Agent Configuration Constants

- **File**: `lib/config/ai-agent-constants.ts`
- **Issue**: Extensive hardcoded configuration
- **Mock Data**: Hardcoded approval limits, business rules, LLM models
- **Required Fix**: Database-driven configuration system

### 12. In-Memory User Store

- **File**: `lib/mock/users-memory.ts`
- **Issue**: JavaScript Map for user storage
- **Mock Data**: Hardcoded seed users with test emails
- **Required Fix**: Remove entirely, use database

## 📋 **DATABASE SCHEMA REQUIREMENTS**

### Required Tables for Full Implementation

```sql
-- Customers (may already exist)
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(3) DEFAULT 'SA',
  industry VARCHAR(100),
  status VARCHAR(20) DEFAULT 'prospect',
  tier VARCHAR(20) DEFAULT 'bronze',
  total_value DECIMAL(12,2) DEFAULT 0,
  last_order VARCHAR(255),
  assigned_to VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(3) DEFAULT 'SA',
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Agents Configuration
CREATE TABLE IF NOT EXISTS ai_agents (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  type VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  config JSONB,
  status VARCHAR(20) DEFAULT 'inactive',
  tasks_completed INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Themes
CREATE TABLE IF NOT EXISTS themes (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  description TEXT,
  colors JSONB,
  fonts JSONB,
  layout_config JSONB,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Webhook Configurations
CREATE TABLE IF NOT EXISTS tenant_webhook_configs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  webhook_url VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255),
  type VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info',
  data JSONB,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Red Flags
CREATE TABLE IF NOT EXISTS red_flags (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  source_table VARCHAR(100),
  source_id VARCHAR(255),
  event_data JSONB,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 **IMPLEMENTATION PRIORITY**

### Phase 1: Critical Infrastructure (Week 1)

1. ✅ Database connection pool (COMPLETED)
2. ✅ Notification service (COMPLETED)
3. 🔄 Environment configuration setup
4. 🔄 User authentication system

### Phase 2: Core Business Logic (Week 2)

1. 🔄 CRM customer data integration
2. 🔄 Procurement vendor data integration
3. 🔄 AI agent configuration system

### Phase 3: Advanced Features (Week 3)

1. 🔄 Theme management system
2. 🔄 Workflow designer integration
3. 🔄 Red flags detection system

## 🔒 **SECURITY CONSIDERATIONS**

### Environment Variables Security

- Generate strong random secrets for `NEXTAUTH_SECRET` and `JWT_SECRET`
- Use production database credentials
- Configure proper CORS origins
- Set up rate limiting
- Enable CSRF protection

### Database Security

- Use connection pooling with proper limits
- Implement proper SQL injection prevention
- Set up database user with minimal required permissions
- Enable SSL connections for production

### API Security

- Implement proper authentication middleware
- Add request validation
- Set up proper error handling without exposing sensitive data
- Implement audit logging

## 📊 **TESTING STRATEGY**

### Unit Tests Required

- Database connection and query functions
- API route handlers with real database
- Notification service functionality
- User authentication flows

### Integration Tests Required

- End-to-end API workflows
- Database migration scripts
- Environment configuration validation
- Multi-tenant data isolation

## 🎯 **SUCCESS CRITERIA**

### Definition of Done

- [ ] All mock data arrays removed from codebase
- [ ] All API routes use database queries
- [ ] All environment placeholders replaced with production values
- [ ] All hardcoded configuration moved to database
- [ ] Comprehensive test coverage for new implementations
- [ ] Documentation updated for new database schema
- [ ] Performance benchmarks meet requirements
- [ ] Security audit passed

### Performance Targets

- API response times < 500ms (95th percentile)
- Database query optimization implemented
- Connection pooling properly configured
- Caching strategy implemented where appropriate

## 📝 **NEXT STEPS**

1. **Immediate Actions**:
   - Set up production environment variables
   - Create missing database tables
   - Replace procurement vendor mock data
   - Fix user authentication system

2. **Short-term Goals**:
   - Complete AI agent configuration system
   - Implement theme management database integration
   - Set up comprehensive testing suite

3. **Long-term Goals**:
   - Implement real-time monitoring for red flags
   - Advanced workflow engine with database persistence
   - Performance optimization and caching layer

---

## 📞 **SUPPORT & ESCALATION**

For any issues during implementation:

- Database schema questions: Review `prisma/schema.prisma`
- API integration issues: Check existing working examples in `app/api/crm/customers/route.ts`
- Environment setup: Reference `.env.production.template`
- Testing: Follow patterns in `tests/` directory

**Status**: 2/12 major components completed (17% complete)
**Next Priority**: Environment configuration and user authentication system
