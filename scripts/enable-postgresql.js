import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure neon for serverless
neonConfig.webSocketConstructor = ws;

async function enablePostgreSQL() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Testing PostgreSQL connection...');
  
  try {
    const pool = new Pool({ connectionString: databaseUrl });
    const db = drizzle({ client: pool, schema: {} });
    
    // Test connection
    const result = await pool.query('SELECT version()');
    console.log('✅ PostgreSQL connection successful');
    console.log('Database version:', result.rows[0].version);
    
    // Check if tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Existing tables:');
    tables.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    // Update storage.ts to use DatabaseStorage
    const storagePath = path.join(__dirname, '..', 'server', 'storage.ts');
    let storageContent = fs.readFileSync(storagePath, 'utf8');
    
    if (storageContent.includes('export const storage = new MemStorage()')) {
      storageContent = storageContent.replace(
        'export const storage = new MemStorage()',
        'export const storage = new DatabaseStorage()'
      );
      
      fs.writeFileSync(storagePath, storageContent);
      console.log('✅ Updated storage.ts to use DatabaseStorage');
    } else {
      console.log('ℹ️  Storage already configured for DatabaseStorage');
    }
    
    await pool.end();
    console.log('\n🎉 PostgreSQL has been successfully enabled!');
    console.log('Please restart the server to apply changes.');
    
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    console.log('\n📝 Keeping in-memory storage as fallback...');
    
    // Ensure storage.ts uses MemStorage on failure
    const storagePath = path.join(__dirname, '..', 'server', 'storage.ts');
    let storageContent = fs.readFileSync(storagePath, 'utf8');
    
    if (storageContent.includes('export const storage = new DatabaseStorage()')) {
      storageContent = storageContent.replace(
        'export const storage = new DatabaseStorage()',
        'export const storage = new MemStorage()'
      );
      
      fs.writeFileSync(storagePath, storageContent);
      console.log('✅ Reverted to MemStorage due to connection issues');
    }
    
    process.exit(1);
  }
}

enablePostgreSQL().catch(console.error);