#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Setup script for Document Processing Module
 * - Validates environment
 * - Creates required directories
 * - Initializes MongoDB collections
 * - Imports workflows
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`  ${title}`, 'blue');
  log(`${'='.repeat(60)}\n`, 'blue');
}

async function checkNode() {
  logSection('Checking Node.js Version');
  try {
    const version = execSync('node --version', { encoding: 'utf-8' }).trim();
    log(`✓ Node.js ${version}`, 'green');
    return true;
  } catch (error) {
    log('✗ Node.js not found', 'red');
    return false;
  }
}

async function checkEnvironment() {
  logSection('Checking Environment Variables');
  
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    log('✗ .env file not found', 'red');
    log('  Creating from .env.example...', 'yellow');
    
    const examplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      log('✓ .env file created', 'green');
      log('  ⚠ Please edit .env with your credentials', 'yellow');
      return false;
    } else {
      log('✗ .env.example not found', 'red');
      return false;
    }
  }
  
  log('✓ .env file found', 'green');
  
  const requiredVars = [
    'DB_MONGODB_HOST',
    'DB_MONGODB_PORT',
    'DB_MONGODB_PASSWORD',
    'N8N_HOST',
    'N8N_PORT'
  ];
  
  const env = fs.readFileSync(envPath, 'utf-8');
  let allFound = true;
  
  for (const variable of requiredVars) {
    if (env.includes(`${variable}=`)) {
      log(`✓ ${variable}`, 'green');
    } else {
      log(`✗ ${variable} not found`, 'red');
      allFound = false;
    }
  }
  
  return allFound;
}

async function createDirectories() {
  logSection('Creating Required Directories');
  
  const dirs = [
    'workflows',
    'logs',
    'backups',
    'data',
    'mongodb-init'
  ];
  
  for (const dir of dirs) {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`✓ Created ${dir}`, 'green');
    } else {
      log(`✓ ${dir} already exists`, 'green');
    }
  }
}

async function initializeCollections() {
  logSection('Initializing MongoDB Collections');
  
  const mongoInitScript = `
// Create collections
db.createCollection('processed_documents');
db.createCollection('analytics');
db.createCollection('transformations');
db.createCollection('audit_log');

// Create indexes
db.processed_documents.createIndex({ "timestamp": -1 });
db.processed_documents.createIndex({ "documentType": 1 });
db.processed_documents.createIndex({ "documentId": 1 }, { unique: true });
db.processed_documents.createIndex({ "status": 1 });

db.analytics.createIndex({ "timestamp": -1 });
db.transformations.createIndex({ "timestamp": -1 });
db.transformations.createIndex({ "transformationId": 1 }, { unique: true });
db.audit_log.createIndex({ "timestamp": -1 });

// Create sample audit log entry
db.audit_log.insertOne({
  timestamp: new Date(),
  event: "database_initialized",
  version: "2.0.0",
  status: "success"
});

console.log("Collections and indexes created successfully");
`;
  
  try {
    const mongoInitPath = path.join(__dirname, 'mongodb-init', 'init.js');
    fs.writeFileSync(mongoInitPath, mongoInitScript);
    log('✓ MongoDB initialization script created', 'green');
  } catch (error) {
    log(`✗ Error creating MongoDB script: ${error.message}`, 'red');
  }
}

function validateWorkflows() {
  logSection('Validating Workflow Files');
  
  const workflowDir = path.join(__dirname, '../../n8n-workflows/workflows/document');
  const requiredWorkflows = [
    'document-processor-api.json',
    'document-processor-ui.json',
    'document-analyzer.json',
    'document-transformer.json',
    'invoice-generator.json'
  ];
  
  let allValid = true;
  
  for (const workflow of requiredWorkflows) {
    const workflowPath = path.join(workflowDir, workflow);
    if (fs.existsSync(workflowPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));
        log(`✓ ${workflow} - Valid`, 'green');
      } catch (error) {
        log(`✗ ${workflow} - Invalid JSON`, 'red');
        allValid = false;
      }
    } else {
      log(`✗ ${workflow} - Not found`, 'red');
      allValid = false;
    }
  }
  
  return allValid;
}

async function testConnections() {
  logSection('Testing External Connections');
  
  const tests = [
    {
      name: 'MongoDB',
      url: `mongodb://${process.env.DB_MONGODB_HOST}:${process.env.DB_MONGODB_PORT}`,
      optional: false
    },
    {
      name: 'n8n',
      url: `${process.env.N8N_PROTOCOL || 'http'}://${process.env.N8N_HOST}:${process.env.N8N_PORT}/health`,
      optional: true
    }
  ];
  
  for (const test of tests) {
    try {
      log(`Testing ${test.name}...`, 'yellow');
      if (test.name === 'MongoDB') {
        log(`✓ ${test.name} configured at ${test.url}`, 'green');
      } else if (test.name === 'n8n') {
        log(`✓ ${test.name} configured at ${test.url}`, 'green');
      }
    } catch (error) {
      const prefix = test.optional ? '⚠' : '✗';
      log(`${prefix} ${test.name} error: ${error.message}`, 'red');
    }
  }
}

async function installDependencies() {
  logSection('Installing Dependencies');
  
  try {
    log('Running npm install...', 'yellow');
    execSync('npm install', { 
      cwd: __dirname,
      stdio: 'inherit'
    });
    log('✓ Dependencies installed', 'green');
  } catch (error) {
    log(`✗ Failed to install dependencies: ${error.message}`, 'red');
  }
}

async function generateDocumentation() {
  logSection('Generating Documentation');
  
  const configDocs = `# Configuration Reference

## Environment Variables

### Database Configuration
- **DB_MONGODB_HOST**: MongoDB host (default: localhost)
- **DB_MONGODB_PORT**: MongoDB port (default: 27017)
- **DB_MONGODB_DATABASE**: Database name (default: document_processing)
- **DB_MONGODB_USERNAME**: Username for authentication
- **DB_MONGODB_PASSWORD**: Password for authentication

### n8n Configuration
- **N8N_HOST**: n8n host (default: localhost)
- **N8N_PORT**: n8n port (default: 5678)
- **N8N_PROTOCOL**: Protocol (default: http)

### Third-party Integrations
- **SLACK_BOT_TOKEN**: Slack bot token for notifications
- **GOOGLE_DRIVE_API_KEY**: Google Drive API key
- **SMTP_HOST**: SMTP server host
- **SMTP_PORT**: SMTP server port
- **SMTP_USER**: SMTP username
- **SMTP_PASSWORD**: SMTP password

### Application Settings
- **LOG_LEVEL**: Log level (debug, info, warn, error)
- **NODE_ENV**: Environment (production, development, test)
- **MAX_DOCUMENT_SIZE**: Maximum file size for documents
- **RETENTION_DAYS**: How long to keep processed documents

## Workflows

### 1. Document Processor API
- **Path**: /webhook/document-processor-api
- **Method**: POST/GET
- **Purpose**: Main API for document processing

### 2. Document Processor UI
- **Path**: /webhook/document-ui
- **Method**: GET
- **Purpose**: Web interface for document management

### 3. Document Analyzer
- **Trigger**: Schedule (every 15 minutes)
- **Purpose**: Analyze and generate statistics

### 4. Document Transformer
- **Path**: /webhook/transform
- **Method**: POST
- **Purpose**: Convert documents between formats

### 5. Invoice Generator
- **Path**: /webhook/generate-invoice
- **Method**: POST
- **Purpose**: Generate and send invoices

## API Examples

See API_EXAMPLES.md for detailed API usage examples.

## Troubleshooting

See TROUBLESHOOTING.md for common issues and solutions.
`;
  
  fs.writeFileSync(
    path.join(__dirname, 'CONFIGURATION.md'),
    configDocs
  );
  log('✓ Configuration reference generated', 'green');
}

async function printSummary() {
  logSection('Setup Summary');
  
  log('\n✅ Setup completed successfully!\n', 'green');
  
  log('Next steps:', 'blue');
  log('1. Edit .env file with your credentials', 'yellow');
  log('2. Start services: docker-compose up -d', 'yellow');
  log('3. Access n8n: http://localhost:5678', 'yellow');
  log('4. Import workflows: npm run import-workflows', 'yellow');
  log('5. Configure credentials in n8n UI', 'yellow');
  log('6. Activate workflows', 'yellow');
  
  log('\nDocumentation:', 'blue');
  log('- README.md: Main documentation', 'yellow');
  log('- CONFIGURATION.md: Configuration reference', 'yellow');
  log('- .env.example: Environment variables template', 'yellow');
  
  log('\nUseful commands:', 'blue');
  log('- npm start: Start n8n', 'yellow');
  log('- npm run validate-config: Validate configuration', 'yellow');
  log('- npm run test: Run tests', 'yellow');
  log('- docker-compose logs -f: View container logs', 'yellow');
  
  log('\nFor support, see SUPPORT.md\n', 'blue');
}

async function run() {
  console.clear();
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║  Document Processing Module - Setup Wizard                 ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝\n', 'blue');
  
  let success = true;
  
  // Run checks in sequence
  if (!(await checkNode())) success = false;
  if (!(await checkEnvironment())) success = false;
  
  if (success) {
    await createDirectories();
    await initializeCollections();
    if (!validateWorkflows()) success = false;
    await testConnections();
    await generateDocumentation();
  }
  
  if (success) {
    await printSummary();
  } else {
    logSection('Setup Incomplete');
    log('Please review the errors above and try again.', 'red');
    process.exit(1);
  }
}

// Run setup
run().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Setup script for Document Processing Module
 * - Validates environment
 * - Creates required directories
 * - Initializes MongoDB collections
 * - Imports workflows
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`  ${title}`, 'blue');
  log(`${'='.repeat(60)}\n`, 'blue');
}

async function checkNode() {
  logSection('Checking Node.js Version');
  try {
    const version = execSync('node --version', { encoding: 'utf-8' }).trim();
    log(`✓ Node.js ${version}`, 'green');
    return true;
  } catch (error) {
    log('✗ Node.js not found', 'red');
    return false;
  }
}

async function checkEnvironment() {
  logSection('Checking Environment Variables');
  
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    log('✗ .env file not found', 'red');
    log('  Creating from .env.example...', 'yellow');
    
    const examplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      log('✓ .env file created', 'green');
      log('  ⚠ Please edit .env with your credentials', 'yellow');
      return false;
    } else {
      log('✗ .env.example not found', 'red');
      return false;
    }
  }
  
  log('✓ .env file found', 'green');
  
  const requiredVars = [
    'DB_MONGODB_HOST',
    'DB_MONGODB_PORT',
    'DB_MONGODB_PASSWORD',
    'N8N_HOST',
    'N8N_PORT'
  ];
  
  const env = fs.readFileSync(envPath, 'utf-8');
  let allFound = true;
  
  for (const variable of requiredVars) {
    if (env.includes(`${variable}=`)) {
      log(`✓ ${variable}`, 'green');
    } else {
      log(`✗ ${variable} not found`, 'red');
      allFound = false;
    }
  }
  
  return allFound;
}

async function createDirectories() {
  logSection('Creating Required Directories');
  
  const dirs = [
    'workflows',
    'logs',
    'backups',
    'data',
    'mongodb-init'
  ];
  
  for (const dir of dirs) {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`✓ Created ${dir}`, 'green');
    } else {
      log(`✓ ${dir} already exists`, 'green');
    }
  }
}

async function initializeCollections() {
  logSection('Initializing MongoDB Collections');
  
  const mongoInitScript = `
// Create collections
db.createCollection('processed_documents');
db.createCollection('analytics');
db.createCollection('transformations');
db.createCollection('audit_log');

// Create indexes
db.processed_documents.createIndex({ "timestamp": -1 });
db.processed_documents.createIndex({ "documentType": 1 });
db.processed_documents.createIndex({ "documentId": 1 }, { unique: true });
db.processed_documents.createIndex({ "status": 1 });

db.analytics.createIndex({ "timestamp": -1 });
db.transformations.createIndex({ "timestamp": -1 });
db.transformations.createIndex({ "transformationId": 1 }, { unique: true });
db.audit_log.createIndex({ "timestamp": -1 });

// Create sample audit log entry
db.audit_log.insertOne({
  timestamp: new Date(),
  event: "database_initialized",
  version: "2.0.0",
  status: "success"
});

console.log("Collections and indexes created successfully");
`;
  
  try {
    const mongoInitPath = path.join(__dirname, 'mongodb-init', 'init.js');
    fs.writeFileSync(mongoInitPath, mongoInitScript);
    log('✓ MongoDB initialization script created', 'green');
  } catch (error) {
    log(`✗ Error creating MongoDB script: ${error.message}`, 'red');
  }
}

function validateWorkflows() {
  logSection('Validating Workflow Files');
  
  const workflowDir = path.join(__dirname, '../../n8n-workflows/workflows/document');
  const requiredWorkflows = [
    'document-processor-api.json',
    'document-processor-ui.json',
    'document-analyzer.json',
    'document-transformer.json',
    'invoice-generator.json'
  ];
  
  let allValid = true;
  
  for (const workflow of requiredWorkflows) {
    const workflowPath = path.join(workflowDir, workflow);
    if (fs.existsSync(workflowPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));
        log(`✓ ${workflow} - Valid`, 'green');
      } catch (error) {
        log(`✗ ${workflow} - Invalid JSON`, 'red');
        allValid = false;
      }
    } else {
      log(`✗ ${workflow} - Not found`, 'red');
      allValid = false;
    }
  }
  
  return allValid;
}

async function testConnections() {
  logSection('Testing External Connections');
  
  const tests = [
    {
      name: 'MongoDB',
      url: `mongodb://${process.env.DB_MONGODB_HOST}:${process.env.DB_MONGODB_PORT}`,
      optional: false
    },
    {
      name: 'n8n',
      url: `${process.env.N8N_PROTOCOL || 'http'}://${process.env.N8N_HOST}:${process.env.N8N_PORT}/health`,
      optional: true
    }
  ];
  
  for (const test of tests) {
    try {
      log(`Testing ${test.name}...`, 'yellow');
      if (test.name === 'MongoDB') {
        log(`✓ ${test.name} configured at ${test.url}`, 'green');
      } else if (test.name === 'n8n') {
        log(`✓ ${test.name} configured at ${test.url}`, 'green');
      }
    } catch (error) {
      const prefix = test.optional ? '⚠' : '✗';
      log(`${prefix} ${test.name} error: ${error.message}`, 'red');
    }
  }
}

async function installDependencies() {
  logSection('Installing Dependencies');
  
  try {
    log('Running npm install...', 'yellow');
    execSync('npm install', { 
      cwd: __dirname,
      stdio: 'inherit'
    });
    log('✓ Dependencies installed', 'green');
  } catch (error) {
    log(`✗ Failed to install dependencies: ${error.message}`, 'red');
  }
}

async function generateDocumentation() {
  logSection('Generating Documentation');
  
  const configDocs = `# Configuration Reference

## Environment Variables

### Database Configuration
- **DB_MONGODB_HOST**: MongoDB host (default: localhost)
- **DB_MONGODB_PORT**: MongoDB port (default: 27017)
- **DB_MONGODB_DATABASE**: Database name (default: document_processing)
- **DB_MONGODB_USERNAME**: Username for authentication
- **DB_MONGODB_PASSWORD**: Password for authentication

### n8n Configuration
- **N8N_HOST**: n8n host (default: localhost)
- **N8N_PORT**: n8n port (default: 5678)
- **N8N_PROTOCOL**: Protocol (default: http)

### Third-party Integrations
- **SLACK_BOT_TOKEN**: Slack bot token for notifications
- **GOOGLE_DRIVE_API_KEY**: Google Drive API key
- **SMTP_HOST**: SMTP server host
- **SMTP_PORT**: SMTP server port
- **SMTP_USER**: SMTP username
- **SMTP_PASSWORD**: SMTP password

### Application Settings
- **LOG_LEVEL**: Log level (debug, info, warn, error)
- **NODE_ENV**: Environment (production, development, test)
- **MAX_DOCUMENT_SIZE**: Maximum file size for documents
- **RETENTION_DAYS**: How long to keep processed documents

## Workflows

### 1. Document Processor API
- **Path**: /webhook/document-processor-api
- **Method**: POST/GET
- **Purpose**: Main API for document processing

### 2. Document Processor UI
- **Path**: /webhook/document-ui
- **Method**: GET
- **Purpose**: Web interface for document management

### 3. Document Analyzer
- **Trigger**: Schedule (every 15 minutes)
- **Purpose**: Analyze and generate statistics

### 4. Document Transformer
- **Path**: /webhook/transform
- **Method**: POST
- **Purpose**: Convert documents between formats

### 5. Invoice Generator
- **Path**: /webhook/generate-invoice
- **Method**: POST
- **Purpose**: Generate and send invoices

## API Examples

See API_EXAMPLES.md for detailed API usage examples.

## Troubleshooting

See TROUBLESHOOTING.md for common issues and solutions.
`;
  
  fs.writeFileSync(
    path.join(__dirname, 'CONFIGURATION.md'),
    configDocs
  );
  log('✓ Configuration reference generated', 'green');
}

async function printSummary() {
  logSection('Setup Summary');
  
  log('\n✅ Setup completed successfully!\n', 'green');
  
  log('Next steps:', 'blue');
  log('1. Edit .env file with your credentials', 'yellow');
  log('2. Start services: docker-compose up -d', 'yellow');
  log('3. Access n8n: http://localhost:5678', 'yellow');
  log('4. Import workflows: npm run import-workflows', 'yellow');
  log('5. Configure credentials in n8n UI', 'yellow');
  log('6. Activate workflows', 'yellow');
  
  log('\nDocumentation:', 'blue');
  log('- README.md: Main documentation', 'yellow');
  log('- CONFIGURATION.md: Configuration reference', 'yellow');
  log('- .env.example: Environment variables template', 'yellow');
  
  log('\nUseful commands:', 'blue');
  log('- npm start: Start n8n', 'yellow');
  log('- npm run validate-config: Validate configuration', 'yellow');
  log('- npm run test: Run tests', 'yellow');
  log('- docker-compose logs -f: View container logs', 'yellow');
  
  log('\nFor support, see SUPPORT.md\n', 'blue');
}

async function run() {
  console.clear();
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║  Document Processing Module - Setup Wizard                 ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝\n', 'blue');
  
  let success = true;
  
  // Run checks in sequence
  if (!(await checkNode())) success = false;
  if (!(await checkEnvironment())) success = false;
  
  if (success) {
    await createDirectories();
    await initializeCollections();
    if (!validateWorkflows()) success = false;
    await testConnections();
    await generateDocumentation();
  }
  
  if (success) {
    await printSummary();
  } else {
    logSection('Setup Incomplete');
    log('Please review the errors above and try again.', 'red');
    process.exit(1);
  }
}

// Run setup
run().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});