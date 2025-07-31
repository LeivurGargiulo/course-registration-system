import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Only create database connection if DATABASE_URL is provided
let pool: Pool | null = null;
let db: any = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    db = drizzle(pool, { schema });
    console.log('Database connection configured for Supabase');
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    pool = null;
    db = null;
  }
} else {
  console.log('DATABASE_URL not found, database connection disabled');
}

export { pool, db };