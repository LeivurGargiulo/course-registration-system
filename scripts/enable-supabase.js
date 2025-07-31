import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function enableSupabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('\n📝 Please add your Supabase connection string to Replit Secrets:');
    console.log('1. Go to Secrets tab in Replit');
    console.log('2. Add key: DATABASE_URL');
    console.log('3. Add value: your Supabase connection string');
    console.log('\nSee docs/supabase-setup.md for detailed instructions.');
    process.exit(1);
  }

  console.log('🚀 Testing Supabase connection...');
  
  try {
    const pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });
    
    // Test connection
    console.log('📡 Connecting to Supabase...');
    const result = await pool.query('SELECT version()');
    console.log('✅ Supabase connection successful!');
    console.log('📊 Database version:', result.rows[0].version.split(' ')[0]);
    
    // Create tables if they don't exist
    console.log('\n🗄️  Setting up database tables...');
    
    await pool.query(`
      -- Create sessions table for Replit Auth
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);
    `);
    console.log('✅ Sessions table ready');
    
    await pool.query(`
      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Users table ready');
    
    await pool.query(`
      -- Create courses table
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        level TEXT NOT NULL,
        duration TEXT NOT NULL,
        total_weeks INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Courses table ready');
    
    await pool.query(`
      -- Create commissions table
      CREATE TABLE IF NOT EXISTS commissions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id VARCHAR NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        code TEXT NOT NULL UNIQUE,
        days TEXT NOT NULL,
        time TEXT NOT NULL,
        instructor TEXT NOT NULL,
        max_capacity INTEGER DEFAULT 20,
        current_enrollment INTEGER DEFAULT 0,
        start_date TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        cancel_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Commissions table ready');
    
    await pool.query(`
      -- Create registrations table
      CREATE TABLE IF NOT EXISTS registrations (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id VARCHAR NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        commission_id VARCHAR NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
        full_name TEXT NOT NULL,
        pronouns TEXT NOT NULL,
        email TEXT NOT NULL,
        discord_username TEXT NOT NULL,
        community_affiliation TEXT NOT NULL,
        data_consent BOOLEAN DEFAULT false,
        newsletter BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Registrations table ready');
    
    // Add sample data
    console.log('\n📚 Adding sample course data...');
    
    const courseResult = await pool.query(`
      INSERT INTO courses (id, name, description, level, duration, total_weeks, start_date, is_active)
      VALUES ('course-1', 'Maquetado Web Nivel I', 
              'Introducción al desarrollo web frontend con HTML, CSS y técnicas de diseño responsive. Aprenderás a crear sitios web modernos y accesibles desde cero.',
              'Principiante', '8 semanas', 8, '15 de marzo', true)
      ON CONFLICT (id) DO NOTHING
      RETURNING id;
    `);
    
    if (courseResult.rows.length > 0) {
      console.log('✅ Sample course added');
      
      await pool.query(`
        INSERT INTO commissions (id, course_id, code, days, time, instructor, max_capacity, start_date, is_active)
        VALUES 
          ('comm-1', 'course-1', 'A001', 'Lunes y Miércoles', '18:00 - 20:00', 'Prof. Alex García', 20, '15 de marzo', true),
          ('comm-2', 'course-1', 'A002', 'Martes y Jueves', '19:00 - 21:00', 'Prof. Sam López', 20, '16 de marzo', true),
          ('comm-3', 'course-1', 'A003', 'Sábados', '10:00 - 14:00', 'Prof. Jordan Rivera', 15, '18 de marzo', true)
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('✅ Sample commissions added');
    } else {
      console.log('ℹ️  Sample data already exists');
    }
    
    // Check tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Database tables created:');
    tables.rows.forEach(row => {
      console.log('  ✓', row.table_name);
    });
    
    // Update storage.ts to use DatabaseStorage
    console.log('\n🔧 Switching to Supabase database storage...');
    const storagePath = path.join(__dirname, '..', 'server', 'storage.ts');
    let storageContent = fs.readFileSync(storagePath, 'utf8');
    
    if (storageContent.includes('export const storage = new MemStorage()')) {
      storageContent = storageContent.replace(
        'export const storage = new MemStorage()',
        'export const storage = new DatabaseStorage()'
      );
      
      fs.writeFileSync(storagePath, storageContent);
      console.log('✅ Updated storage to use Supabase');
    } else {
      console.log('ℹ️  Storage already configured for DatabaseStorage');
    }
    
    await pool.end();
    console.log('\n🎉 Supabase has been successfully enabled!');
    console.log('🔄 Please restart your application to apply changes:');
    console.log('   npm run dev');
    console.log('\n📊 You can now view your data in the Supabase dashboard.');
    
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔑 Authentication failed. Please check:');
      console.log('1. Your DATABASE_URL secret is correctly set');
      console.log('2. You replaced [YOUR-PASSWORD] with your actual password');
      console.log('3. The password matches what you set in Supabase');
    } else if (error.message.includes('server signature')) {
      console.log('\n🔗 Connection format issue. Please ensure:');
      console.log('1. You are using the "Transaction pooler" connection string');
      console.log('2. The URL format is correct');
    } else {
      console.log('\n🔧 Connection troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the Supabase project is active');
      console.log('3. Try regenerating the database password in Supabase');
    }
    
    console.log('\n📖 See docs/supabase-setup.md for detailed setup instructions.');
    
    // Ensure storage.ts uses MemStorage on failure
    const storagePath = path.join(__dirname, '..', 'server', 'storage.ts');
    let storageContent = fs.readFileSync(storagePath, 'utf8');
    
    if (storageContent.includes('export const storage = new DatabaseStorage()')) {
      storageContent = storageContent.replace(
        'export const storage = new DatabaseStorage()',
        'export const storage = new MemStorage()'
      );
      
      fs.writeFileSync(storagePath, storageContent);
      console.log('🔄 Reverted to in-memory storage due to connection issues');
    }
    
    process.exit(1);
  }
}

enableSupabase().catch(console.error);