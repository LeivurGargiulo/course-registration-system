import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('\n📝 Please set DATABASE_URL in your environment');
    process.exit(1);
  }

  console.log('🚀 Initializing database...');
  
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    });
    
    // Test connection
    console.log('📡 Testing database connection...');
    const result = await pool.query('SELECT version()');
    console.log('✅ Database connection successful!');
    console.log('📊 Database version:', result.rows[0].version.split(' ')[0]);
    
    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('users', 'courses', 'commissions', 'registrations', 'sessions')
    `);
    
    const tablesCount = parseInt(tablesResult.rows[0].count);
    
    if (tablesCount === 5) {
      console.log('✅ All database tables already exist');
      await pool.end();
      return;
    }
    
    console.log('🗄️  Creating database tables...');
    
    // Create sessions table for Replit Auth
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);
    `);
    console.log('✅ Sessions table created');
    
    // Create users table
    await pool.query(`
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
    console.log('✅ Users table created');
    
    // Create courses table
    await pool.query(`
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
    console.log('✅ Courses table created');
    
    // Create commissions table
    await pool.query(`
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
    console.log('✅ Commissions table created');
    
    // Create registrations table
    await pool.query(`
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
    console.log('✅ Registrations table created');
    
    // Add sample data
    console.log('📚 Adding sample course data...');
    
    const courseResult = await pool.query(`
      INSERT INTO courses (id, name, description, level, duration, total_weeks, start_date, is_active)
      VALUES 
        ('course-1', 'Maquetado Web Nivel I', 
         'Introducción al desarrollo web frontend con HTML, CSS y técnicas de diseño responsive. Aprenderás a crear sitios web modernos y accesibles desde cero.',
         'Principiante', '8 semanas', 8, '15 de marzo', true),
        ('course-2', 'JavaScript Intermedio',
         'Profundiza en JavaScript moderno con ES6+, manejo del DOM, APIs y conceptos avanzados de programación funcional.',
         'Intermedio', '10 semanas', 10, '1 de abril', true),
        ('course-3', 'React Avanzado',
         'Construcción de aplicaciones complejas con React, hooks, context API, y herramientas del ecosistema moderno.',
         'Avanzado', '12 semanas', 12, '15 de abril', true)
      ON CONFLICT (id) DO NOTHING
      RETURNING id;
    `);
    
    if (courseResult.rows.length > 0) {
      console.log('✅ Sample courses added');
      
      await pool.query(`
        INSERT INTO commissions (id, course_id, code, days, time, instructor, max_capacity, start_date, is_active)
        VALUES 
          ('comm-1', 'course-1', 'A001', 'Lunes y Miércoles', '18:00 - 20:00', 'Prof. Alex García', 20, '15 de marzo', true),
          ('comm-2', 'course-1', 'A002', 'Martes y Jueves', '19:00 - 21:00', 'Prof. Sam López', 20, '16 de marzo', true),
          ('comm-3', 'course-1', 'A003', 'Sábados', '10:00 - 14:00', 'Prof. Jordan Rivera', 15, '18 de marzo', true),
          ('comm-4', 'course-2', 'B001', 'Lunes y Miércoles', '19:00 - 21:00', 'Prof. Casey Torres', 18, '1 de abril', true),
          ('comm-5', 'course-2', 'B002', 'Martes y Jueves', '18:00 - 20:00', 'Prof. Riley Chen', 18, '2 de abril', true),
          ('comm-6', 'course-3', 'C001', 'Miércoles y Viernes', '19:00 - 21:00', 'Prof. Morgan Silva', 15, '15 de abril', true)
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('✅ Sample commissions added');
    } else {
      console.log('ℹ️  Sample data already exists');
    }
    
    // Verify tables
    const finalTablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Database tables created:');
    finalTablesResult.rows.forEach(row => {
      console.log('  ✓', row.table_name);
    });
    
    await pool.end();
    console.log('\n🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔑 Authentication failed. Please check your DATABASE_URL');
    } else if (error.message.includes('connection')) {
      console.log('\n🔗 Connection failed. Please verify your DATABASE_URL and network');
    }
    
    process.exit(1);
  }
}

initializeDatabase().catch(console.error);