---
description: Repository Information Overview
alwaysApply: true
---

# Saudi Store Repository Information

## Repository Summary
**Saudi Store** is the world's first fully autonomous store platform, pioneering AI-powered retail and enterprise services from Saudi Arabia. This is a comprehensive Next.js 16 monorepo featuring 104+ API endpoints, 28 active UI pages, full Arabic/English bilingual support, and autonomous operations with 90% self-operating platform capabilities.

## Repository Structure
This is a multi-project monorepo with the following main structure:
- **Main Application**: Next.js 16 TypeScript application with comprehensive enterprise modules
- **Services Layer**: AI, Billing, License, Performance, Security, WhiteLabel, Workflow services
- **Product Modules**: Finance, Sales modules with dedicated configurations
- **Testing Suite**: Jest unit tests, Selenium end-to-end testing with Python/Robot Framework
- **Infrastructure**: Docker containerization, database migrations, deployment scripts

### Main Repository Components
- **Main Platform**: Core Next.js application with enterprise modules (GRC, CRM, HR, Finance, Analytics)
- **AI Services**: Autonomous AI agents, LLM integration with Ollama support
- **Product Modules**: Finance module (Next.js), Sales/GRC modules with extensive data processing
- **Testing Infrastructure**: Comprehensive testing with Jest (unit) and Selenium/Robot Framework (E2E)
- **Database Layer**: Prisma ORM with PostgreSQL, multi-tenant architecture
- **Deployment Infrastructure**: Multiple Docker configurations, CI/CD pipelines

## Projects

### Main Platform (saudi-store)
**Configuration File**: package.json

#### Language & Runtime
**Language**: TypeScript, JavaScript  
**Runtime**: Node.js (18+ required)  
**Framework**: Next.js 16.0.1  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- Next.js 16.0.1, React 19.2.0, React DOM 19.2.0
- Prisma 6.19.0 (PostgreSQL ORM)
- NextAuth 4.24.13 (Authentication)
- TailwindCSS (Styling), next-themes 0.4.6
- React libraries: react-dropzone, react-google-charts

**Development Dependencies**:
- TypeScript 5.7.2, ts-node, jest, @types packages
- ESLint (Next.js configuration)
- Prisma CLI tools

#### Build & Installation
```bash
npm install
npm run build
npm start
```

**Development**:
```bash
npm run dev          # Start on port 3051
npm run dev:all      # Start with WebSocket
npm run ws:dev       # WebSocket server only
```

#### Docker
**Dockerfile**: Production Dockerfile (Node.js 18 Alpine)
**Docker Compose**: docker-compose.yml with multi-service setup
**Configuration**: Multi-stage build with dependencies optimization

#### Testing
**Framework**: Jest (unit tests), ts-jest preset
**Test Location**: `tests/`, `app/` directories  
**Configuration**: jest.config.cjs with TypeScript support
**Run Commands**:
```bash
npm test            # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report
```

### AI Services Module
**Configuration File**: apps/Services/AI/package.json

#### Language & Runtime
**Language**: TypeScript, JavaScript
**Framework**: Next.js 14.2.33
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- Next.js 14.2.33, React 18.3.1
- AI/ML integration libraries

#### Build & Installation
```bash
cd apps/Services/AI
npm install
npm run build
npm start
```

### Finance Product Module
**Configuration File**: apps/Products/Finance/package.json

#### Language & Runtime
**Language**: TypeScript
**Framework**: Next.js with TailwindCSS
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- @tanstack/react-table 8.21.3 (Data tables)
- axios 1.7.2 (HTTP client)
- TailwindCSS styling framework

#### Build & Installation
```bash
cd apps/Products/Finance
npm install
npm run build
npm start
```

### Billing Service
**Configuration File**: apps/Services/Billing/package.json

#### Language & Runtime
**Language**: TypeScript/JavaScript
**Framework**: Node.js service with Express-like architecture
**Package Manager**: npm

#### Docker
**Dockerfile**: apps/Services/Billing/Dockerfile
**Configuration**: Standalone microservice containerization

### Python Testing Suite
**Type**: End-to-End Testing Infrastructure

#### Specification & Tools
**Type**: Selenium WebDriver with Robot Framework
**Python Version**: 3.11+ (based on virtual environment structure)
**Required Tools**: Selenium WebDriver, Robot Framework

#### Key Resources
**Main Files**:
- apps/tests/selenium/requirements.txt (Python dependencies)
- Robot Framework test suites and configurations

#### Dependencies & Installation
**Python Dependencies**:
- selenium 4.15.2, robotframework 6.1.1
- robotframework-seleniumlibrary 6.2.0
- pytest 7.4.3, requests 2.31.0
- webdriver-manager 4.0.1

#### Usage & Operations
**Key Commands**:
```bash
cd apps/tests/selenium
pip install -r requirements.txt
python -m pytest                    # Run pytest tests
robot test_suites/                   # Run Robot Framework tests
```

#### Validation
**Quality Checks**: Automated UI testing with Selenium WebDriver
**Testing Approach**: Cross-browser testing with headless Chrome/Firefox support

### Database Infrastructure
**Type**: PostgreSQL with Prisma ORM

#### Specification & Tools
**Database**: PostgreSQL (Prisma Cloud)
**ORM**: Prisma 6.19.0 with client generation
**Migration System**: Prisma migrate

#### Key Resources
**Main Files**:
- prisma/schema.prisma (Database schema)
- database/ directory (SQL migrations and setup scripts)
- Multiple seed files for different modules

#### Usage & Operations
**Key Commands**:
```bash
npx prisma generate          # Generate Prisma client
npx prisma db push          # Push schema to database
npx prisma migrate deploy   # Run migrations
npx prisma studio           # Database GUI
```

**Integration Points**:
Multi-tenant architecture with subscription plans, enterprise modules integration

#### Validation
**Quality Checks**: Database schema validation, migration testing
**Testing Approach**: Automated database tests with connection verification scripts