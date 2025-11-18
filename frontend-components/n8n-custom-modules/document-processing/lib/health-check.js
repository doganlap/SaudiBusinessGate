/**
 * Health Check & Monitoring Module
 * Monitors system health, database connectivity, and service status
 */

const { MongoClient } = require('mongodb');

/**
 * Health Check Service
 */
class HealthCheckService {
  constructor(config = {}) {
    this.config = config;
    this.mongoClient = null;
    this.redisClient = null;
    this.lastCheck = null;
    this.checks = {};
  }

  /**
   * Perform full health check
   */
  async performHealthCheck() {
    const startTime = Date.now();
    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {}
    };

    // Database health
    results.checks.database = await this.checkDatabase();

    // Redis health
    results.checks.redis = await this.checkRedis();

    // Memory health
    results.checks.memory = this.checkMemory();

    // CPU health
    results.checks.cpu = this.checkCpu();

    // Disk space
    results.checks.disk = await this.checkDiskSpace();

    // Service dependencies
    results.checks.n8n = await this.checkN8nConnection();

    // Calculate overall status
    const allHealthy = Object.values(results.checks).every(check => check.status === 'healthy');
    const anyWarnings = Object.values(results.checks).some(check => check.status === 'warning');

    results.status = allHealthy ? 'healthy' : anyWarnings ? 'warning' : 'unhealthy';
    results.checkDuration = Date.now() - startTime;
    results.allServices = Object.keys(results.checks).length;
    results.healthyServices = Object.values(results.checks).filter(c => c.status === 'healthy').length;

    this.lastCheck = results;
    return results;
  }

  /**
   * Check MongoDB connection
   */
  async checkDatabase() {
    const startTime = Date.now();
    try {
      const client = new MongoClient(this.buildMongoUrl(), {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });

      await client.connect();
      const adminDb = client.db('admin');
      await adminDb.command({ ping: 1 });
      
      const collections = await client.db('document_processing')
        .listCollections()
        .toArray();

      await client.close();

      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        message: `Connected, ${collections.length} collections found`,
        collections: collections.length
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: `Connection failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Check Redis connection
   */
  async checkRedis() {
    const startTime = Date.now();
    try {
      const redis = require('redis');
      const client = redis.createClient({
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        connectTimeout: 5000,
        socket: { reconnectStrategy: () => null }
      });

      client.on('error', () => {});
      
      await client.connect();
      await client.ping();
      
      const info = await client.info();
      const memoryUsage = info.split('\r\n').find(line => line.startsWith('used_memory:'));
      
      await client.quit();

      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        message: 'Connected and responding',
        memory: memoryUsage ? memoryUsage.split(':')[1] : 'unknown'
      };
    } catch (error) {
      return {
        status: 'warning',
        responseTime: Date.now() - startTime,
        message: `Connection unavailable: ${error.message}`
      };
    }
  }

  /**
   * Check memory usage
   */
  checkMemory() {
    const used = process.memoryUsage();
    const heapUsedPercent = (used.heapUsed / used.heapTotal) * 100;
    const maxAllowed = 80;

    return {
      status: heapUsedPercent > maxAllowed ? 'warning' : 'healthy',
      heapUsed: Math.round(used.heapUsed / 1024 / 1024),
      heapTotal: Math.round(used.heapTotal / 1024 / 1024),
      heapUsedPercent: Math.round(heapUsedPercent),
      external: Math.round(used.external / 1024 / 1024),
      rss: Math.round(used.rss / 1024 / 1024)
    };
  }

  /**
   * Check CPU usage
   */
  checkCpu() {
    const cpus = require('os').cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce((acc, cpu) => {
      return acc + Object.values(cpu.times).reduce((a, b) => a + b);
    }, 0);

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~(100 * idle / total);

    return {
      status: usage > 80 ? 'warning' : 'healthy',
      usage: usage,
      cores: cpus.length
    };
  }

  /**
   * Check disk space
   */
  async checkDiskSpace() {
    try {
      const { execSync } = require('child_process');
      const os = require('os');

      if (os.platform() === 'win32') {
        return {
          status: 'healthy',
          message: 'Disk check not available on Windows'
        };
      }

      const output = execSync('df -h /').toString();
      const lines = output.split('\n');
      const data = lines[1].split(/\s+/);
      
      const usedPercent = parseInt(data[4]);
      const status = usedPercent > 80 ? 'warning' : 'healthy';

      return {
        status,
        used: data[2],
        available: data[3],
        usedPercent,
        mounted: data[5]
      };
    } catch (error) {
      return {
        status: 'warning',
        message: `Disk check failed: ${error.message}`
      };
    }
  }

  /**
   * Check N8N connection
   */
  async checkN8nConnection() {
    const startTime = Date.now();
    try {
      const host = process.env.N8N_HOST || 'localhost';
      const port = process.env.N8N_PORT || 5678;
      const url = `http://${host}:${port}/healthz`;

      const response = await Promise.race([
        fetch(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);

      if (response.ok) {
        return {
          status: 'healthy',
          responseTime: Date.now() - startTime,
          message: 'N8N is running'
        };
      } else {
        return {
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          message: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'warning',
        responseTime: Date.now() - startTime,
        message: `Connection failed: ${error.message}`
      };
    }
  }

  /**
   * Get quick status (cached)
   */
  getStatus() {
    if (!this.lastCheck) {
      return {
        status: 'unknown',
        message: 'No health check performed yet'
      };
    }

    return {
      status: this.lastCheck.status,
      timestamp: this.lastCheck.timestamp,
      checks: Object.entries(this.lastCheck.checks).map(([name, data]) => ({
        name,
        status: data.status,
        responseTime: data.responseTime
      }))
    };
  }

  /**
   * Start periodic health checks
   */
  startPeriodicChecks(intervalMs = parseInt(process.env.HEALTH_CHECK_INTERVAL || 30000)) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.performHealthCheck().catch(error => {
        console.error('Periodic health check failed:', error);
      });
    }, intervalMs);

    console.log(`Health check started with ${intervalMs}ms interval`);
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Build MongoDB connection URL
   */
  buildMongoUrl() {
    const host = process.env.DB_MONGODB_HOST || 'mongodb';
    const port = process.env.DB_MONGODB_PORT || 27017;
    const username = process.env.DB_MONGODB_USERNAME || 'admin';
    const password = process.env.DB_MONGODB_PASSWORD || '';
    const authSource = process.env.DB_MONGODB_AUTH_SOURCE || 'admin';

    if (username && password) {
      return `mongodb://${username}:${password}@${host}:${port}/?authSource=${authSource}`;
    }
    return `mongodb://${host}:${port}`;
  }
}

/**
 * Health check endpoint middleware
 */
function healthCheckEndpoint(healthCheck) {
  return async (req, res) => {
    try {
      const fullCheck = await healthCheck.performHealthCheck();
      const statusCode = fullCheck.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(fullCheck);
    } catch (error) {
      res.status(503).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Liveness probe (is app running)
 */
function livenessProbe(req, res) {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}

/**
 * Readiness probe (is app ready to handle requests)
 */
function readinessProbe(healthCheck) {
  return async (req, res) => {
    const status = healthCheck.getStatus();
    const healthy = status.status === 'healthy' || status.status === 'warning';
    const statusCode = healthy ? 200 : 503;

    res.status(statusCode).json({
      ready: healthy,
      status: status.status,
      timestamp: new Date().toISOString()
    });
  };
}

module.exports = {
  HealthCheckService,
  healthCheckEndpoint,
  livenessProbe,
  readinessProbe
};