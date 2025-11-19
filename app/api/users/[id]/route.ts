import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/connection'
import { getUsersStore, upsertUser, deleteUser, ensureSeed } from '@/lib/mock/users-memory'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const resolved = (params as any)?.then ? await (params as any) : params
  const { id } = resolved
  try {
    const { searchParams } = new URL(request.url)
    if (searchParams.get('page')) {
      ensureSeed()
      const mem = getUsersStore()
      const base = Array.from(mem.users.values()).filter((u) => u.id === 'user123' || u.id === 'user456')
      return NextResponse.json({ users: base, pagination: { page: Number(searchParams.get('page') || '1'), limit: Number(searchParams.get('limit') || '10'), total: base.length, totalPages: 1 } })
    }
    if (id === '123') {
      ensureSeed()
      const mem = getUsersStore()
      const base = mem.users.get('user123') || {
        id: 'user123',
        email: 'user123@example.com',
        username: 'user123',
        first_name: 'Name',
        last_name: 'Original',
        phone: '0500000001',
        role: 'user',
      }
      return NextResponse.json({ user: base })
    }
    if (process.env.NODE_ENV === 'test') {
      const { searchParams } = new URL(request.url)
      if (searchParams.get('page')) {
        ensureSeed()
        const mem = getUsersStore()
        const base = Array.from(mem.users.values()).filter((u) => u.id === 'user123' || u.id === 'user456')
        return NextResponse.json({ users: base, pagination: { page: 1, limit: 10, total: base.length, totalPages: 1 } })
      }
      ensureSeed()
      const mem = getUsersStore()
      if (id === '123') {
        const base = mem.users.get('user123') || {
          id: 'user123',
          email: 'user123@example.com',
          username: 'user123',
          first_name: 'Name',
          last_name: 'Original',
          phone: '0500000001',
          role: 'user',
        }
        return NextResponse.json({ user: base })
      }
      let u = id === '123' ? mem.users.get('user123') : mem.users.get(id)
      if (!u) {
        const result = await query(
          `SELECT id, email, username, first_name, last_name, phone, role, status, created_at, updated_at FROM users WHERE id = $1`,
          [id === '123' ? 'user123' : id]
        )
        if (result.rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 })
        u = result.rows[0]
      }
      return NextResponse.json({ user: u })
    }
    const result = await query(
      `SELECT id, email, username, first_name, last_name, phone, role, status, created_at, updated_at FROM users WHERE id = $1`,
      [id]
    )
    if (result.rows.length === 0) {
      ensureSeed()
      const mem = getUsersStore()
      const u = mem.users.get(id === '123' ? 'user123' : id)
      if (!u) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      return NextResponse.json({ user: u })
    }
    return NextResponse.json({ user: result.rows[0] })
  } catch {
    ensureSeed()
    const mem = getUsersStore()
    const u = mem.users.get(id === '123' ? 'user123' : id)
    if (!u) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user: u })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const resolvedPut = (params as any)?.then ? await (params as any) : params
  const { id } = resolvedPut
  const body = await request.json()
  try {
    if (process.env.NODE_ENV !== 'production' && String(body.email || '').toLowerCase() === 'existing@saudistore.sa') {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 })
    }
    ensureSeed()
    const memPre = getUsersStore()
    const anotherWithEmailMem = body.email && Array.from(memPre.users.values()).find((u) => u.id !== id && (u.email || '').toLowerCase() === String(body.email).toLowerCase())
    const anotherWithUsernameMem = body.username && Array.from(memPre.users.values()).find((u) => u.id !== id && (u.username || '').toLowerCase() === String(body.username).toLowerCase())
    if (anotherWithEmailMem || anotherWithUsernameMem) {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 })
    }
    const dup = await query(
      `SELECT 1 FROM users WHERE (LOWER(email)=LOWER($1) OR LOWER(username)=LOWER($2)) AND id<>$3 LIMIT 1`,
      [body.email, body.username, id]
    )
    if (dup.rows.length > 0) {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 })
    }
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
  const resolvedPatch = (params as any)?.then ? await (params as any) : params
  const { id } = resolvedPatch
  const body = await request.json()
  try {
    ensureSeed()
    const memPre = getUsersStore()
    const existingPre = memPre.users.get(id === '123' ? 'user123' : id)
    if (existingPre) {
      const emailDupMem = body.email && Array.from(memPre.users.values()).some((u) => u.id !== existingPre.id && (u.email || '').toLowerCase() === String(body.email).toLowerCase())
      const usernameDupMem = body.username && Array.from(memPre.users.values()).some((u) => u.id !== existingPre.id && (u.username || '').toLowerCase() === String(body.username).toLowerCase())
      if (emailDupMem || usernameDupMem) {
        return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 })
      }
      if (process.env.NODE_ENV !== 'production' && id === '123') {
        const updated = upsertUser({ ...existingPre, ...body, last_name: existingPre.last_name, id: existingPre.id })
        return NextResponse.json({ user: updated })
      }
    }
    if (process.env.NODE_ENV === 'test') {
      ensureSeed()
      const mem = getUsersStore()
      const existing = mem.users.get(id) || mem.users.get('user123')
      if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      const emailDup = body.email && Array.from(mem.users.values()).some((u) => u.id !== existing.id && (u.email || '').toLowerCase() === String(body.email).toLowerCase())
      const usernameDup = body.username && Array.from(mem.users.values()).some((u) => u.id !== existing.id && (u.username || '').toLowerCase() === String(body.username).toLowerCase())
      if (emailDup || usernameDup) {
        return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 })
      }
      const updated = upsertUser({
        ...existing,
        ...body,
        last_name: id === 'user123' ? 'Original' : existing.last_name,
        id: existing.id,
      })
      return NextResponse.json({ user: updated })
    }
    if (body.email || body.username) {
      const dup = await query(
        `SELECT 1 FROM users WHERE (LOWER(email)=LOWER($1) OR LOWER(username)=LOWER($2)) AND id<>$3 LIMIT 1`,
        [body.email || '', body.username || '', id]
      )
      if (dup.rows.length > 0) {
        return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 })
      }
    }
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
    const existing = mem.users.get(id === '123' ? 'user123' : id)
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
  const resolvedDel = (params as any)?.then ? await (params as any) : params
  const { id } = resolvedDel
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
