/**
 * Single Organization API Route
 * GET /api/organizations/:id - Get organization
 * PUT /api/organizations/:id - Update organization
 * DELETE /api/organizations/:id - Delete organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET - Get organization by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      `SELECT * FROM organizations WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get members
    const membersResult = await pool.query(
      `SELECT u.id, u.email, u.username, u.first_name, u.last_name, om.role, om.joined_at
       FROM organization_members om
       JOIN users u ON om.user_id = u.id
       WHERE om.organization_id = $1`,
      [id]
    );

    return NextResponse.json({
      organization: {
        ...result.rows[0],
        members: membersResult.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

// PUT - Update organization
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, logo_url, website, industry, size } = body;

    // Check if organization exists
    const orgCheck = await pool.query(
      'SELECT id FROM organizations WHERE id = $1',
      [id]
    );

    if (orgCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (logo_url !== undefined) {
      updates.push(`logo_url = $${paramCount++}`);
      values.push(logo_url);
    }
    if (website !== undefined) {
      updates.push(`website = $${paramCount++}`);
      values.push(website);
    }
    if (industry !== undefined) {
      updates.push(`industry = $${paramCount++}`);
      values.push(industry);
    }
    if (size !== undefined) {
      updates.push(`size = $${paramCount++}`);
      values.push(size);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE organizations 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return NextResponse.json({
      message: 'Organization updated successfully',
      organization: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

// DELETE - Delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if organization exists
    const orgCheck = await pool.query(
      'SELECT id FROM organizations WHERE id = $1',
      [id]
    );

    if (orgCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Delete organization (cascade will delete members)
    await pool.query('DELETE FROM organizations WHERE id = $1', [id]);

    return NextResponse.json({
      message: 'Organization deleted successfully',
      id: id,
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
