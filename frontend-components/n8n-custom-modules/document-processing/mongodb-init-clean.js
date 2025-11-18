/**
 * MongoDB Initialization - Production Clean Setup
 * Removes all mock data and initializes real production schemas
 * Integrates with: Azure, SharePoint, OneDrive, Gmail, Outlook, SAP, OpenAI
 */

const { MongoClient } = require('mongodb');
const logger = require('./lib/logger');

class MongoDBInitializer {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      const connectionString = `mongodb://${this.config.DB_MONGODB_USERNAME}:${this.config.DB_MONGODB_PASSWORD}@${this.config.DB_MONGODB_HOST}:${this.config.DB_MONGODB_PORT}/${this.config.DB_MONGODB_DATABASE}?authSource=${this.config.DB_MONGODB_AUTH_SOURCE}&replicaSet=${this.config.DB_MONGODB_REPLICA_SET || 'rs0'}`;

      this.client = new MongoClient(connectionString);
      await this.client.connect();
      this.db = this.client.db(this.config.DB_MONGODB_DATABASE);

      logger.info('Connected to MongoDB');
    } catch (error) {
      logger.error(`Failed to connect to MongoDB: ${error.message}`);
      throw error;
    }
  }

  async dropAllCollections() {
    try {
      const collections = await this.db.listCollections().toArray();
      for (const collection of collections) {
        await this.db.collection(collection.name).drop();
        logger.info(`Dropped collection: ${collection.name}`);
      }
      logger.info('All collections dropped');
    } catch (error) {
      logger.error(`Error dropping collections: ${error.message}`);
    }
  }

  async initializeCollections() {
    try {
      // Documents collection - stores document metadata and processing history
      await this.db.createCollection('documents', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['filename', 'documentType', 'status', 'createdAt'],
            properties: {
              _id: { bsonType: 'objectId' },
              filename: { bsonType: 'string', description: 'Original filename' },
              documentType: { enum: ['invoice', 'po', 'receipt', 'contract', 'report', 'email', 'spreadsheet', 'other'] },
              status: { enum: ['uploaded', 'processing', 'completed', 'failed', 'archived'] },
              fileSize: { bsonType: 'int', description: 'File size in bytes' },
              mimeType: { bsonType: 'string' },
              uploadedBy: { bsonType: 'string', description: 'User ID who uploaded' },
              uploadedAt: { bsonType: 'date' },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' },
              tags: { bsonType: 'array', items: { bsonType: 'string' } },
              
              // Storage locations
              storage: {
                bsonType: 'object',
                properties: {
                  azure: { bsonType: 'object', properties: { blobUrl: { bsonType: 'string' }, blobName: { bsonType: 'string' }, container: { bsonType: 'string' } } },
                  sharepoint: { bsonType: 'object', properties: { documentId: { bsonType: 'string' }, webUrl: { bsonType: 'string' }, siteId: { bsonType: 'string' } } },
                  onedrive: { bsonType: 'object', properties: { documentId: { bsonType: 'string' }, webUrl: { bsonType: 'string' } } },
                  folder: { bsonType: 'object', properties: { path: { bsonType: 'string' }, relativePath: { bsonType: 'string' } } }
                }
              },

              // Analysis results
              analysis: {
                bsonType: 'object',
                properties: {
                  azure: { bsonType: 'object' },
                  gpt: { bsonType: 'object' },
                  classification: { bsonType: 'string' },
                  extractedData: { bsonType: 'object' },
                  confidence: { bsonType: 'double' },
                  completedAt: { bsonType: 'date' }
                }
              },

              // SAP integration
              sap: {
                bsonType: 'object',
                properties: {
                  synced: { bsonType: 'bool' },
                  docNumber: { bsonType: 'string' },
                  fiscalYear: { bsonType: 'int' },
                  syncedAt: { bsonType: 'date' },
                  status: { enum: ['pending', 'posted', 'failed', 'reversed'] },
                  vendor: { bsonType: 'string' },
                  companyCode: { bsonType: 'string' }
                }
              },

              // Metadata
              metadata: { bsonType: 'object' }
            }
          }
        }
      });

      // Create indexes for documents
      await this.db.collection('documents').createIndex({ createdAt: -1 });
      await this.db.collection('documents').createIndex({ uploadedBy: 1 });
      await this.db.collection('documents').createIndex({ documentType: 1 });
      await this.db.collection('documents').createIndex({ status: 1 });
      await this.db.collection('documents').createIndex({ 'storage.azure.blobName': 1 });
      await this.db.collection('documents').createIndex({ 'storage.sharepoint.documentId': 1 });
      await this.db.collection('documents').createIndex({ 'sap.synced': 1 });

      logger.info('✅ Created documents collection');

      // Processing Jobs collection
      await this.db.createCollection('processing_jobs', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['documentId', 'jobType', 'status', 'createdAt'],
            properties: {
              _id: { bsonType: 'objectId' },
              documentId: { bsonType: 'objectId' },
              jobType: { enum: ['analyze', 'extract', 'classify', 'sap_sync', 'email_send', 'batch'] },
              status: { enum: ['pending', 'processing', 'completed', 'failed'] },
              retryCount: { bsonType: 'int', minimum: 0, maximum: 3 },
              createdAt: { bsonType: 'date' },
              startedAt: { bsonType: 'date' },
              completedAt: { bsonType: 'date' },
              result: { bsonType: 'object' },
              error: { bsonType: 'string' },
              metadata: { bsonType: 'object' }
            }
          }
        }
      });

      await this.db.collection('processing_jobs').createIndex({ documentId: 1 });
      await this.db.collection('processing_jobs').createIndex({ status: 1 });
      await this.db.collection('processing_jobs').createIndex({ jobType: 1 });
      await this.db.collection('processing_jobs').createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

      logger.info('✅ Created processing_jobs collection');

      // Audit Log collection
      await this.db.createCollection('audit_logs', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['eventType', 'userId', 'timestamp'],
            properties: {
              _id: { bsonType: 'objectId' },
              eventType: { enum: ['upload', 'analyze', 'extract', 'sap_sync', 'email_send', 'delete', 'access', 'download', 'error'] },
              userId: { bsonType: 'string' },
              userEmail: { bsonType: 'string' },
              resourceId: { bsonType: 'string' },
              resourceType: { bsonType: 'string' },
              action: { bsonType: 'string' },
              status: { enum: ['success', 'failure'] },
              timestamp: { bsonType: 'date' },
              ipAddress: { bsonType: 'string' },
              details: { bsonType: 'object' },
              errorMessage: { bsonType: 'string' }
            }
          }
        }
      });

      await this.db.collection('audit_logs').createIndex({ userId: 1 });
      await this.db.collection('audit_logs').createIndex({ eventType: 1 });
      await this.db.collection('audit_logs').createIndex({ timestamp: -1 });
      await this.db.collection('audit_logs').createIndex({ resourceId: 1 });
      await this.db.collection('audit_logs').createIndex({ timestamp: 1 }, { expireAfterSeconds: 31536000 }); // 365 days TTL

      logger.info('✅ Created audit_logs collection');

      // SAP Transactions collection
      await this.db.createCollection('sap_transactions', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['transactionType', 'documentNumber', 'status'],
            properties: {
              _id: { bsonType: 'objectId' },
              transactionType: { enum: ['PO', 'PR', 'IV', 'GR'] },
              documentNumber: { bsonType: 'string' },
              status: { enum: ['pending', 'posted', 'failed', 'reversed'] },
              vendor: { bsonType: 'string' },
              companyCode: { bsonType: 'string' },
              amount: { bsonType: 'double' },
              currency: { bsonType: 'string' },
              linkedDocumentId: { bsonType: 'objectId' },
              createdAt: { bsonType: 'date' },
              postedAt: { bsonType: 'date' },
              responseData: { bsonType: 'object' },
              errorLog: { bsonType: 'array', items: { bsonType: 'object' } }
            }
          }
        }
      });

      await this.db.collection('sap_transactions').createIndex({ documentNumber: 1 });
      await this.db.collection('sap_transactions').createIndex({ status: 1 });
      await this.db.collection('sap_transactions').createIndex({ linkedDocumentId: 1 });
      await this.db.collection('sap_transactions').createIndex({ createdAt: -1 });

      logger.info('✅ Created sap_transactions collection');

      // Email Queue collection
      await this.db.createCollection('email_queue', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['recipient', 'subject', 'status'],
            properties: {
              _id: { bsonType: 'objectId' },
              recipient: { bsonType: 'string' },
              cc: { bsonType: 'array', items: { bsonType: 'string' } },
              bcc: { bsonType: 'array', items: { bsonType: 'string' } },
              subject: { bsonType: 'string' },
              body: { bsonType: 'string' },
              attachments: { bsonType: 'array', items: { bsonType: 'object' } },
              status: { enum: ['pending', 'sent', 'failed'] },
              provider: { enum: ['smtp', 'gmail', 'outlook'] },
              linkedDocumentId: { bsonType: 'objectId' },
              createdAt: { bsonType: 'date' },
              sentAt: { bsonType: 'date' },
              retryCount: { bsonType: 'int', minimum: 0 },
              messageId: { bsonType: 'string' },
              error: { bsonType: 'string' }
            }
          }
        }
      });

      await this.db.collection('email_queue').createIndex({ status: 1 });
      await this.db.collection('email_queue').createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL
      await this.db.collection('email_queue').createIndex({ linkedDocumentId: 1 });

      logger.info('✅ Created email_queue collection');

      // Users collection
      await this.db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['email', 'role', 'createdAt'],
            properties: {
              _id: { bsonType: 'objectId' },
              email: { bsonType: 'string' },
              username: { bsonType: 'string' },
              password: { bsonType: 'string', description: 'Hashed password' },
              role: { enum: ['admin', 'manager', 'operator', 'viewer', 'sap_manager'] },
              permissions: { bsonType: 'array', items: { bsonType: 'string' } },
              isActive: { bsonType: 'bool' },
              lastLogin: { bsonType: 'date' },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' },
              preferences: { bsonType: 'object' }
            }
          }
        }
      });

      await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
      await this.db.collection('users').createIndex({ role: 1 });

      logger.info('✅ Created users collection');

      // API Keys collection
      await this.db.createCollection('api_keys', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['key', 'userId', 'createdAt'],
            properties: {
              _id: { bsonType: 'objectId' },
              key: { bsonType: 'string' },
              userId: { bsonType: 'string' },
              name: { bsonType: 'string' },
              permissions: { bsonType: 'array', items: { bsonType: 'string' } },
              isActive: { bsonType: 'bool' },
              lastUsed: { bsonType: 'date' },
              createdAt: { bsonType: 'date' },
              expiresAt: { bsonType: 'date' },
              rateLimit: { bsonType: 'int' }
            }
          }
        }
      });

      await this.db.collection('api_keys').createIndex({ key: 1 }, { unique: true });
      await this.db.collection('api_keys').createIndex({ userId: 1 });
      await this.db.collection('api_keys').createIndex({ isActive: 1 });

      logger.info('✅ Created api_keys collection');

      // Sessions collection
      await this.db.createCollection('sessions', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['userId', 'token', 'createdAt'],
            properties: {
              _id: { bsonType: 'objectId' },
              userId: { bsonType: 'string' },
              token: { bsonType: 'string' },
              refreshToken: { bsonType: 'string' },
              ipAddress: { bsonType: 'string' },
              userAgent: { bsonType: 'string' },
              createdAt: { bsonType: 'date' },
              expiresAt: { bsonType: 'date' },
              lastActivity: { bsonType: 'date' }
            }
          }
        }
      });

      await this.db.collection('sessions').createIndex({ userId: 1 });
      await this.db.collection('sessions').createIndex({ token: 1 }, { unique: true });
      await this.db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired sessions

      logger.info('✅ Created sessions collection');

      // Integration Configs collection
      await this.db.createCollection('integration_configs', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['service', 'status'],
            properties: {
              _id: { bsonType: 'objectId' },
              service: { enum: ['azure', 'gmail', 'outlook', 'sharepoint', 'onedrive', 'sap', 'openai', 'llm'] },
              status: { enum: ['active', 'inactive', 'error'] },
              credentials: { bsonType: 'object' },
              lastHealthCheck: { bsonType: 'date' },
              lastError: { bsonType: 'string' },
              errorCount: { bsonType: 'int' },
              updatedAt: { bsonType: 'date' }
            }
          }
        }
      });

      await this.db.collection('integration_configs').createIndex({ service: 1 }, { unique: true });

      logger.info('✅ Created integration_configs collection');

    } catch (error) {
      logger.error(`Error initializing collections: ${error.message}`);
      throw error;
    }
  }

  async createBackupUser() {
    try {
      const usersCollection = this.db.collection('users');
      
      // Create backup read-only user
      await usersCollection.insertOne({
        email: 'backup@system.local',
        username: 'backup',
        password: 'hashed_backup_password_placeholder',
        role: 'viewer',
        permissions: ['read:documents', 'read:audit_logs'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      logger.info('✅ Created backup user');
    } catch (error) {
      logger.error(`Error creating backup user: ${error.message}`);
    }
  }

  async initializeIntegrationConfigs() {
    try {
      const configsCollection = this.db.collection('integration_configs');

      const integrations = [
        { service: 'azure', status: 'inactive' },
        { service: 'gmail', status: 'inactive' },
        { service: 'outlook', status: 'inactive' },
        { service: 'sharepoint', status: 'inactive' },
        { service: 'onedrive', status: 'inactive' },
        { service: 'sap', status: 'inactive' },
        { service: 'openai', status: 'inactive' },
        { service: 'llm', status: 'inactive' }
      ];

      for (const integration of integrations) {
        await configsCollection.updateOne(
          { service: integration.service },
          {
            $set: {
              service: integration.service,
              status: integration.status,
              lastHealthCheck: new Date(),
              errorCount: 0,
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );
      }

      logger.info('✅ Initialized integration configurations');
    } catch (error) {
      logger.error(`Error initializing integration configs: ${error.message}`);
    }
  }

  async run() {
    try {
      await this.connect();
      logger.info('🗑️  Dropping all existing collections...');
      await this.dropAllCollections();
      logger.info('📁 Creating production collections...');
      await this.initializeCollections();
      logger.info('👤 Creating backup user...');
      await this.createBackupUser();
      logger.info('🔧 Initializing integration configurations...');
      await this.initializeIntegrationConfigs();
      logger.info('✅ MongoDB initialization completed successfully');
    } catch (error) {
      logger.error(`❌ MongoDB initialization failed: ${error.message}`);
      throw error;
    } finally {
      if (this.client) {
        await this.client.close();
      }
    }
  }
}

// Run if executed directly
if (require.main === module) {
  require('dotenv').config();
  const config = process.env;
  const initializer = new MongoDBInitializer(config);
  initializer.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = MongoDBInitializer;