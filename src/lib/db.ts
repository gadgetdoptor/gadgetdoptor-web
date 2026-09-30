import 'dotenv/config';
import { Pool, neon } from '@neondatabase/serverless';
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

/**
 * `db` uses neon-serverless (WebSocket/Pool). This enables full transactional
 * support (db.transaction) with interactivity, required for writes like
 * order creation and inventory management.
 *
 * `dbRead` uses neon-http (stateless, single HTTP request per query). It has
 * no persistent connection to drop or go stale between invocations, so it's
 * used for plain reads (see lib/data.ts) to avoid the intermittent empty
 * results caused by the WebSocket pool losing its connection between warm
 * serverless invocations.
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzleServerless(pool, { schema });

const sql = neon(process.env.DATABASE_URL);
export const dbRead = drizzleHttp(sql, { schema });