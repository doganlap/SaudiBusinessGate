const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const adminAuth = require('./lib/admin-auth');
const adminServer = require('./lib/admin-server');

const app = express();
const PORT = process.env.ADMIN_PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-panel';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db;

// Initialize MongoDB and setup admin routes
async function initialize() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();

    console.log('✓ MongoDB connected');

    // Initialize collections
    await adminServer.initializeAdminCollections(db);
    console.log('✓ Collections initialized');

    // Create test user for development
    await adminServer.createTestUser(db);

    // Setup admin routes
    adminServer.setupAdminRoutes(app, db);

    // Serve admin UI
    app.get('/admin', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    });

    // Serve document processor UI
    app.get('/document-processor', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'document-processor.html'));
    });

    // Health check
    app.get('/health', async (req, res) => {
      try {
        await db.admin().ping();
        res.json({ status: 'ok', message: 'Admin panel is running' });
      } catch (err) {
        res.status(503).json({ status: 'error', message: err.message });
      }
    });

    // Start server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('✓ Admin Panel & Document Processor Running');
      console.log('='.repeat(60));
      console.log('\n📋 Admin Panel (Manage Credentials):');
      console.log(`   🌐 http://localhost:${PORT}/admin`);
      console.log('\n📄 Document Processor (Upload & Process):');
      console.log(`   🌐 http://localhost:${PORT}/document-processor`);
      console.log('\n🔐 Test Credentials:');
      console.log('   Email: test@example.com');
      console.log('   Password: test123456');
      console.log('='.repeat(60) + '\n');
    });
  } catch (err) {
    console.error('❌ Failed to initialize:', err.message);
    process.exit(1);
  }
}

initialize();