import { Pool } from 'pg';

const dbPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'production',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

export default dbPool;