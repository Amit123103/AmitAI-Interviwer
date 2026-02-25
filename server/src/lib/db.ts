import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Intelligent SQL Authority Connector
 * Handles standard postgres:// and Prisma prisma+postgres:// protocols
 */
const getDatabaseUrl = () => {
    const url = process.env.DATABASE_URL;
    if (!url) {
        // Silently skip — this project primarily uses MongoDB
        return undefined;
    }

    // 1. Check for Prisma-specific local dev proxy protocol
    if (url.startsWith('prisma+postgres://')) {
        console.log('[DB] SQL Authority: Prisma-protocol detected. Attempting translation...');

        // If it's a localhost Prisma proxy, we might need the underlying DB URL
        // In local environments, we'll try to fallback to standard PG if proxy fails,
        // but primarily we just strip the prisma+ prefix if we want to talk to the proxy.
        return url.replace('prisma+', '');
    }

    return url;
};

const connectionString = getDatabaseUrl();

const poolConfig: PoolConfig = {
    connectionString,
    // Add robustness for local development
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
};

// Enable SSL if not on localhost (typical for production/cloud)
if (connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) {
    poolConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = new Pool(poolConfig);

// Health check hook
pool.on('error', (err) => {
    console.error('[DB] SQL Authority Pool Error:', err.message);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
