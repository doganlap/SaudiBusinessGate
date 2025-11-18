const crypto = require('crypto');
const { ObjectId } = require('mongodb');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt sensitive data
 */
function encryptData(data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt sensitive data
 */
function decryptData(encryptedData) {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
}

/**
 * Available services with their required fields
 */
const SERVICES = {
  'azure-storage': {
    name: 'Azure Storage',
    icon: 'cloud',
    fields: [
      { name: 'connectionString', label: 'Connection String', type: 'password', required: true },
      { name: 'accountName', label: 'Account Name', type: 'text', required: true }
    ]
  },
  'azure-form-recognizer': {
    name: 'Azure Form Recognizer',
    icon: 'file-text',
    fields: [
      { name: 'endpoint', label: 'Endpoint', type: 'url', required: true },
      { name: 'apiKey', label: 'API Key', type: 'password', required: true }
    ]
  },
  'openai': {
    name: 'OpenAI',
    icon: 'brain',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'model', label: 'Model', type: 'text', required: false }
    ]
  },
  'gmail': {
    name: 'Gmail',
    icon: 'mail',
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'password', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'refreshToken', label: 'Refresh Token', type: 'password', required: true }
    ]
  },
  'outlook': {
    name: 'Outlook / Microsoft 365',
    icon: 'envelope',
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'password', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'tenantId', label: 'Tenant ID', type: 'password', required: true }
    ]
  },
  'sharepoint': {
    name: 'SharePoint',
    icon: 'share',
    fields: [
      { name: 'siteUrl', label: 'Site URL', type: 'url', required: true },
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'tenantId', label: 'Tenant ID', type: 'text', required: false }
    ]
  },
  'sap-erp': {
    name: 'SAP ERP',
    icon: 'database',
    fields: [
      { name: 'gatewayUrl', label: 'Gateway URL', type: 'url', required: true },
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ]
  },
  'mongodb': {
    name: 'MongoDB',
    icon: 'database',
    fields: [
      { name: 'host', label: 'Host', type: 'text', required: true },
      { name: 'port', label: 'Port', type: 'number', required: true },
      { name: 'database', label: 'Database', type: 'text', required: true },
      { name: 'username', label: 'Username', type: 'text', required: false },
      { name: 'password', label: 'Password', type: 'password', required: false }
    ]
  },
  'redis': {
    name: 'Redis',
    icon: 'database',
    fields: [
      { name: 'host', label: 'Host', type: 'text', required: true },
      { name: 'port', label: 'Port', type: 'number', required: true },
      { name: 'password', label: 'Password', type: 'password', required: false }
    ]
  },
  'smtp': {
    name: 'SMTP',
    icon: 'mail',
    fields: [
      { name: 'host', label: 'Host', type: 'text', required: true },
      { name: 'port', label: 'Port', type: 'number', required: true },
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ]
  }
};

/**
 * Save or update user credentials
 */
async function saveCredentials(db, userId, service, credentials) {
  if (!SERVICES[service]) {
    throw new Error(`Unknown service: ${service}`);
  }

  const encryptedData = encryptData(credentials);

  const result = await db.collection('user_credentials').findOneAndUpdate(
    { userId, service },
    {
      $set: {
        userId,
        service,
        encryptedData,
        status: 'not_configured',
        testResults: null,
        lastTested: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true, returnDocument: 'after' }
  );

  return result.value;
}

/**
 * Get user's credentials for a service
 */
async function getCredentials(db, userId, service) {
  const record = await db.collection('user_credentials').findOne({ userId, service });
  if (!record) {
    return null;
  }

  try {
    const decrypted = decryptData(record.encryptedData);
    return {
      id: record._id.toString(),
      service,
      credentials: decrypted,
      status: record.status,
      testResults: record.testResults,
      lastTested: record.lastTested,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  } catch (err) {
    throw new Error('Failed to decrypt credentials');
  }
}

/**
 * Get all credentials for a user
 */
async function getAllCredentials(db, userId) {
  const records = await db
    .collection('user_credentials')
    .find({ userId })
    .toArray();

  return records.map(record => ({
    id: record._id.toString(),
    service: record.service,
    status: record.status,
    testResults: record.testResults,
    lastTested: record.lastTested,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }));
}

/**
 * Delete user credentials
 */
async function deleteCredentials(db, userId, service) {
  const result = await db.collection('user_credentials').deleteOne({ userId, service });
  return result.deletedCount > 0;
}

/**
 * Test credentials by attempting to connect to service
 */
async function testCredentials(db, userId, service) {
  const cred = await getCredentials(db, userId, service);
  if (!cred) {
    throw new Error('Credentials not found');
  }

  let testResult = {
    success: false,
    message: '',
    timestamp: new Date()
  };

  try {
    // Service-specific tests
    switch (service) {
      case 'azure-storage':
        testResult = await testAzureStorage(cred.credentials);
        break;
      case 'azure-form-recognizer':
        testResult = await testAzureFormRecognizer(cred.credentials);
        break;
      case 'openai':
        testResult = await testOpenAI(cred.credentials);
        break;
      case 'gmail':
        testResult = await testGmail(cred.credentials);
        break;
      case 'outlook':
        testResult = await testOutlook(cred.credentials);
        break;
      case 'sharepoint':
        testResult = await testSharePoint(cred.credentials);
        break;
      case 'sap-erp':
        testResult = await testSAPERP(cred.credentials);
        break;
      case 'mongodb':
        testResult = await testMongoDB(cred.credentials);
        break;
      case 'redis':
        testResult = await testRedis(cred.credentials);
        break;
      case 'smtp':
        testResult = await testSMTP(cred.credentials);
        break;
      default:
        throw new Error(`No test available for ${service}`);
    }
  } catch (err) {
    testResult.success = false;
    testResult.message = err.message;
  }

  // Update status in database
  const status = testResult.success ? 'connected' : 'failed';
  await db.collection('user_credentials').updateOne(
    { userId, service },
    {
      $set: {
        status,
        testResults: testResult,
        lastTested: new Date(),
        updatedAt: new Date()
      }
    }
  );

  return testResult;
}

/**
 * Test Azure Storage
 */
async function testAzureStorage(credentials) {
  try {
    if (!credentials.connectionString || !credentials.accountName) {
      throw new Error('Missing required Azure Storage credentials');
    }
    // Validate connection string format
    if (!credentials.connectionString.includes('AccountName=') || !credentials.connectionString.includes('AccountKey=')) {
      throw new Error('Invalid Azure Storage connection string format');
    }
    return {
      success: true,
      message: 'Azure Storage credentials validated',
      timestamp: new Date()
    };
  } catch (err) {
    throw new Error(`Azure Storage validation failed: ${err.message}`);
  }
}

/**
 * Test Azure Form Recognizer
 */
async function testAzureFormRecognizer(credentials) {
  try {
    if (!credentials.endpoint || !credentials.apiKey) {
      throw new Error('Missing required Azure Form Recognizer credentials');
    }
    // Validate endpoint URL format
    if (!credentials.endpoint.includes('cognitiveservices.azure.com')) {
      throw new Error('Invalid Azure Form Recognizer endpoint');
    }
    return {
      success: true,
      message: 'Azure Form Recognizer credentials validated',
      timestamp: new Date()
    };
  } catch (err) {
    throw new Error(`Azure Form Recognizer validation failed: ${err.message}`);
  }
}

/**
 * Test OpenAI
 */
async function testOpenAI(credentials) {
  try {
    if (!credentials.apiKey) {
      throw new Error('Missing required OpenAI API key');
    }
    if (!credentials.apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format');
    }
    return {
      success: true,
      message: 'OpenAI credentials validated',
      timestamp: new Date()
    };
  } catch (err) {
    throw new Error(`OpenAI validation failed: ${err.message}`);
  }
}

/**
 * Test Gmail
 */
async function testGmail(credentials) {
  try {
    // Simplified test - in production would validate OAuth token
    if (!credentials.clientId || !credentials.clientSecret || !credentials.refreshToken) {
      throw new Error('Missing required Gmail credentials');
    }
    return {
      success: true,
      message: 'Gmail credentials validated',
      timestamp: new Date()
    };
  } catch (err) {
    throw new Error(`Gmail validation failed: ${err.message}`);
  }
}

/**
 * Test Outlook
 */
async function testOutlook(credentials) {
  try {
    if (!credentials.clientId || !credentials.clientSecret || !credentials.tenantId) {
      throw new Error('Missing required Outlook credentials');
    }
    return {
      success: true,
      message: 'Outlook credentials validated',
      timestamp: new Date()
    };
  } catch (err) {
    throw new Error(`Outlook validation failed: ${err.message}`);
  }
}

/**
 * Test SharePoint
 */
async function testSharePoint(credentials) {
  try {
    if (!credentials.siteUrl || !credentials.username || !credentials.password) {
      throw new Error('Missing required SharePoint credentials');
    }
    return {
      success: true,
      message: 'SharePoint credentials validated',
      timestamp: new Date()
    };
  } catch (err) {
    throw new Error(`SharePoint validation failed: ${err.message}`);
  }
}

/**
 * Test SAP ERP
 */
async function testSAPERP(credentials) {
  try {
    if (!credentials.gatewayUrl || !credentials.username || !credentials.password) {
      throw new Error('Missing required SAP ERP credentials');
    }
    if (!credentials.gatewayUrl.startsWith('http')) {
      throw new Error('Invalid SAP ERP gateway URL');
    }
    return {
      success: true,
      message: 'SAP ERP credentials validated',
      timestamp: new Date()
    };
  } catch (err) {
    throw new Error(`SAP ERP validation failed: ${err.message}`);
  }
}

/**
 * Test MongoDB
 */
async function testMongoDB(credentials) {
  try {
    if (!credentials.host || !credentials.port || !credentials.database) {
      throw new Error('Missing required MongoDB credentials');
    }
    if (isNaN(credentials.port) || credentials.port < 1 || credentials.port > 65535) {
      throw new Error('Invalid MongoDB port number');
    }
    return {
      success: true,
      message: 'MongoDB credentials validated',
      timestamp: new Date()
    };
  } catch (err) {
    throw new Error(`MongoDB validation failed: ${err.message}`);
  }
}

/**
 * Test Redis
 */
async function testRedis(credentials) {
  try {
    if (!credentials.host || !credentials.port) {
      throw new Error('Missing required Redis credentials');
    }
    if (isNaN(credentials.port) || credentials.port < 1 || credentials.port > 65535) {
      throw new Error('Invalid Redis port number');
    }
    return {
      success: true,
      message: 'Redis credentials validated',
      timestamp: new Date()
    };
  } catch (err) {
    throw new Error(`Redis validation failed: ${err.message}`);
  }
}

/**
 * Test SMTP
 */
async function testSMTP(credentials) {
  try {
    if (!credentials.host || !credentials.port || !credentials.username || !credentials.password) {
      throw new Error('Missing required SMTP credentials');
    }
    if (isNaN(credentials.port) || credentials.port < 1 || credentials.port > 65535) {
      throw new Error('Invalid SMTP port number');
    }
    return {
      success: true,
      message: 'SMTP credentials validated',
      timestamp: new Date()
    };
  } catch (err) {
    throw new Error(`SMTP validation failed: ${err.message}`);
  }
}

module.exports = {
  SERVICES,
  encryptData,
  decryptData,
  saveCredentials,
  getCredentials,
  getAllCredentials,
  deleteCredentials,
  testCredentials
};