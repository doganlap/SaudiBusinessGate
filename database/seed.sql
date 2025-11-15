-- Seed data for DoganHub Store

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, username, password_hash, first_name, last_name, role, license_tier, email_verified)
VALUES 
    (uuid_generate_v4(), 'admin@doganhubstore.com', 'admin', '$2b$10$rBV2jHvnQf7gvYqZ.Nq5XeDjgG9YX8aMKvP7WBNz5z7YaJNxQrQZm', 'Admin', 'User', 'admin', 'platform', TRUE),
    (uuid_generate_v4(), 'demo@doganhubstore.com', 'demo', '$2b$10$rBV2jHvnQf7gvYqZ.Nq5XeDjgG9YX8aMKvP7WBNz5z7YaJNxQrQZm', 'Demo', 'User', 'user', 'professional', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert sample organization
INSERT INTO organizations (id, name, slug, description, industry, size, license_tier, owner_id)
SELECT 
    uuid_generate_v4(), 
    'DoganHub Demo Organization', 
    'doganhub-demo', 
    'Demo organization for testing', 
    'Technology', 
    '10-50', 
    'enterprise',
    u.id
FROM users u
WHERE u.email = 'admin@doganhubstore.com'
ON CONFLICT (slug) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, link)
SELECT 
    u.id,
    'welcome',
    'Welcome to DoganHub Store!',
    'Thank you for joining DoganHub Store. Get started by exploring the dashboard.',
    '/en/dashboard'
FROM users u
WHERE u.email IN ('admin@doganhubstore.com', 'demo@doganhubstore.com')
ON CONFLICT DO NOTHING;
