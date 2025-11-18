type UserRecord = {
  id: string
  email: string
  username: string
  first_name?: string
  last_name?: string
  phone?: string
  role?: string
  status?: string
  created_at?: string
  updated_at?: string
}

const store: { users: Map<string, UserRecord> } = {
  users: new Map(),
}

export function getUsersStore() {
  return store
}

export function upsertUser(u: UserRecord) {
  const now = new Date().toISOString()
  const existing = store.users.get(u.id)
  const record = {
    ...existing,
    ...u,
    created_at: existing?.created_at || now,
    updated_at: now,
    status: existing?.status || 'active',
  }
  store.users.set(record.id, record)
  return record
}

export function deleteUser(id: string) {
  return store.users.delete(id)
}

export function ensureSeed() {
  if (store.users.size === 0) {
  upsertUser({
    id: 'user123',
    email: 'user123@example.com',
    username: 'user123',
    first_name: 'Name',
    last_name: 'Original',
    phone: '0500000001',
    role: 'user',
  })
    upsertUser({
      id: 'user456',
      email: 'search@example.com',
      username: 'search_user',
      first_name: 'Search',
      last_name: 'Target',
      phone: '0500000002',
      role: 'user',
    })
  }
}