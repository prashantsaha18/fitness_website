import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL environment variable is not set");
    pool = new Pool({
      connectionString: url,
      ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const res = await client.query(sql, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

let tablesEnsured = false;

export async function ensureTables(): Promise<void> {
  if (tablesEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS classifications (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      physique_type TEXT NOT NULL,
      confidence REAL NOT NULL,
      body_metrics JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
  await query(`ALTER TABLE classifications ADD COLUMN IF NOT EXISTS user_id TEXT`);
  await query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      display_name TEXT,
      height REAL,
      weight REAL,
      age INTEGER,
      gender TEXT,
      fitness_goal TEXT,
      fitness_level TEXT,
      physique_type TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS body_measurements (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      weight REAL,
      waist REAL,
      chest REAL,
      arms REAL,
      hips REAL,
      neck REAL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS fitness_goals (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      goal_type TEXT NOT NULL,
      title TEXT NOT NULL,
      target_value REAL,
      current_value REAL,
      unit TEXT,
      deadline TIMESTAMP,
      completed BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
  tablesEnsured = true;
}

export { ensureTables as ensureTable };
