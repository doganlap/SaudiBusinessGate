/**
 * Database Configuration
 * Centralized database connection settings for PostgreSQL
 */

export const databaseConfig = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'doganhubstore',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: false,
    max: 20, // connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  
  production: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 50,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
  
  test: {
    host: 'localhost',
    port: 5433,
    database: 'doganhubstore_test',
    user: 'postgres',
    password: 'postgres',
    ssl: false,
    max: 5,
  },
};

export const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return databaseConfig[env as keyof typeof databaseConfig] || databaseConfig.development;
};

export default getDatabaseConfig;
