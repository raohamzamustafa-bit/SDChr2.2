import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

/** Set the current tenant for RLS policies on a specific client connection */
export async function setTenantContext(client: pg.PoolClient, tenantId: string): Promise<void> {
  await client.query(`SET app.current_tenant = '${tenantId}'`);
}

/** Execute a query within a tenant context (uses RLS) */
export async function withTenant<T>(
  tenantId: string,
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await setTenantContext(client, tenantId);
    return await callback(client);
  } finally {
    client.release();
  }
}

/** Execute a raw query */
export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

export default pool;
