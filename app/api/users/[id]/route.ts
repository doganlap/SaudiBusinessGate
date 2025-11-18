import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/connection'
import { getUsersStore, upsertUser, deleteUser, ensureSeed } from '@/lib/mock/users-memory'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const result = await query(
      `SELECT id, email, username, first_name, last_name, phone, role, status, created_at, updated_at FROM users WHERE id = $1`,
      [id]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ user: result.rows[0] })
  } catch {
    ensureSeed()
    const mem = getUsersStore()
    const u = mem.users.get(id)
    if (!u) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user: u })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const body = await request.json()
  try {
    const result = await query(
      `UPDATE users SET email=$1, username=$2, first_name=$3, last_name=$4, phone=$5, updated_at=NOW() WHERE id=$6 RETURNING id, email, username, first_name, last_name, phone, role, status, created_at, updated_at`,
      [body.email, body.username, body.first_name, body.last_name, body.phone, id]
    )
    return NextResponse.json({ user: result.rows[0] })
  } catch {
    ensureSeed()
    const mem = getUsersStore()
    const anotherWithEmail = body.email && Array.from(mem.users.values()).find((u) => u.id !== id && u.email === body.email)
    const anotherWithUsername = body.username && Array.from(mem.users.values()).find((u) => u.id !== id && u.username === body.username)
    if (anotherWithEmail || anotherWithUsername) {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 })
    }
    const updated = upsertUser({ id, ...body })
    return NextResponse.json({ user: updated })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const body = await request.json()
  try {
    const fields: string[] = []
    const values: any[] = []
    let idx = 1
    for (const [k, v] of Object.entries(body)) {
      fields.push(`${k}=$${idx++}`)
      values.push(v)
    }
    values.push(id)
    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${idx} RETURNING id, email, username, first_name, last_name, phone, role, status, created_at, updated_at`,
      values
    )
    return NextResponse.json({ user: result.rows[0] })
  } catch {
    const mem = getUsersStore()
    const existing = mem.users.get(id)
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const anotherWithEmail = body.email && Array.from(mem.users.values()).find((u) => u.id !== id && u.email === body.email)
    const anotherWithUsername = body.username && Array.from(mem.users.values()).find((u) => u.id !== id && u.username === body.username)
    if (anotherWithEmail || anotherWithUsername) {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 })
    }
    const updated = upsertUser({ ...existing, ...body, id })
    return NextResponse.json({ user: updated })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const result = await query(`DELETE FROM users WHERE id=$1 RETURNING id`, [id])
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch {
    ensureSeed()
    const ok = deleteUser(id)
    if (!ok) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ message: 'User deleted successfully' })
  }
}
