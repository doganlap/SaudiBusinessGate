/**
 * Organizations API Route - Complete CRUD
 * POST /api/organizations - Create organization
 * GET /api/organizations - List organizations
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET - List organizations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        id, name, slug, description, logo_url, website, 
        industry, size, license_tier, owner_id, 
        created_at, updated_at
      FROM organizations
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM organizations');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      organizations: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

// POST - Create organization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      logo_url,
      website,
      industry,
      size,
      owner_id,
      license_tier = 'basic',
    } = body;

    // Validation
    if (!name || !slug || !owner_id) {
      return NextResponse.json(
        { error: 'Name, slug, and owner_id are required' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const duplicateCheck = await pool.query(
      'SELECT id FROM organizations WHERE slug = $1',
      [slug]
    );

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Organization slug already exists' },
        { status: 409 }
      );
    }

    // Verify owner exists
    const ownerCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [owner_id]
    );

    if (ownerCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Owner user not found' },
        { status: 400 }
      );
    }

    // Insert organization
    const result = await pool.query(
      `INSERT INTO organizations (
        name, slug, description, logo_url, website, 
        industry, size, license_tier, owner_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [name, slug, description, logo_url, website, industry, size, license_tier, owner_id]
    );

    // Add owner as member
    await pool.query(
      `INSERT INTO organization_members (organization_id, user_id, role)
      VALUES ($1, $2, 'owner')`,
      [result.rows[0].id, owner_id]
    );

    return NextResponse.json(
      {
        message: 'Organization created successfully',
        organization: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
