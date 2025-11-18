/**
 * Authentication & Authorization Module
 * Handles JWT tokens, API keys, and session management
 */

const crypto = require('crypto');
const { UnauthorizedError, ForbiddenError } = require('./error-handler');

/**
 * JWT Token Manager
 */
class TokenManager {
  static generate(userId, expiresIn = process.env.JWT_EXPIRATION || '24h') {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const expirySeconds = TokenManager.parseExpiry(expiresIn);

    const payload = {
      sub: userId,
      iat: now,
      exp: now + expirySeconds,
      type: 'access_token'
    };

    const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const hmac = crypto
      .createHmac('sha256', process.env.JWT_SECRET)
      .update(`${header}.${payloadEncoded}`)
      .digest('base64url');

    return `${header}.${payloadEncoded}.${hmac}`;
  }

  static verify(token) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedError('Invalid token format');
    }

    const [header, payloadEncoded, signature] = parts;

    // Verify signature
    const hmac = crypto
      .createHmac('sha256', process.env.JWT_SECRET)
      .update(`${header}.${payloadEncoded}`)
      .digest('base64url');

    if (hmac !== signature) {
      throw new UnauthorizedError('Invalid token signature');
    }

    // Parse and validate payload
    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString());

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedError('Token expired');
    }

    return payload;
  }

  static parseExpiry(expiresIn) {
    if (typeof expiresIn === 'number') return expiresIn;

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error('Invalid expiry format');

    const [, value, unit] = match;
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return parseInt(value) * multipliers[unit];
  }

  static refresh(token) {
    const payload = TokenManager.verify(token);
    return TokenManager.generate(payload.sub);
  }
}

/**
 * API Key Manager
 */
class ApiKeyManager {
  static generate() {
    return crypto.randomBytes(32).toString('hex');
  }

  static validate(apiKey) {
    if (!apiKey) {
      throw new UnauthorizedError('API key required');
    }

    const expectedKey = process.env.API_KEY;
    if (!expectedKey) {
      throw new Error('API_KEY not configured');
    }

    if (apiKey !== expectedKey) {
      throw new UnauthorizedError('Invalid API key');
    }

    return true;
  }

  static hash(apiKey) {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }
}

/**
 * Session Manager
 */
class SessionManager {
  constructor(db) {
    this.db = db;
  }

  async create(userId, ipAddress, userAgent) {
    const sessionId = crypto.randomUUID();
    const token = TokenManager.generate(userId);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.db.collection('sessions').insertOne({
      sessionId,
      userId,
      token,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      expiresAt,
      lastActivity: new Date()
    });

    return { sessionId, token, expiresAt };
  }

  async verify(sessionId) {
    const session = await this.db.collection('sessions').findOne({ sessionId });

    if (!session) {
      throw new UnauthorizedError('Session not found');
    }

    if (session.expiresAt < new Date()) {
      await this.db.collection('sessions').deleteOne({ sessionId });
      throw new UnauthorizedError('Session expired');
    }

    return session;
  }

  async updateActivity(sessionId) {
    await this.db.collection('sessions').updateOne(
      { sessionId },
      { $set: { lastActivity: new Date() } }
    );
  }

  async revoke(sessionId) {
    await this.db.collection('sessions').deleteOne({ sessionId });
  }

  async revokeAllUserSessions(userId) {
    await this.db.collection('sessions').deleteMany({ userId });
  }

  async cleanup() {
    // Delete expired sessions
    await this.db.collection('sessions').deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }
}

/**
 * Permission Manager
 */
class PermissionManager {
  static hasPermission(user, requiredPermission) {
    if (!user) return false;

    // Admin has all permissions
    if (user.role === 'admin') return true;

    // Check specific permissions
    const userPermissions = user.permissions || [];
    return userPermissions.includes(requiredPermission);
  }

  static canAccessDocument(user, document) {
    if (!user) return false;

    // Admin can access all
    if (user.role === 'admin') return true;

    // Owner can access their documents
    if (document.ownerId === user.id) return true;

    // Check shared access
    if (document.sharedWith && document.sharedWith.includes(user.id)) return true;

    return false;
  }

  static canModifyDocument(user, document) {
    if (!user) return false;

    // Admin can modify all
    if (user.role === 'admin') return true;

    // Owner can modify
    if (document.ownerId === user.id) return true;

    // Check explicit modify permission
    if (document.sharedWith) {
      const shared = document.sharedWith.find(s => s.userId === user.id);
      return shared && shared.permissions && shared.permissions.includes('write');
    }

    return false;
  }
}

/**
 * Express middleware for JWT authentication
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = authHeader.substring(7);

  try {
    const payload = TokenManager.verify(token);
    req.user = payload;
    req.userId = payload.sub;
    next();
  } catch (error) {
    next(new UnauthorizedError(error.message));
  }
}

/**
 * Express middleware for API key authentication
 */
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  try {
    ApiKeyManager.validate(apiKey);
    req.authenticated = true;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Express middleware for combined authentication
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  if (authHeader) {
    authenticateJWT(req, res, next);
  } else if (apiKey) {
    authenticateApiKey(req, res, next);
  } else {
    next(new UnauthorizedError('Authentication required'));
  }
}

/**
 * Express middleware for permission checking
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!PermissionManager.hasPermission(req.user, permission)) {
      return next(new ForbiddenError(`Permission required: ${permission}`));
    }

    next();
  };
}

/**
 * Express middleware for role checking
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (req.user.role !== role) {
      return next(new ForbiddenError(`Role required: ${role}`));
    }

    next();
  };
}

/**
 * Rate limiting
 */
class RateLimiter {
  constructor(redis) {
    this.redis = redis;
    this.limit = parseInt(process.env.API_RATE_LIMIT || 1000);
    this.window = parseInt(process.env.API_RATE_WINDOW || 3600);
  }

  async check(identifier) {
    const key = `rate-limit:${identifier}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, this.window);
    }

    if (current > this.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: await this.redis.ttl(key)
      };
    }

    return {
      allowed: true,
      remaining: this.limit - current,
      resetIn: await this.redis.ttl(key)
    };
  }

  middleware() {
    return async (req, res, next) => {
      const identifier = req.user?.id || req.ip;
      const result = await this.check(identifier);

      res.set('X-RateLimit-Limit', this.limit);
      res.set('X-RateLimit-Remaining', result.remaining);
      res.set('X-RateLimit-Reset', result.resetIn);

      if (!result.allowed) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: result.resetIn
        });
      } else {
        next();
      }
    };
  }
}

module.exports = {
  TokenManager,
  ApiKeyManager,
  SessionManager,
  PermissionManager,
  RateLimiter,
  authenticateJWT,
  authenticateApiKey,
  authenticate,
  requirePermission,
  requireRole
};