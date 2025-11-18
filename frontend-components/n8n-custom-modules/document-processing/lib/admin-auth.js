const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'admin-panel-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

/**
 * Hash password using bcrypt
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Compare password with hashed password
 */
async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Register new user
 */
async function registerUser(db, userData) {
  const { email, password, name } = userData;

  // Validate inputs
  if (!email || !password || !name) {
    throw new Error('Email, password, and name are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  // Check if user exists
  const existingUser = await db.collection('users').findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const result = await db.collection('users').insertOne({
    email,
    password: hashedPassword,
    name,
    company: '',
    phone: '',
    department: '',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return result.insertedId;
}

/**
 * Login user
 */
async function loginUser(db, email, password) {
  const user = await db.collection('users').findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const passwordMatch = await comparePassword(password, user.password);
  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user);
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      company: user.company,
      phone: user.phone,
      department: user.department,
      avatar: user.avatar
    }
  };
}

/**
 * Get user profile
 */
async function getUserProfile(db, userId) {
  const ObjectId = require('mongodb').ObjectId;
  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    company: user.company,
    phone: user.phone,
    department: user.department,
    avatar: user.avatar,
    createdAt: user.createdAt
  };
}

/**
 * Update user profile
 */
async function updateUserProfile(db, userId, updates) {
  const ObjectId = require('mongodb').ObjectId;
  const allowedFields = ['name', 'company', 'phone', 'department'];
  const updateData = {};

  for (const field of allowedFields) {
    if (field in updates) {
      updateData[field] = updates[field];
    }
  }

  updateData.updatedAt = new Date();

  const result = await db.collection('users').findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result.value) {
    throw new Error('User not found');
  }

  return {
    id: result.value._id.toString(),
    email: result.value.email,
    name: result.value.name,
    company: result.value.company,
    phone: result.value.phone,
    department: result.value.department,
    avatar: result.value.avatar
  };
}

/**
 * Change password
 */
async function changePassword(db, userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw new Error('Current password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters');
  }

  const ObjectId = require('mongodb').ObjectId;
  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
  if (!user) {
    throw new Error('User not found');
  }

  const passwordMatch = await comparePassword(currentPassword, user.password);
  if (!passwordMatch) {
    throw new Error('Current password is incorrect');
  }

  const hashedPassword = await hashPassword(newPassword);

  await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    { $set: { password: hashedPassword, updatedAt: new Date() } }
  );

  return true;
}

/**
 * Middleware to require authentication
 */
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  requireAuth
};