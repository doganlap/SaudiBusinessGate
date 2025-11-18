#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/**
 * Configuration validation script
 */

// Load environment
dotenv.config({ path: path.join(__dirname, '.env') });

const errors = [];
const warnings = [];

// Validation rules
const rules = {
  DB_MONGODB_HOST: {
    required: true,
    type: 'string',
    description: 'MongoDB host'
  },
  DB_MONGODB_PORT: {
    required: true,
    type: 'number',
    description: 'MongoDB port',
    default: 27017
  },
  DB_MONGODB_PASSWORD: {
    required: true,
    type: 'string',
    sensitive: true,
    description: 'MongoDB password'
  },
  N8N_HOST: {
    required: true,
    type: 'string',
    description: 'n8n host'
  },
  N8N_PORT: {
    required: true,
    type: 'number',
    description: 'n8n port',
    default: 5678
  },
  LOG_LEVEL: {
    required: false,
    type: 'string',
    enum: ['debug', 'info', 'warn', 'error'],
    description: 'Log level',
    default: 'info'
  },
  NODE_ENV: {
    required: false,
    type: 'string',
    enum: ['development', 'production', 'test'],
    description: 'Node environment',
    default: 'production'
  }
};

console.log('\n🔍 Validating configuration...\n');

// Check each rule
for (const [key, rule] of Object.entries(rules)) {
  const value = process.env[key];
  
  if (!value) {
    if (rule.required) {
      errors.push(`❌ ${key} is required but not set`);
    } else if (rule.default) {
      console.log(`ℹ ${key}: Using default value "${rule.default}"`);
    }
    continue;
  }
  
  // Type validation
  if (rule.type === 'number') {
    if (isNaN(value)) {
      errors.push(`❌ ${key} must be a number, got "${value}"`);
    }
  }
  
  // Enum validation
  if (rule.enum && !rule.enum.includes(value)) {
    errors.push(`❌ ${key} must be one of: ${rule.enum.join(', ')}, got "${value}"`);
  }
  
  if (!errors.length) {
    const display = rule.sensitive ? '***' : value;
    console.log(`✅ ${key}: ${display}`);
  }
}

// Check workflow files
console.log('\n📋 Checking workflow files...\n');

const workflowDir = path.join(__dirname, '../../n8n-workflows/workflows/document');
const workflows = [
  'document-processor-api.json',
  'document-processor-ui.json',
  'document-analyzer.json',
  'document-transformer.json',
  'invoice-generator.json'
];

for (const workflow of workflows) {
  const filePath = path.join(workflowDir, workflow);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${workflow}`);
  } else {
    warnings.push(`⚠ ${workflow} not found`);
  }
}

// Check required directories
console.log('\n📁 Checking directories...\n');

const dirs = ['logs', 'backups', 'workflows'];
for (const dir of dirs) {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dir}/`);
  } else {
    warnings.push(`⚠ ${dir}/ directory not found`);
  }
}

// Summary
console.log('\n' + '='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Configuration is valid!\n');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} error(s) found:\n`);
    errors.forEach(error => console.log(`  ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠ ${warnings.length} warning(s):\n`);
    warnings.forEach(warning => console.log(`  ${warning}`));
  }
  
  console.log('\n');
  process.exit(errors.length > 0 ? 1 : 0);
}#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/**
 * Configuration validation script
 */

// Load environment
dotenv.config({ path: path.join(__dirname, '.env') });

const errors = [];
const warnings = [];

// Validation rules
const rules = {
  DB_MONGODB_HOST: {
    required: true,
    type: 'string',
    description: 'MongoDB host'
  },
  DB_MONGODB_PORT: {
    required: true,
    type: 'number',
    description: 'MongoDB port',
    default: 27017
  },
  DB_MONGODB_PASSWORD: {
    required: true,
    type: 'string',
    sensitive: true,
    description: 'MongoDB password'
  },
  N8N_HOST: {
    required: true,
    type: 'string',
    description: 'n8n host'
  },
  N8N_PORT: {
    required: true,
    type: 'number',
    description: 'n8n port',
    default: 5678
  },
  LOG_LEVEL: {
    required: false,
    type: 'string',
    enum: ['debug', 'info', 'warn', 'error'],
    description: 'Log level',
    default: 'info'
  },
  NODE_ENV: {
    required: false,
    type: 'string',
    enum: ['development', 'production', 'test'],
    description: 'Node environment',
    default: 'production'
  }
};

console.log('\n🔍 Validating configuration...\n');

// Check each rule
for (const [key, rule] of Object.entries(rules)) {
  const value = process.env[key];
  
  if (!value) {
    if (rule.required) {
      errors.push(`❌ ${key} is required but not set`);
    } else if (rule.default) {
      console.log(`ℹ ${key}: Using default value "${rule.default}"`);
    }
    continue;
  }
  
  // Type validation
  if (rule.type === 'number') {
    if (isNaN(value)) {
      errors.push(`❌ ${key} must be a number, got "${value}"`);
    }
  }
  
  // Enum validation
  if (rule.enum && !rule.enum.includes(value)) {
    errors.push(`❌ ${key} must be one of: ${rule.enum.join(', ')}, got "${value}"`);
  }
  
  if (!errors.length) {
    const display = rule.sensitive ? '***' : value;
    console.log(`✅ ${key}: ${display}`);
  }
}

// Check workflow files
console.log('\n📋 Checking workflow files...\n');

const workflowDir = path.join(__dirname, '../../n8n-workflows/workflows/document');
const workflows = [
  'document-processor-api.json',
  'document-processor-ui.json',
  'document-analyzer.json',
  'document-transformer.json',
  'invoice-generator.json'
];

for (const workflow of workflows) {
  const filePath = path.join(workflowDir, workflow);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${workflow}`);
  } else {
    warnings.push(`⚠ ${workflow} not found`);
  }
}

// Check required directories
console.log('\n📁 Checking directories...\n');

const dirs = ['logs', 'backups', 'workflows'];
for (const dir of dirs) {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dir}/`);
  } else {
    warnings.push(`⚠ ${dir}/ directory not found`);
  }
}

// Summary
console.log('\n' + '='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Configuration is valid!\n');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} error(s) found:\n`);
    errors.forEach(error => console.log(`  ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠ ${warnings.length} warning(s):\n`);
    warnings.forEach(warning => console.log(`  ${warning}`));
  }
  
  console.log('\n');
  process.exit(errors.length > 0 ? 1 : 0);
}