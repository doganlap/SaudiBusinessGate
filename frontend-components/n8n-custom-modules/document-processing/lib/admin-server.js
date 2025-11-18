const express = require('express');
const auth = require('./admin-auth');
const credentials = require('./user-credentials');

/**
 * Setup admin routes
 */
function setupAdminRoutes(app, db) {
  const router = express.Router();

  // ========== Authentication Routes ==========

  // Register
  router.post('/auth/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const userId = await auth.registerUser(db, { email, password, name });
      res.json({ success: true, userId });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Login
  router.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await auth.loginUser(db, email, password);
      res.json(result);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  });

  // Get profile
  router.get('/auth/profile', auth.requireAuth, async (req, res) => {
    try {
      const profile = await auth.getUserProfile(db, req.user.id);
      res.json(profile);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update profile
  router.put('/auth/profile', auth.requireAuth, async (req, res) => {
    try {
      const updated = await auth.updateUserProfile(db, req.user.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Change password
  router.post('/auth/change-password', auth.requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await auth.changePassword(db, req.user.id, currentPassword, newPassword);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // ========== Credentials Routes ==========

  // Get all credentials for user
  router.get('/credentials', auth.requireAuth, async (req, res) => {
    try {
      const creds = await credentials.getAllCredentials(db, req.user.id);
      res.json(creds);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get credential for specific service
  router.get('/credentials/:service', auth.requireAuth, async (req, res) => {
    try {
      const cred = await credentials.getCredentials(db, req.user.id, req.params.service);
      if (!cred) {
        return res.status(404).json({ error: 'Credentials not found' });
      }
      res.json(cred);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Save credentials
  router.post('/credentials/:service', auth.requireAuth, async (req, res) => {
    try {
      const result = await credentials.saveCredentials(db, req.user.id, req.params.service, req.body);
      res.json({ success: true, id: result._id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Test credentials
  router.post('/credentials/:service/test', auth.requireAuth, async (req, res) => {
    try {
      const result = await credentials.testCredentials(db, req.user.id, req.params.service);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete credentials
  router.delete('/credentials/:service', auth.requireAuth, async (req, res) => {
    try {
      const result = await credentials.deleteCredentials(db, req.user.id, req.params.service);
      if (!result) {
        return res.status(404).json({ error: 'Credentials not found' });
      }
      res.json({ success: true, message: 'Credentials deleted' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // ========== Services Routes ==========

  // Get available services
  router.get('/services', auth.requireAuth, (req, res) => {
    const services = Object.entries(credentials.SERVICES).map(([key, value]) => ({
      id: key,
      name: value.name,
      icon: value.icon,
      fields: value.fields
    }));
    res.json(services);
  });

  // Health check
  router.get('/health', async (req, res) => {
    try {
      await db.admin().ping();
      res.json({ status: 'ok', message: 'Database connected' });
    } catch (err) {
      res.status(503).json({ status: 'error', message: err.message });
    }
  });

  app.use('/admin', router);
}

/**
 * Initialize admin database collections
 */
async function initializeAdminCollections(db) {
  // Users collection
  if (!(await db.listCollections({ name: 'users' }).toArray()).length) {
    await db.createCollection('users');
  }
  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  // User credentials collection
  if (!(await db.listCollections({ name: 'user_credentials' }).toArray()).length) {
    await db.createCollection('user_credentials');
  }
  await db
    .collection('user_credentials')
    .createIndex({ userId: 1, service: 1 }, { unique: true });

  // Audit log collection
  if (!(await db.listCollections({ name: 'admin_audit_log' }).toArray()).length) {
    await db.createCollection('admin_audit_log');
  }
  await db
    .collection('admin_audit_log')
    .createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
}

/**
 * Create test admin user (for development)
 */
async function createTestUser(db) {
  try {
    const existing = await db.collection('users').findOne({ email: 'test@example.com' });
    if (existing) {
      return;
    }

    await auth.registerUser(db, {
      email: 'test@example.com',
      password: 'test123456',
      name: 'Test User'
    });

    console.log('✓ Test user created: test@example.com / test123456');
  } catch (err) {
    console.log('Test user already exists or error:', err.message);
  }
}

module.exports = {
  setupAdminRoutes,
  initializeAdminCollections,
  createTestUser
};