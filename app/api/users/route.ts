/**
 * Users API Route - Complete CRUD Implementation
 * POST /api/users - Create user
 * GET /api/users - List users
 * GET /api/users/:id - Get user
 * PUT /api/users/:id - Update user
 * PATCH /api/users/:id - Partial update
 * DELETE /api/users/:id - Delete user
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Validation helpers
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): boolean {
  return password.length >= 8;
}

// GET - List users or get single user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id, email, username, first_name, last_name, phone, 
        avatar_url, role, status, email_verified, license_tier, 
        created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (
        email ILIKE $${params.length} OR 
        username ILIKE $${params.length} OR 
        first_name ILIKE $${params.length} OR 
        last_name ILIKE $${params.length}
      )`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = search
      ? `SELECT COUNT(*) FROM users WHERE email ILIKE $1 OR username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1`
      : `SELECT COUNT(*) FROM users`;
    const countResult = await pool.query(countQuery, search ? [`%${search}%`] : []);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      username,
      password,
      first_name,
      last_name,
      phone,
      role = 'user',
    } = body;

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required', errors: [] },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', errors: ['email'] },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters', errors: ['password'] },
        { status: 400 }
      );
    }

    // Check for duplicates
    const duplicateCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (
        email, username, password_hash, first_name, last_name, phone, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, username, first_name, last_name, phone, role, status, created_at`,
      [email, username, password_hash, first_name, last_name, phone, role]
    );

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
